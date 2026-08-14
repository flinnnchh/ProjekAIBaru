import React, { useState } from 'react';
import { History, Search, FileText, Trash2, Eye, Download, FileCode, Clock, Globe2 } from 'lucide-react';
import { MeetingHistory } from '../../types/meeting';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { TranscriptViewerModal } from './TranscriptViewerModal';
import { exportToDocx } from '../../services/exportDocx';
import { exportToTxt } from '../../services/exportTxt';
import { TranscriptItem } from '../../types/transcript';

interface HistoryListProps {
  history: MeetingHistory[];
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onDeleteHistoryItem }) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MeetingHistory | null>(null);

  const filteredHistory = history.filter((h) => {
    return (
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.transcriptSnippet.toLowerCase().includes(search.toLowerCase()) ||
      h.url.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'gmeet':
        return <Badge variant="success" size="sm">Google Meet</Badge>;
      case 'zoom':
        return <Badge variant="info" size="sm">Zoom</Badge>;
      case 'teams':
        return <Badge variant="purple" size="sm">MS Teams</Badge>;
      default:
        return <Badge variant="default" size="sm">{platform}</Badge>;
    }
  };

  const handleQuickDocx = (e: React.MouseEvent, item: MeetingHistory) => {
    e.stopPropagation();
    const transcriptItems: TranscriptItem[] = item.transcripts.map((t, idx) => ({
      id: t.id || `hist-t-${idx}`,
      meetingId: item.id,
      speaker: t.speaker,
      speakerId: idx,
      timestamp: t.timestamp,
      text: t.text,
      isFinal: true,
      language: t.language || 'id',
      confidence: 0.98,
      createdAt: Date.now()
    }));

    exportToDocx(
      {
        title: item.title,
        platform: item.platform,
        url: item.url,
        elapsedSeconds: item.durationSeconds,
        vpnIp: '10.24.0.12'
      },
      transcriptItems
    );
  };

  const handleQuickTxt = (e: React.MouseEvent, item: MeetingHistory) => {
    e.stopPropagation();
    const transcriptItems: TranscriptItem[] = item.transcripts.map((t, idx) => ({
      id: t.id || `hist-t-${idx}`,
      meetingId: item.id,
      speaker: t.speaker,
      speakerId: idx,
      timestamp: t.timestamp,
      text: t.text,
      isFinal: true,
      language: t.language || 'id',
      confidence: 0.98,
      createdAt: Date.now()
    }));

    exportToTxt(
      {
        title: item.title,
        platform: item.platform,
        url: item.url,
        elapsedSeconds: item.durationSeconds,
        vpnIp: '10.24.0.12'
      },
      transcriptItems
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/80 border border-blue-500/30 rounded-xl text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Riwayat Rekaman & Arsip Transkrip
            </h2>
            <p className="text-xs text-slate-400">
              Koleksi sesi rekaman yang telah selesai diproses oleh Deepgram Nova-2.
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari riwayat atau kata kunci..."
            className="bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHistory.length === 0 ? (
          <div className="col-span-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Belum ada riwayat transkrip yang tersimpan</p>
            <p className="text-[11px] text-slate-500 mt-1">Lakukan rekaman pada tab Live Session untuk membuat arsip baru.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const mins = Math.floor(item.durationSeconds / 60);
            const secs = item.durationSeconds % 60;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-5 shadow-lg backdrop-blur-xl space-y-3 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getPlatformBadge(item.platform)}
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {item.speakersCount} Pembicara
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Hapus Riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {mins}m {secs}s
                    </span>
                    <span>•</span>
                    <span>{new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{item.totalWords} Kata</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800 line-clamp-2">
                    "{item.transcriptSnippet}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    Buka Transkrip Lengkap
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleQuickTxt(e, item)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono border border-slate-700 transition-colors"
                      title="Quick Download .TXT"
                    >
                      .TXT
                    </button>
                    <button
                      onClick={(e) => handleQuickDocx(e, item)}
                      className="p-1.5 bg-blue-950 hover:bg-blue-900 text-blue-300 hover:text-white rounded-lg text-xs font-mono border border-blue-500/40 transition-colors"
                      title="Quick Download .DOCX"
                    >
                      .DOCX
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transcript Viewer Modal */}
      <TranscriptViewerModal
        historyItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
