import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Users,
  Sparkles,
  ArrowDown,
  Globe2,
  FileCode,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { TranscriptItem } from '../../types/transcript';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface LiveTranscriberProps {
  transcripts: TranscriptItem[];
  interimText?: string;
  interimSpeaker?: string;
  interimLanguage?: 'id' | 'en' | 'mixed';
  isRecording: boolean;
  onExportDocx: () => void;
  onExportTxt: () => void;
  onClearTranscripts?: () => void;
}

export const LiveTranscriber: React.FC<LiveTranscriberProps> = ({
  transcripts,
  interimText,
  interimSpeaker = 'Speaker 1',
  interimLanguage = 'id',
  isRecording,
  onExportDocx,
  onExportTxt,
  onClearTranscripts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-reset confirmation after 4 seconds
  useEffect(() => {
    if (confirmClear) {
      const t = setTimeout(() => setConfirmClear(false), 4000);
      return () => clearTimeout(t);
    }
  }, [confirmClear]);

  // Filtered list
  const filteredTranscripts = transcripts.filter((t) => {
    const matchSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpeaker = selectedSpeaker === 'ALL' || t.speaker === selectedSpeaker;
    return matchSearch && matchSpeaker;
  });

  // Unique speakers list
  const uniqueSpeakers = Array.from(new Set(transcripts.map((t) => t.speaker)));

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcripts, interimText, autoScroll]);

  // Handle user manual scroll
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
        return <Badge variant="neutral" size="sm">ID (Bahasa)</Badge>;
      case 'en':
        return <Badge variant="neutral" size="sm">EN (English)</Badge>;
      case 'mixed':
        return <Badge variant="cyan" size="sm">Bilingual / Mixed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">ID</Badge>;
    }
  };

  return (
    <div id="live-transcriber-section" className="bg-[#141E33] border border-[#233863] rounded-2xl shadow-lui-card backdrop-blur-xl flex flex-col h-[540px] scroll-mt-20">
      {/* 1. Transcriber Top Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#233863] flex flex-wrap items-center justify-between gap-3 bg-[#0B1220]/90 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#233863] border border-[#3A4E7A] rounded-xl text-[#3DD6E8] shadow-md flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#3DD6E8]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Live Transcriber Panel
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#141E33] text-[10px] text-[#3DD6E8] font-mono font-bold border border-[#233863]">
                Deepgram Nova-2 (Live Diarization)
              </span>
              <span className="sm:hidden px-2 py-0.5 rounded-full bg-[#141E33] text-[9px] text-[#3DD6E8] font-mono font-bold border border-[#233863]">
                Nova-2 STT
              </span>
            </div>
            <p className="text-[11px] text-[#B8BFC9] flex items-center gap-1.5 mt-0.5 font-medium">
              <Globe2 className="w-3 h-3 text-[#3DD6E8] flex-shrink-0" />
              <span className="truncate">Deteksi Bahasa Otomatis: <strong className="text-white">ID, EN, &amp; Mixed</strong></span>
            </p>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transkrip..."
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] sm:w-44 font-normal shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-[#B8BFC9] absolute left-2 top-2.5 pointer-events-none" />
          </div>

          {/* Speaker Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="bg-[#0B1220] border border-[#233863] rounded-xl pl-7 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] appearance-none font-bold cursor-pointer shadow-inner"
            >
              <option value="ALL" className="bg-[#0B1220] text-white">Semua Pembicara ({uniqueSpeakers.length})</option>
              {uniqueSpeakers.map((spk) => (
                <option key={spk} value={spk} className="bg-[#0B1220] text-white">{spk}</option>
              ))}
            </select>
            <Users className="w-3.5 h-3.5 text-[#B8BFC9] absolute left-2 top-2.5 pointer-events-none" />
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors shadow-sm ${
              autoScroll
                ? 'bg-[#233863] border-[#3DD6E8]/60 text-[#3DD6E8]'
                : 'bg-[#0B1220] border-[#233863] text-[#B8BFC9] hover:text-white hover:bg-[#141E33]'
            }`}
            title="Kunci scroll ke transkrip terbaru"
          >
            <ArrowDown className={`w-3.5 h-3.5 ${autoScroll ? 'text-[#3DD6E8]' : ''}`} />
            <span className="text-[11px] hidden sm:inline">Auto-scroll</span>
          </button>

          {/* Clear Transcripts Button */}
          {confirmClear ? (
            <div className="flex items-center gap-1.5 bg-[#7A2530]/40 border border-[#7A2530] rounded-xl px-2.5 py-1 text-xs animate-in fade-in zoom-in-95 duration-150 shadow-md">
              <span className="text-[11px] text-[#FF8E9D] font-extrabold">Hapus semua?</span>
              <button
                onClick={handleClear}
                className="px-2 py-0.5 bg-[#7A2530] hover:bg-[#9E2F3E] text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-colors"
              >
                Ya
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-0.5 bg-[#0B1220] hover:bg-[#141E33] text-[#B8BFC9] rounded-lg text-[10px] transition-colors"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={transcripts.length === 0 && !interimText}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors shadow-sm bg-[#0B1220] border-[#233863] text-[#B8BFC9] hover:text-[#FF8E9D] hover:border-[#7A2530] hover:bg-[#7A2530]/20 disabled:opacity-40 disabled:pointer-events-none group"
              title="Bersihkan teks transkrip agar tidak menumpuk (Ctrl + Shift + X)"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#B8BFC9] group-hover:text-[#FF8E9D] transition-colors" />
              <span className="text-[11px] hidden sm:inline">Bersihkan</span>
            </button>
          )}
        </div>
      </div>


      {/* 2. Transcript Content Stream Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-5 overflow-y-auto space-y-3.5 font-sans divide-y divide-[#233863] bg-[#0B1220]/60"
      >
        {filteredTranscripts.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            {isRecording ? (
              <div className="space-y-3">
                <div className="relative flex items-center justify-center mx-auto w-14 h-14">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7A2530] opacity-35"></span>
                  <div className="w-12 h-12 rounded-full bg-[#7A2530]/40 border border-[#7A2530] flex items-center justify-center text-[#FF8E9D] shadow-md">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#FF8E9D] uppercase tracking-wider">
                    ● Live Transcribing Aktif
                  </p>
                  <p className="text-[11px] text-[#B8BFC9] max-w-sm mt-1">
                    Bot sedang mendengarkan audio meeting secara real-time. Bicaralah di room meeting, teks akan otomatis mengalir di sini.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-full bg-[#141E33] border border-[#233863] flex items-center justify-center text-[#B8BFC9] mb-2 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white">Belum ada transkrip yang tercatat</p>
                <p className="text-[11px] text-[#B8BFC9] max-w-xs mt-1">
                  Klik tombol <strong className="text-[#FF8E9D]">2. RECORD</strong> di atas untuk memulai transkripsi audio meeting secara real-time.
                </p>
              </div>
            )}
          </div>
        )}

        {filteredTranscripts.map((item) => (
          <div key={item.id} className="pt-3.5 first:pt-0 group hover:bg-[#141E33]/70 p-2.5 rounded-xl transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#B8BFC9] bg-[#0B1220] px-2 py-0.5 rounded border border-[#233863]">
                  [{item.timestamp}]
                </span>
                <span className="text-xs font-extrabold text-[#3DD6E8]">
                  {item.speaker}
                </span>
              </div>
              <div>{getLanguageBadge(item.language)}</div>
            </div>
            <p className="text-xs text-white leading-relaxed pl-1 select-text font-normal">
              {item.text}
            </p>
          </div>
        ))}

        {/* Interim / Live Typing Output (Sub-300ms stream from Deepgram) */}
        {isRecording && interimText && (
          <div className="pt-3 border-t border-[#3DD6E8]/40 bg-[#141E33] p-3 rounded-xl border border-[#3DD6E8]/60 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3DD6E8]"></span>
                </span>
                <span className="text-xs font-bold text-[#3DD6E8]">
                  {interimSpeaker} (Sedang berbicara...)
                </span>
              </div>
              <div>{getLanguageBadge(interimLanguage)}</div>
            </div>
            <p className="text-xs text-white italic leading-relaxed pl-1 flex items-center gap-1 font-medium">
              <span>{interimText}</span>
              <span className="inline-block w-1.5 h-3.5 bg-[#3DD6E8] animate-pulse ml-0.5" />
            </p>
          </div>
        )}
      </div>

      {/* 3. Bottom Action Bar: Ekstraksi Cepat (.DOCX & .TXT) & Clear Action */}
      <div className="p-3.5 border-t border-[#233863] bg-[#0B1220]/90 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#B8BFC9] font-mono">
          <div className="flex items-center gap-2">
            <span>Total: <strong className="text-white">{transcripts.length}</strong> entri</span>
            <span>•</span>
            <span>Kata: <strong className="text-[#3DD6E8] font-bold">{transcripts.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0)}</strong></span>
          </div>

          {transcripts.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-[11px] text-[#B8BFC9] hover:text-[#FF8E9D] flex items-center gap-1 transition-colors underline decoration-dotted font-sans"
              title="Bersihkan daftar transkrip ini"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bersihkan ({transcripts.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export TXT */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTxt}
            disabled={transcripts.length === 0}
            icon={<FileText className="w-3.5 h-3.5 text-[#B8BFC9]" />}
            title="Export Transkrip ke Format .TXT (Ctrl + Shift + T)"
          >
            <span className="flex items-center gap-1">
              <span>Export .TXT</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono text-[#B8BFC9]">Ctrl+Shift+T</kbd>
            </span>
          </Button>

          {/* Export DOCX (Navy Terang #3A4E7A) */}
          <Button
            variant="navy"
            size="sm"
            onClick={onExportDocx}
            disabled={transcripts.length === 0}
            icon={<FileCode className="w-3.5 h-3.5 text-[#3DD6E8]" />}
            title="Export Transkrip ke Microsoft Word .DOCX (Ctrl + Shift + D)"
          >
            <span className="flex items-center gap-1">
              <span>Export .DOCX (Word)</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono text-[#3DD6E8]">Ctrl+Shift+D</kbd>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};




