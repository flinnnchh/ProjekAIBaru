import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Search,
  Users,
  Sparkles,
  ArrowDown,
  Globe2,
  SlidersHorizontal,
  FileCode
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
}

export const LiveTranscriber: React.FC<LiveTranscriberProps> = ({
  transcripts,
  interimText,
  interimSpeaker = 'Speaker 1',
  interimLanguage = 'id',
  isRecording,
  onExportDocx,
  onExportTxt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const getLanguageBadge = (lang: 'id' | 'en' | 'mixed') => {
    switch (lang) {
      case 'id':
        return <Badge variant="info" size="sm">ID (Bahasa)</Badge>;
      case 'en':
        return <Badge variant="purple" size="sm">EN (English)</Badge>;
      case 'mixed':
        return <Badge variant="cyan" size="sm">Bilingual / Mixed</Badge>;
      default:
        return <Badge variant="default" size="sm">ID</Badge>;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col h-[520px]">
      {/* 1. Transcriber Top Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-950/70 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Transcriber Panel
              </h3>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono border border-slate-700">
                Deepgram Nova-2 (Live Diarization)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Globe2 className="w-3 h-3 text-slate-500" />
              Deteksi Bahasa Otomatis: <strong className="text-slate-300">Indonesia, English, & Code-Switching</strong>
            </p>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transkrip..."
              className="bg-slate-950 border border-slate-700/80 rounded-lg pl-7 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-48 font-normal"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>

          {/* Speaker Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg pl-7 pr-4 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium cursor-pointer"
            >
              <option value="ALL">Semua Pembicara ({uniqueSpeakers.length})</option>
              {uniqueSpeakers.map((spk) => (
                <option key={spk} value={spk}>{spk}</option>
              ))}
            </select>
            <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
              autoScroll
                ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Kunci scroll ke transkrip terbaru"
          >
            <ArrowDown className={`w-3.5 h-3.5 ${autoScroll ? 'text-blue-400' : ''}`} />
            <span className="text-[11px]">Auto-scroll</span>
          </button>
        </div>
      </div>

      {/* 2. Transcript Content Stream Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans divide-y divide-slate-800/40"
      >
        {filteredTranscripts.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            {isRecording ? (
              <div className="space-y-3">
                <div className="relative flex items-center justify-center mx-auto w-14 h-14">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-30"></span>
                  <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-300 uppercase tracking-wider">
                    ● Live Transcribing Aktif
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                    Bot sedang mendengarkan audio Google Meet secara real-time. Bicaralah atau putar suara di room meeting, teks akan otomatis mengalir di sini.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-2 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-300">Belum ada transkrip yang tercatat</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Klik tombol <strong className="text-red-400">Record</strong> di atas untuk memulai transkripsi audio meeting secara real-time.
                </p>
              </div>
            )}
          </div>
        )}

        {filteredTranscripts.map((item) => (
          <div key={item.id} className="pt-3 first:pt-0 group hover:bg-slate-950/30 p-2 rounded-xl transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  [{item.timestamp}]
                </span>
                <span className="text-xs font-bold text-blue-400">
                  {item.speaker}
                </span>
              </div>
              <div>{getLanguageBadge(item.language)}</div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed pl-1 select-text">
              {item.text}
            </p>
          </div>
        ))}

        {/* Interim / Live Typing Output (Sub-300ms stream from Deepgram) */}
        {isRecording && interimText && (
          <div className="pt-3 border-t border-blue-500/20 bg-blue-950/20 p-2.5 rounded-xl border border-blue-500/30 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold text-cyan-300">
                  {interimSpeaker} (Berbicara...)
                </span>
              </div>
              <div>{getLanguageBadge(interimLanguage)}</div>
            </div>
            <p className="text-xs text-slate-100 italic leading-relaxed pl-1 flex items-center gap-1">
              <span>{interimText}</span>
              <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse ml-0.5" />
            </p>
          </div>
        )}
      </div>

      {/* 3. Bottom Action Bar: Ekstraksi Cepat (.DOCX & .TXT) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Total: <strong className="text-slate-200">{transcripts.length}</strong> entri</span>
          <span>•</span>
          <span>Kata: <strong className="text-cyan-300">{transcripts.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0)}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export TXT */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTxt}
            disabled={transcripts.length === 0}
            icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
            title="Export Transkrip ke Format .TXT (Ctrl + Shift + T)"
          >
            <span className="flex items-center gap-1">
              <span>Export .TXT</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono text-slate-400">Ctrl+Shift+T</kbd>
            </span>
          </Button>

          {/* Export DOCX */}
          <Button
            variant="primary"
            size="sm"
            onClick={onExportDocx}
            disabled={transcripts.length === 0}
            icon={<FileCode className="w-3.5 h-3.5" />}
            title="Export Transkrip ke Microsoft Word .DOCX (Ctrl + Shift + D)"
          >
            <span className="flex items-center gap-1">
              <span>Export .DOCX (Word)</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono text-blue-200">Ctrl+Shift+D</kbd>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
