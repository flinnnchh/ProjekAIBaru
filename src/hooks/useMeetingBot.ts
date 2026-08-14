import { useState, useEffect, useRef, useCallback } from 'react';
import { BotState, MeetingPlatform, ScheduledMeeting, MeetingHistory } from '../types/meeting';
import { TranscriptItem } from '../types/transcript';
import { storageService } from '../services/storageService';
import { exportToDocx } from '../services/exportDocx';
import { exportToTxt } from '../services/exportTxt';
import { initSocket, getSocket, isSocketConnected } from '../services/socketClient';

export function useMeetingBot() {
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/jpj-ndpm-fzb');
  const [meetingTitle, setMeetingTitle] = useState('Sesi Google Meet Live');
  const [platform, setPlatform] = useState<MeetingPlatform>('gmeet');
  const [language, setLanguage] = useState<'id' | 'en'>('en');
  const [botState, setBotState] = useState<BotState>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioActive, setAudioActive] = useState(false);
  const [vpnConnected] = useState(true);
  const [vpnIp] = useState('10.24.0.12 (VPC Private)');

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [interimText, setInterimText] = useState('');
  const [interimSpeaker, setInterimSpeaker] = useState('Speaker 1');
  const [interimLanguage, setInterimLanguage] = useState<'id' | 'en' | 'mixed'>('en');

  const [schedules, setSchedules] = useState<ScheduledMeeting[]>([]);
  const [history, setHistory] = useState<MeetingHistory[]>([]);
  const [isClosureOpen, setIsClosureOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoRecordOnStandbyRef = useRef<boolean>(false);

  // Inisialisasi Socket & Storage
  useEffect(() => {
    setSchedules(storageService.getSchedules());
    setHistory(storageService.getHistory());

    initSocket(
      (newTranscript) => {
        if (!newTranscript.isFinal) {
          // Interim realtime stream
          setInterimText(newTranscript.text);
          setInterimSpeaker(newTranscript.speaker);
          setInterimLanguage(newTranscript.language || 'en');
        } else {
          // Final confirmed transcript
          setTranscripts((prev) => {
            // Hindari duplikasi jika id sudah ada
            if (prev.some((p) => p.id === newTranscript.id)) return prev;
            return [...prev, newTranscript];
          });
          setInterimText('');
        }
      },
      (newState) => {
        setBotState(newState);
      },
      (active) => {
        setAudioActive(active);
      }
    );
  }, []);

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
        storageService.updateSchedule(dueSchedule.id, { status: 'IN_PROGRESS' });
        setSchedules(storageService.getSchedules());

        // Update state meeting
        setMeetingTitle(dueSchedule.title);
        setMeetingUrl(dueSchedule.url);
        setPlatform(dueSchedule.platform);
        
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
        setElapsedSeconds((prev) => prev + 1);
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
    setBotState('JOINING');

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[Frontend] Mengirim sinyal bot_join ke backend server...');
      socket.emit('bot_join', { url: meetingUrl, platform, title: meetingTitle });
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
    setBotState('RECORDING');

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log(`[Frontend] Mengirim sinyal bot_record (Language: ${language}) ke backend...`);
      socket.emit('bot_record', { language });
    }
  }, [botState, language]);

  // Aksi: 3. PAUSE / RESUME
  const handlePauseResume = useCallback(() => {
    if (botState === 'RECORDING') {
      setBotState('PAUSED');
      setAudioActive(false);
    } else if (botState === 'PAUSED') {
      setBotState('RECORDING');
    }
  }, [botState]);

  // Aksi: 4. STOP & SAVE
  const handleStop = useCallback(() => {
    if (botState !== 'RECORDING' && botState !== 'PAUSED') return;
    setBotState('IN_ROOM_STANDBY');

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[Frontend] Mengirim sinyal bot_stop ke backend...');
      socket.emit('bot_stop');
    }

    // Simpan ke Riwayat
    const totalWords = transcripts.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0);
    const uniqueSpeakers = Array.from(new Set(transcripts.map((t) => t.speaker))).length;

    const newHistoryItem: MeetingHistory = {
      id: `hist-${Date.now()}`,
      title: meetingTitle || 'Sesi Meeting Live',
      platform,
      url: meetingUrl,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      totalWords,
      speakersCount: uniqueSpeakers || 1,
      languages: ['id', 'en', 'mixed'],
      transcriptSnippet: transcripts[0]?.text || 'Sesi transkrip meeting tersimpan.',
      transcripts: transcripts.map((t) => ({
        id: t.id,
        speaker: t.speaker,
        timestamp: t.timestamp,
        text: t.text,
        language: t.language
      }))
    };

    storageService.saveHistoryItem(newHistoryItem);
    setHistory(storageService.getHistory());
    setIsClosureOpen(true);
  }, [botState, transcripts, meetingTitle, platform, meetingUrl, elapsedSeconds]);

  // Aksi: 5. LEAVE ROOM (DISCONNECT)
  const handleLeave = useCallback(() => {
    console.log('[Frontend] Mengirim sinyal bot_leave ke backend untuk mematikan browser...');
    setBotState('IDLE');
    setElapsedSeconds(0);
    setAudioActive(false);
    setInterimText('');

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('bot_leave');
    }
  }, []);

  const handleExportDocx = useCallback(() => {
    exportToDocx(
      {
        title: meetingTitle,
        platform,
        url: meetingUrl,
        elapsedSeconds,
        vpnIp
      },
      transcripts
    );
  }, [meetingTitle, platform, meetingUrl, elapsedSeconds, vpnIp, transcripts]);

  const handleExportTxt = useCallback(() => {
    exportToTxt(
      {
        title: meetingTitle,
        platform,
        url: meetingUrl,
        elapsedSeconds,
        vpnIp
      },
      transcripts
    );
  }, [meetingTitle, platform, meetingUrl, elapsedSeconds, vpnIp, transcripts]);

  const handleAddSchedule = useCallback((schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => {
    storageService.addSchedule(schedule);
    setSchedules(storageService.getSchedules());
  }, []);

  const handleDeleteSchedule = useCallback((id: string) => {
    storageService.deleteSchedule(id);
    setSchedules(storageService.getSchedules());
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    storageService.deleteHistoryItem(id);
    setHistory(storageService.getHistory());
  }, []);

  const handleStartSessionFromSchedule = useCallback((schedule: ScheduledMeeting, autoJoin: boolean = true) => {
    setMeetingTitle(schedule.title);
    setMeetingUrl(schedule.url);
    setPlatform(schedule.platform);
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
    audioActive,
    vpnConnected,
    vpnIp,
    transcripts,
    interimText,
    interimSpeaker,
    interimLanguage,
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
    handleAddSchedule,
    handleDeleteSchedule,
    handleDeleteHistoryItem,
    handleStartSessionFromSchedule
  };
}
