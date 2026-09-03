import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { TranscriptItem } from '../../types/transcript';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface LiveTranscriberProps {
  transcripts: TranscriptItem[];
  interimText?: string;
  interimSpeaker?: string;
  interimLanguage?: 'id' | 'en' | 'mixed';
  isRecording: boolean;
  liveTranscribeEnabled: boolean;
  onExportDocx: () => void;
  onExportTxt: () => void;
  onClearTranscripts?: () => void;
}

// Speaker color palette for avatar initials
const SPEAKER_COLORS = [
  { bg: 'bg-[#3DD6E8]/20', text: 'text-[#3DD6E8]', border: 'border-[#3DD6E8]/30' },
  { bg: 'bg-[#F5B400]/20', text: 'text-[#F5B400]', border: 'border-[#F5B400]/30' },
  { bg: 'bg-[#FF8E9D]/20', text: 'text-[#FF8E9D]', border: 'border-[#FF8E9D]/30' },
  { bg: 'bg-[#7EEAF5]/20', text: 'text-[#7EEAF5]', border: 'border-[#7EEAF5]/30' },
  { bg: 'bg-[#D9A441]/20', text: 'text-[#D9A441]', border: 'border-[#D9A441]/30' },
  { bg: 'bg-[#B8BFC9]/20', text: 'text-[#B8BFC9]', border: 'border-[#B8BFC9]/30' },
];

const getSpeakerColor = (speaker: string) => {
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
};

const getSpeakerInitials = (speaker: string) => {
  const parts = speaker.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return speaker.substring(0, 2);
};

