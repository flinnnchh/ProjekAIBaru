import { useState, useEffect, useRef, useCallback } from 'react';
import { BotState, MeetingPlatform, ScheduledMeeting, MeetingHistory } from '../types/meeting';
import { TranscriptItem } from '../types/transcript';
import { TranscribeMode } from '../components/live/TranscribeModePicker';
import { storageService } from '../services/storageService';
import { exportToDocx } from '../services/exportDocx';
import { exportToTxt } from '../services/exportTxt';
import { initSocket, getSocket, isSocketConnected } from '../services/socketClient';
import { createMeetingHistoryItem, filterAndDeduplicateParticipants } from '../utils/historyHelper';

export function useMeetingBot(userId?: string) {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform>('');
  const [language, setLanguage] = useState<'id' | 'en' | ''>('');
  const [botState, setBotState] = useState<BotState>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioActive, setAudioActive] = useState(false);
  const [vpnConnected] = useState(true);
  const [vpnIp] = useState('10.24.0.12');
  const [meetingStartTime, setMeetingStartTime] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [interimText, setInterimText] = useState('');
  const [interimSpeaker, setInterimSpeaker] = useState('Speaker 1');
  const [interimLanguage, setInterimLanguage] = useState<'id' | 'en' | 'mixed'>('id');

  const [schedules, setSchedules] = useState<ScheduledMeeting[]>([]);
  const [history, setHistory] = useState<MeetingHistory[]>([]);
  const [isClosureOpen, setIsClosureOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [transcribeMode, setTranscribeMode] = useState<TranscribeMode | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ step: number; message: string }>({ step: 1, message: '' });
  const timerRef = useRef<number | null>(null);
  const autoRecordOnStandbyRef = useRef<boolean>(false);
  const activeScheduleIdRef = useRef<string | null>(null);
  const transcribeModeRef = useRef<TranscribeMode | null>(null);
  const fallbackTranscriptsRef = useRef<TranscriptItem[]>([]);

  useEffect(() => {
    transcribeModeRef.current = transcribeMode;
  }, [transcribeMode]);

  const audioDecayTimerRef = useRef<number | null>(null);

  const pulseAudioActivity = useCallback(() => {
    setAudioActive(true);
    if (audioDecayTimerRef.current) {
      window.clearTimeout(audioDecayTimerRef.current);
    }
    audioDecayTimerRef.current = window.setTimeout(() => {
      setAudioActive(false);
    }, 1500);
  }, []);

  // Inisialisasi Socket & Storage (MongoDB) setelah user login
  useEffect(() => {
    if (!userId) return;

    // Ambil data awal dari server MongoDB
    storageService.fetchSchedules().then((schs) => setSchedules(schs));
    storageService.fetchHistory().then((hists) => setHistory(hists));

    initSocket(
      (newTranscript) => {
        // Suara terdengar dan menghasilkan transkrip -> aktifkan visualizer audio
        pulseAudioActivity();

        // Pertahankan format speaker sebagai 'Speaker 1', 'Speaker 2', dst. sesuai deteksi Deepgram Nova-2
        let currentSpeaker = (newTranscript.speaker || '').trim();
        const match = currentSpeaker.match(/^Speaker\s*(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          currentSpeaker = `Speaker ${num === 0 ? 1 : num}`;
        } else if (!currentSpeaker) {
          currentSpeaker = 'Speaker 1';
        }

        const mappedTranscript: TranscriptItem = {
          ...newTranscript,
          speaker: currentSpeaker,
        };

        // Track speaker as participant (filtered)
        if (mappedTranscript.speaker) {
          const cleaned = filterAndDeduplicateParticipants([mappedTranscript.speaker]);
          if (cleaned.length > 0) {
            setParticipants((prev: string[]) => filterAndDeduplicateParticipants([...prev, ...cleaned]));
          }
        }

        // Selalu simpan di buffer fallback sebagai jaring pengaman
        if (mappedTranscript.isFinal) {
          if (!fallbackTranscriptsRef.current.some((p: TranscriptItem) => p.id === mappedTranscript.id)) {
            fallbackTranscriptsRef.current.push(mappedTranscript);
          }
        }

        // Jika mode background aktif, abaikan live streaming update ke UI
        if (transcribeModeRef.current === 'background') {
          return;
        }

        if (!mappedTranscript.isFinal) {
          // Interim realtime stream
          setInterimText(mappedTranscript.text);
          setInterimSpeaker(mappedTranscript.speaker);
          setInterimLanguage(mappedTranscript.language || 'en');
        } else {
          // Final confirmed transcript
          setTranscripts((prev: TranscriptItem[]) => {
            // Hindari duplikasi jika id sudah ada
            if (prev.some((p: TranscriptItem) => p.id === mappedTranscript.id)) return prev;
            return [...prev, mappedTranscript];
          });
          setInterimText('');
        }
      },
      (newState) => {
        setBotState(newState);
      },
      (active) => {
        if (active) {
          pulseAudioActivity();
        } else {
          setAudioActive(false);
        }
      },
      // Batch processing progress callback
      (step, message) => {
        setBatchProgress({ step, message });
      },
      // Batch result callback
      (data) => {
        handleBatchResultRef.current?.(data);
      },
      undefined,
      // Participants update callback
      (data) => {
        if (data && Array.isArray(data.participants)) {
          setParticipants(filterAndDeduplicateParticipants(data.participants));
        }
      }
    );
  }, [userId]);



  // 🕒 AUTO-SCHEDULER ENGINE: Memeriksa jadwal setiap 2 detik & otomatis join ketika waktu tiba
  useEffect(() => {
    const checkScheduleInterval = setInterval(() => {
      if (botState !== 'IDLE') return;

      const now = Date.now();
      const allSchedules = storageService.getSchedules();

      // Cari jadwal yang statusnya UPCOMING dan waktunya sudah tiba (<= now) dan tidak lebih dari 30 menit lalu
      const dueSchedule = allSchedules.find((s) => {
        if (s.status !== 'UPCOMING') return false;
        const time = new Date(s.scheduledTime).getTime();
        return time <= now && time >= now - 30 * 60 * 1000;
      });

      if (dueSchedule) {
        console.log(`[Auto-Scheduler] ⏰ Waktunya tiba untuk jadwal: "${dueSchedule.title}". Memulai bot otomatis...`);
        
        // Update status jadwal menjadi IN_PROGRESS
        activeScheduleIdRef.current = dueSchedule.id;
        storageService.updateSchedule(dueSchedule.id, { status: 'IN_PROGRESS' });
        setSchedules(storageService.getSchedules());

        // Update state meeting
        setMeetingTitle(dueSchedule.title);
        setMeetingUrl(dueSchedule.url);
        setPlatform(dueSchedule.platform);
        if (dueSchedule.language) {
          setLanguage(dueSchedule.language);
        }
        
        if (dueSchedule.autoRecord) {
          autoRecordOnStandbyRef.current = true;
        }

        setActiveNotification(`⏰ Waktu Jadwal Tiba: "${dueSchedule.title}". Bot otomatis bergabung ke meeting...`);

        // Mulai proses join
        setBotState('JOINING');
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('bot_join', {
            url: dueSchedule.url,
            platform: dueSchedule.platform,
            title: dueSchedule.title
          });
        }
      }
    }, 2000);

    return () => clearInterval(checkScheduleInterval);
  }, [botState]);

  // Timer ticker selama status RECORDING
  useEffect(() => {
    if (botState === 'RECORDING') {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev: number) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [botState]);

  // Otomatis rekam jika jadwal mengaktifkan Auto-Record dan bot sudah siap di room (IN_ROOM_STANDBY)
  useEffect(() => {
    if (botState === 'IN_ROOM_STANDBY' && autoRecordOnStandbyRef.current) {
      autoRecordOnStandbyRef.current = false;
      console.log('[Auto-Scheduler] 🔴 Otomatis memulai perekaman (Auto-Record aktif)...');
      setTimeout(() => {
        const socket = getSocket();
        if (socket && socket.connected) {
          setBotState('RECORDING');
          socket.emit('bot_record', { language });
        }
      }, 1500);
    }
  }, [botState, language]);

  // Aksi: 1. JOIN
  const handleJoin = useCallback(() => {
    if (!meetingUrl) return;
    setTranscripts([]);
    setInterimText('');
    setElapsedSeconds(0);
    setParticipants([]);
    const nowIso = new Date().toISOString();
    setMeetingStartTime(nowIso);
    fallbackTranscriptsRef.current = [];
    setBotState('JOINING');

    // Update matching schedule to IN_PROGRESS
    const currentSchedules = storageService.getSchedules();
    const matching = currentSchedules.find((s) => s.url === meetingUrl);
    if (matching) {
      activeScheduleIdRef.current = matching.id;
      storageService.updateSchedule(matching.id, { status: 'IN_PROGRESS' });
      setSchedules(storageService.getSchedules());
    }

    const effectivePlatform = platform || (meetingUrl.includes('zoom.us') ? 'zoom' : meetingUrl.includes('teams') ? 'teams' : 'gmeet');
    const effectiveTitle = meetingTitle || 'Sesi Meeting Live';

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[Frontend] Mengirim sinyal bot_join ke backend server...');
      socket.emit('bot_join', { url: meetingUrl, platform: effectivePlatform, title: effectiveTitle });
    } else {
      console.warn('[Frontend] Socket belum terhubung ke backend server port 3001.');
      // Standalone fallback
      setTimeout(() => {
        setBotState('IN_ROOM_STANDBY');
      }, 1500);
    }
  }, [meetingUrl, platform, meetingTitle]);

  // Aksi: 2. RECORD
  const handleRecord = useCallback(() => {
    if (botState !== 'IN_ROOM_STANDBY') return;
    setElapsedSeconds(0);
    setTranscripts([]);
    setInterimText('');
    if (!meetingStartTime) {
      setMeetingStartTime(new Date().toISOString());
    }
    fallbackTranscriptsRef.current = [];
    setBotState('RECORDING');

    const effectiveLanguage = language || 'id';
    const effectiveMode = transcribeMode || 'live';

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log(`[Frontend] Mengirim sinyal bot_record (Mode: ${effectiveMode}, Language: ${effectiveLanguage}) ke backend...`);
      socket.emit('bot_record', { language: effectiveLanguage, mode: effectiveMode });
    }
  }, [botState, language, transcribeMode, meetingStartTime]);

  // Aksi: 3. PAUSE / RESUME
  const handlePauseResume = useCallback(() => {
    const socket = getSocket();
    if (botState === 'RECORDING') {
      setBotState('PAUSED');
      setAudioActive(false);
      setInterimText('');
      // Kirim sinyal pause ke backend agar Deepgram berhenti menerima audio
      if (socket && socket.connected) {
        console.log('[Frontend] Mengirim sinyal bot_pause ke backend...');
        socket.emit('bot_pause');
      }
    } else if (botState === 'PAUSED') {
      setBotState('RECORDING');
      // Kirim sinyal resume ke backend agar Deepgram melanjutkan penerimaan audio
      if (socket && socket.connected) {
        console.log('[Frontend] Mengirim sinyal bot_resume ke backend...');
        socket.emit('bot_resume');
      }
    }
  }, [botState]);

  // Ref untuk batch result handler (agar bisa diakses dari useEffect initSocket)
  const handleBatchResultRef = useRef<((data: { success: boolean; transcripts: TranscriptItem[]; participants?: string[]; presenter?: string }) => void) | null>(null);

  // Handler batch result
  const handleBatchResult = useCallback((data: { success: boolean; transcripts: TranscriptItem[]; participants?: string[]; presenter?: string }) => {
    setIsProcessingBatch(false);
    setInterimText('');

    // Jika mode live dan kita sudah memiliki transkrip live yang terkonfirmasi (seperti nama & kata yang sudah benar dilihat user saat rapat),
    // pertahankan transkrip live tersebut agar nama orang dan susunan kalimat tidak bermutasi/terdistorsi saat stop & save.
    const isLiveMode = transcribeModeRef.current === 'live' || !transcribeModeRef.current;
    const hasLiveTranscripts = transcripts.length > 0 || fallbackTranscriptsRef.current.length > 0;

    let sourceTranscripts: TranscriptItem[];
    if (isLiveMode && hasLiveTranscripts) {
      sourceTranscripts = transcripts.length > 0 ? transcripts : fallbackTranscriptsRef.current;
      console.log(`[useMeetingBot] Mode Live: Mempertahankan ${sourceTranscripts.length} entri transkrip live yang sudah terkonfirmasi.`);
    } else if (data.success && data.transcripts.length > 0) {
      sourceTranscripts = data.transcripts;
      console.log(`[useMeetingBot] Mode Background / Fallback: Menggunakan ${sourceTranscripts.length} entri transkrip hasil batch.`);
    } else {
      sourceTranscripts = transcripts.length > 0 ? transcripts : fallbackTranscriptsRef.current;
    }

    const rawTranscripts = sourceTranscripts;

    let verifiedParticipants = data.participants && data.participants.length > 0
      ? filterAndDeduplicateParticipants(data.participants)
      : filterAndDeduplicateParticipants(participants);

    // Jika presenter terdeteksi (sedang share screen), pastikan presenter berada di index 0
    if (data.presenter) {
      const cleanedPres = data.presenter.trim();
      const pIdx = verifiedParticipants.findIndex(p => p.toLowerCase() === cleanedPres.toLowerCase());
      if (pIdx > 0) {
        const [pres] = verifiedParticipants.splice(pIdx, 1);
        verifiedParticipants.unshift(pres);
      } else if (pIdx === -1) {
        verifiedParticipants.unshift(cleanedPres);
      }
    }

    setParticipants(verifiedParticipants);

    // Pertahankan label pembicara 'Speaker 1', 'Speaker 2', dst. sesuai deteksi Deepgram Nova-2
    const finalTranscripts = rawTranscripts.map((t: TranscriptItem) => {
      let spk = (t.speaker || '').trim();
      const match = spk.match(/^Speaker\s*(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        spk = `Speaker ${num === 0 ? 1 : num}`;
      } else if (!spk) {
        spk = 'Speaker 1';
      }

      return {
        ...t,
        speaker: spk,
      };
    });

    setTranscripts(finalTranscripts);

    // Simpan ke Riwayat
    const newHistoryItem = createMeetingHistoryItem({
      title: meetingTitle,
      platform,
      url: meetingUrl,
      date: meetingStartTime || new Date().toISOString(),
      elapsedSeconds,
      transcripts: finalTranscripts,
      participants: verifiedParticipants,
    });

    storageService.saveHistoryItem(newHistoryItem);
    setHistory(storageService.getHistory());
    setBotState('IN_ROOM_STANDBY');
    setIsClosureOpen(true);
  }, [transcripts, meetingTitle, platform, meetingUrl, meetingStartTime, elapsedSeconds, participants]);



  // Update ref setiap kali handleBatchResult berubah
  useEffect(() => {
    handleBatchResultRef.current = handleBatchResult;
  }, [handleBatchResult]);

  // Aksi: 4. STOP & SAVE (sekarang memicu batch processing)
  const handleStop = useCallback(() => {
    if (botState !== 'RECORDING' && botState !== 'PAUSED') return;
    setIsProcessingBatch(true);
    setBatchProgress({ step: 1, message: 'Menganalisis gelombang audio & mengenali pembicara...' });

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[Frontend] Mengirim sinyal bot_stop ke backend (akan memicu batch processing)...');
      socket.emit('bot_stop', { language });
    } else {
      // Standalone fallback: langsung selesai tanpa batch
      setIsProcessingBatch(false);
      setBotState('IN_ROOM_STANDBY');

      const finalTranscripts = transcripts.map((t: TranscriptItem) => {
        let spk = (t.speaker || '').trim();
        const match = spk.match(/^Speaker\s*(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          spk = `Speaker ${num === 0 ? 1 : num}`;
        } else if (!spk) {
          spk = 'Speaker 1';
        }
        return { ...t, speaker: spk };
      });

      const newHistoryItem = createMeetingHistoryItem({
        title: meetingTitle,
        platform,
        url: meetingUrl,
        date: meetingStartTime || new Date().toISOString(),
        elapsedSeconds,
        transcripts: finalTranscripts,
        participants,
      });

      storageService.saveHistoryItem(newHistoryItem);
      setHistory(storageService.getHistory());
      setIsClosureOpen(true);
    }
  }, [botState, transcripts, meetingTitle, platform, meetingUrl, meetingStartTime, elapsedSeconds, language, participants]);

  // Aksi: 5. LEAVE ROOM (DISCONNECT)
  const handleLeave = useCallback(() => {
    console.log('[Frontend] Mengirim sinyal bot_leave ke backend untuk mematikan browser...');
    setBotState('IDLE');
    setElapsedSeconds(0);
    setAudioActive(false);
    setInterimText('');
    setTranscripts([]);
    fallbackTranscriptsRef.current = [];
    setTranscribeMode(null);
    setMeetingStartTime('');
    setParticipants([]);

    // Update status jadwal menjadi COMPLETED jika bot keluar dari room
    if (activeScheduleIdRef.current) {
      storageService.updateSchedule(activeScheduleIdRef.current, { status: 'COMPLETED' });
      setSchedules(storageService.getSchedules());
      activeScheduleIdRef.current = null;
    } else if (meetingUrl) {
      const currentSchedules = storageService.getSchedules();
      const matching = currentSchedules.find(
        (s) => s.url === meetingUrl && (s.status === 'IN_PROGRESS' || s.status === 'UPCOMING')
      );
      if (matching) {
        storageService.updateSchedule(matching.id, { status: 'COMPLETED' });
        setSchedules(storageService.getSchedules());
      }
    }

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('bot_leave');
    }
  }, [meetingUrl]);

  const handleExportDocx = useCallback(() => {
    exportToDocx(
      {
        title: meetingTitle,
        platform,
        url: meetingUrl,
        startTime: meetingStartTime,
        date: meetingStartTime || new Date().toISOString(),
        elapsedSeconds,
        vpnIp,
        participants,
      },
      transcripts
    );
  }, [meetingTitle, platform, meetingUrl, meetingStartTime, elapsedSeconds, vpnIp, participants, transcripts]);

  const handleExportTxt = useCallback(() => {
    exportToTxt(
      {
        title: meetingTitle,
        platform,
        url: meetingUrl,
        startTime: meetingStartTime,
        date: meetingStartTime || new Date().toISOString(),
        elapsedSeconds,
        vpnIp,
        participants,
      },
      transcripts
    );
  }, [meetingTitle, platform, meetingUrl, meetingStartTime, elapsedSeconds, vpnIp, participants, transcripts]);

  const handleAddSchedule = useCallback(async (schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => {
    await storageService.addSchedule(schedule);
    setSchedules([...storageService.getSchedules()]);
  }, []);

  const handleDeleteSchedule = useCallback(async (id: string) => {
    await storageService.deleteSchedule(id);
    setSchedules([...storageService.getSchedules()]);
  }, []);

  const handleDeleteHistoryItem = useCallback(async (id: string) => {
    await storageService.deleteHistoryItem(id);
    setHistory([...storageService.getHistory()]);
  }, []);

  const handleStartSessionFromSchedule = useCallback((schedule: ScheduledMeeting, autoJoin: boolean = true) => {
    activeScheduleIdRef.current = schedule.id;
    storageService.updateSchedule(schedule.id, { status: 'IN_PROGRESS' });
    setSchedules(storageService.getSchedules());

    setMeetingTitle(schedule.title);
    setMeetingUrl(schedule.url);
    setPlatform(schedule.platform);
    if (schedule.language) {
      setLanguage(schedule.language);
    }
    if (schedule.autoRecord) {
      autoRecordOnStandbyRef.current = true;
    }
    if (autoJoin) {
      setBotState('JOINING');
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('bot_join', {
          url: schedule.url,
          platform: schedule.platform,
          title: schedule.title
        });
      }
    }
  }, []);

  // Aksi: Bersihkan Transkrip
  const handleClearTranscripts = useCallback(() => {
    setTranscripts([]);
    setInterimText('');
  }, []);


  return {
    meetingUrl,
    setMeetingUrl,
    meetingTitle,
    setMeetingTitle,
    platform,
    setPlatform,
    language,
    setLanguage,
    botState,
    elapsedSeconds,
    meetingStartTime,
    participants,
    audioActive,
    vpnConnected,
    vpnIp,
    transcripts,
    interimText,
    interimSpeaker,
    interimLanguage,
    transcribeMode,
    setTranscribeMode,
    isProcessingBatch,
    batchProgress,
    schedules,
    history,
    isClosureOpen,
    setIsClosureOpen,
    activeNotification,
    setActiveNotification,
    handleJoin,
    handleRecord,
    handlePauseResume,
    handleStop,
    handleLeave,
    handleExportDocx,
    handleExportTxt,
    handleClearTranscripts,
    handleAddSchedule,
    handleDeleteSchedule,
    handleDeleteHistoryItem,
    handleStartSessionFromSchedule
  };
}