export const LiveTranscriber: React.FC<LiveTranscriberProps> = ({
  transcripts,
  interimText,
  interimSpeaker = 'Speaker 1',
  interimLanguage = 'id',
  isRecording,
  liveTranscribeEnabled,
  onExportDocx,
  onExportTxt,
  onClearTranscripts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (confirmClear) {
      const t = setTimeout(() => setConfirmClear(false), 4000);
      return () => clearTimeout(t);
    }
  }, [confirmClear]);

  const filteredTranscripts = transcripts.filter((t) => {
    const matchSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpeaker = selectedSpeaker === 'ALL' || t.speaker === selectedSpeaker;
    return matchSearch && matchSpeaker;
  });

  const uniqueSpeakers = Array.from(new Set(transcripts.map((t) => t.speaker)));

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcripts, interimText, autoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  };

  const handleClear = () => {
    onClearTranscripts?.();
    setConfirmClear(false);
  };

  const getLanguageBadge = (lang: 'id' | 'en' | 'mixed') => {
    switch (lang) {
      case 'id':
        return <Badge variant="neutral" size="sm" icon="translate">ID</Badge>;
      case 'en':
        return <Badge variant="neutral" size="sm" icon="translate">EN</Badge>;
      case 'mixed':
        return <Badge variant="cyan" size="sm" icon="translate">MIX</Badge>;
      default:
        return <Badge variant="neutral" size="sm">ID</Badge>;
    }
  };

  return (
    <div id="live-transcriber-section" className="glass-card-strong flex flex-col h-[540px] scroll-mt-20 overflow-hidden">
      {/* 1. Top Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#233863]/60 flex flex-wrap items-center justify-between gap-3 bg-[#0B1220]/80 backdrop-blur-xl rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shadow-md flex-shrink-0 transition-all duration-300 ${
            liveTranscribeEnabled 
              ? 'bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40' 
              : 'bg-gradient-to-br from-[#F5B400]/20 to-[#D9A441]/10 border border-[#F5B400]/30'
          }`}>
            <MaterialIcon 
              icon={liveTranscribeEnabled ? 'auto_awesome' : 'cloud_sync'} 
              size="md" 
              className={liveTranscribeEnabled ? 'text-[#3DD6E8]' : 'text-[#F5B400]'} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-display">
                {liveTranscribeEnabled ? 'Live Transcriber' : 'Background Audio Recorder'}
              </h3>
              {liveTranscribeEnabled ? (
                <span className="px-2 py-0.5 rounded-full bg-[#141E33] text-[10px] text-[#3DD6E8] font-mono font-bold border border-[#233863]">
                  Deepgram Nova-2 (Live)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#F5B400]/15 text-[10px] text-[#F5B400] font-mono font-bold border border-[#F5B400]/30">
                  ⭐ Background Mode (Post-Meeting)
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8A94A3] flex items-center gap-1.5 mt-0.5 font-medium">
              <MaterialIcon icon={liveTranscribeEnabled ? 'language' : 'high_quality'} size="xs" className={liveTranscribeEnabled ? 'text-[#3DD6E8]' : 'text-[#F5B400]'} />
              <span className="truncate">
                {liveTranscribeEnabled ? (
                  <>Deteksi Otomatis: <strong className="text-white">ID, EN, & Mixed (Real-time)</strong></>
                ) : (
                  <>Pemrosesan Audio: <strong className="text-white">Akurasi Maksimal (Batch Nova-2)</strong></>
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transkrip..."
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 sm:w-44 font-normal shadow-lui-inner transition-all duration-200"
            />
            <MaterialIcon icon="search" size="sm" className="absolute left-2 top-2 pointer-events-none text-[#6B7585]" />
          </div>

          {/* Speaker Filter */}
          <div className="relative">
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="bg-[#0B1220] border border-[#233863] rounded-xl pl-8 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 appearance-none font-bold cursor-pointer shadow-lui-inner transition-all duration-200"
            >
              <option value="ALL" className="bg-[#0B1220] text-white">Semua ({uniqueSpeakers.length})</option>
              {uniqueSpeakers.map((spk) => (
                <option key={spk} value={spk} className="bg-[#0B1220] text-white">{spk}</option>
              ))}
            </select>
            <MaterialIcon icon="group" size="sm" className="absolute left-2 top-2 pointer-events-none text-[#6B7585]" />
          </div>

          {/* Auto-scroll */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 shadow-sm ${
              autoScroll
                ? 'bg-[#3DD6E8]/10 border-[#3DD6E8]/30 text-[#3DD6E8]'
                : 'bg-[#0B1220] border-[#233863] text-[#6B7585] hover:text-white hover:border-[#3A4E7A]'
            }`}
            title="Auto-scroll ke transkrip terbaru"
          >
            <MaterialIcon icon="arrow_downward" size="sm" filled={autoScroll} />
            <span className="text-[11px] hidden sm:inline">Auto</span>
          </button>

          {/* Clear */}
          {confirmClear ? (
            <div className="flex items-center gap-1.5 bg-[#7A2530]/20 border border-[#7A2530]/50 rounded-xl px-2.5 py-1 text-xs animate-scale-in shadow-md">
              <span className="text-[11px] text-[#FF8E9D] font-extrabold">Hapus?</span>
              <button onClick={handleClear} className="px-2 py-0.5 bg-[#7A2530] hover:bg-[#992E3C] text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-colors">Ya</button>
              <button onClick={() => setConfirmClear(false)} className="px-2 py-0.5 bg-[#0B1220] hover:bg-[#141E33] text-[#B8BFC9] rounded-lg text-[10px] transition-colors">Batal</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={transcripts.length === 0 && !interimText}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 shadow-sm bg-[#0B1220] border-[#233863] text-[#6B7585] hover:text-[#FF8E9D] hover:border-[#7A2530]/50 hover:bg-[#7A2530]/10 disabled:opacity-40 disabled:pointer-events-none group"
              title="Bersihkan transkrip (Ctrl + Shift + X)"
            >
              <MaterialIcon icon="delete_sweep" size="sm" className="group-hover:text-[#FF8E9D] transition-colors" />
              <span className="text-[11px] hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Transcript Content */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-1 font-sans bg-[#0B1220]/40"
      >
        {/* Background Mode Placeholder (Recording State) */}
        {!liveTranscribeEnabled && isRecording && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="space-y-4">
              <div className="relative flex items-center justify-center mx-auto w-20 h-20">
                <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-[#F5B400] opacity-10"></span>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5B400]/20 to-[#D9A441]/10 border border-[#F5B400]/30 flex items-center justify-center shadow-lg">
                  <MaterialIcon icon="cloud_sync" size="xl" className="text-[#F5B400]" />
                </div>
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#F5B400] uppercase tracking-wider font-display">
                  Background Mode Aktif
                </p>
                <p className="text-[11px] text-[#8A94A3] max-w-sm mt-2 leading-relaxed">
                  Bot sedang merekam audio meeting di background.
                  <br />
                  <strong className="text-white">Transkrip akurasi tinggi</strong> akan diproses & ditampilkan saat Anda menekan tombol <strong className="text-[#3DD6E8]">STOP</strong>.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5B400] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5B400]"></span>
                </span>
                <span className="text-[10px] text-[#D9A441] font-mono font-bold">Merekam...</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty / Standby Placeholder */}
        {!isRecording && filteredTranscripts.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="animate-fade-in">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-3 mx-auto ${
                liveTranscribeEnabled 
                  ? 'bg-[#141E33] border-[#233863] text-[#6B7585]' 
                  : 'bg-[#F5B400]/10 border-[#F5B400]/30 text-[#F5B400]'
              }`}>
                <MaterialIcon icon={liveTranscribeEnabled ? 'description' : 'cloud_sync'} size="xl" />
              </div>
              <p className="text-xs font-bold text-white font-display">
                {liveTranscribeEnabled ? 'Belum ada transkrip' : 'Mode Background Siap'}
              </p>
              <p className="text-[11px] text-[#8A94A3] max-w-xs mt-1.5 leading-relaxed">
                {liveTranscribeEnabled ? (
                  <>Klik tombol <strong className="text-[#FF8E9D]">RECORD</strong> untuk memulai transkripsi audio real-time.</>
                ) : (
                  <>Klik tombol <strong className="text-[#FF8E9D]">RECORD</strong> untuk mulai merekam. Transkrip akurasi tinggi akan dihasilkan saat tombol <strong className="text-[#3DD6E8]">STOP</strong> ditekan.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Live Recording Placeholder (Only when in live mode and transcripts haven't arrived yet) */}
        {liveTranscribeEnabled && isRecording && filteredTranscripts.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="space-y-3 animate-fade-in">
              <div className="relative flex items-center justify-center mx-auto w-16 h-16">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7A2530] opacity-20"></span>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7A2530]/40 to-[#992E3C]/20 border border-[#7A2530]/40 flex items-center justify-center shadow-lg">
                  <MaterialIcon icon="auto_awesome" size="xl" className="text-[#FF8E9D] animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FF8E9D] uppercase tracking-wider font-display">
                  Live Transcribing Aktif
                </p>
                <p className="text-[11px] text-[#8A94A3] max-w-sm mt-1.5 leading-relaxed">
                  Bot mendengarkan audio meeting real-time. Bicaralah di room meeting, teks otomatis mengalir di sini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Render transcripts list ONLY IF liveTranscribeEnabled or after recording stops */}
        {(liveTranscribeEnabled || !isRecording) && filteredTranscripts.map((item, idx) => {
          const color = getSpeakerColor(item.speaker);
          const initials = getSpeakerInitials(item.speaker);

          return (
            <div
              key={item.id}
              className="group hover:bg-[#141E33]/50 p-2.5 sm:p-3 rounded-xl transition-all duration-150"
              style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
            >
              <div className="flex gap-2.5">
                {/* Speaker Avatar */}
                <div className={`speaker-avatar ${color.bg} ${color.text} border ${color.border} mt-0.5`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold ${color.text}`}>{item.speaker}</span>
                      <span className="text-[10px] font-mono text-[#6B7585]">{item.timestamp}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">{getLanguageBadge(item.language)}</div>
                  </div>
                  <p className="text-xs text-[#E0E4EA] leading-relaxed select-text font-normal">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Interim Live Typing (Live Mode Only) */}
        {liveTranscribeEnabled && isRecording && interimText && (
          <div className="bg-[#141E33]/80 p-3 rounded-xl border border-[#3DD6E8]/20 shadow-md animate-fade-in">
            <div className="flex gap-2.5">
              <div className={`speaker-avatar ${getSpeakerColor(interimSpeaker).bg} ${getSpeakerColor(interimSpeaker).text} border ${getSpeakerColor(interimSpeaker).border} mt-0.5`}>
                {getSpeakerInitials(interimSpeaker)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3DD6E8]"></span>
                  </span>
                  <span className="text-xs font-bold text-[#3DD6E8]">{interimSpeaker}</span>
                  <span className="text-[10px] text-[#6B7585] italic">sedang berbicara...</span>
                </div>
                <p className="text-xs text-white/80 italic leading-relaxed flex items-center gap-0.5 font-medium">
                  <span>{interimText}</span>
                  <span className="neon-cursor ml-0.5" />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Action Bar */}
      <div className="p-3.5 border-t border-[#233863]/60 bg-[#0B1220]/80 backdrop-blur-xl rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#8A94A3] font-mono">
          {liveTranscribeEnabled || !isRecording ? (
            <div className="flex items-center gap-2">
              <MaterialIcon icon="format_list_numbered" size="xs" className="text-[#6B7585]" />
              <span><strong className="text-white">{transcripts.length}</strong> entri</span>
              <span className="text-[#233863]">•</span>
              <MaterialIcon icon="text_fields" size="xs" className="text-[#6B7585]" />
              <span><strong className="text-[#3DD6E8]">{transcripts.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0)}</strong> kata</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#F5B400] font-sans text-xs">
              <MaterialIcon icon="cloud_sync" size="xs" />
              <span>Mode Background: Audio direkam penuh & diproses saat STOP</span>
            </div>
          )}

          {(liveTranscribeEnabled || !isRecording) && transcripts.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-[11px] text-[#6B7585] hover:text-[#FF8E9D] flex items-center gap-1 transition-colors font-sans"
            >
              <MaterialIcon icon="restart_alt" size="xs" />
              <span>Reset ({transcripts.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTxt}
            disabled={transcripts.length === 0}
            icon={<MaterialIcon icon="description" size="sm" className="text-[#8A94A3]" />}
            title="Export .TXT (Ctrl + Shift + T)"
          >
            <span className="flex items-center gap-1.5">
              <span>.TXT</span>
              <kbd className="hidden sm:inline-block keycap text-[9px] !py-0 !px-1 !min-w-0">⌃⇧T</kbd>
            </span>
          </Button>

          <Button
            variant="navy"
            size="sm"
            onClick={onExportDocx}
            disabled={transcripts.length === 0}
            icon={<MaterialIcon icon="code" size="sm" className="text-[#3DD6E8]" />}
            title="Export .DOCX (Ctrl + Shift + D)"
          >
            <span className="flex items-center gap-1.5">
              <span>.DOCX</span>
              <kbd className="hidden sm:inline-block keycap text-[9px] !py-0 !px-1 !min-w-0">⌃⇧D</kbd>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
