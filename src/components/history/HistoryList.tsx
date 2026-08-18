import React, { useState } from 'react';
import { History, Search, Trash2, Eye, Clock } from 'lucide-react';
import { MeetingHistory } from '../../types/meeting';
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
        return <Badge variant="cyan" size="sm">Google Meet</Badge>;
      case 'zoom':
        return <Badge variant="neutral" size="sm">Zoom</Badge>;
      case 'teams':
        return <Badge variant="primary" size="sm">MS Teams</Badge>;
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141E33] p-5 rounded-2xl border border-[#233863] shadow-lui-card backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#233863] border border-[#3A4E7A] rounded-xl text-[#3DD6E8] shadow-md">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              Riwayat Rekaman &amp; Arsip Transkrip
            </h2>
            <p className="text-xs text-[#B8BFC9]">
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
            className="bg-[#0B1220] border border-[#233863] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] w-64 shadow-inner"
          />
          <Search className="w-4 h-4 text-[#B8BFC9] absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHistory.length === 0 ? (
          <div className="col-span-full bg-[#141E33]/60 border border-dashed border-[#233863] rounded-2xl p-12 text-center shadow-inner">
            <History className="w-10 h-10 text-[#B8BFC9]/40 mx-auto mb-2" />
            <p className="text-xs font-bold text-white">Belum ada riwayat transkrip yang tersimpan</p>
            <p className="text-[11px] text-[#B8BFC9] mt-1">Lakukan rekaman pada tab Live Session untuk membuat arsip baru.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const mins = Math.floor(item.durationSeconds / 60);
            const secs = item.durationSeconds % 60;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-[#141E33] border border-[#233863] hover:border-[#3DD6E8]/60 rounded-2xl p-5 shadow-lui-card hover:shadow-lui-hover space-y-3 transition-all flex flex-col justify-between cursor-pointer group backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getPlatformBadge(item.platform)}
                      <span className="text-[10px] font-mono font-bold text-[#3DD6E8] bg-[#0B1220] px-2.5 py-0.5 rounded-full border border-[#233863]">
                        {item.speakersCount} Pembicara
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="text-[#B8BFC9] hover:text-[#FF8E9D] p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Hapus Riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-white mt-2 group-hover:text-[#F5B400] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#B8BFC9] mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#3DD6E8]" />
                      {mins}m {secs}s
                    </span>
                    <span>•</span>
                    <span>{new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="text-white font-bold">{item.totalWords} Kata</span>
                  </div>

                  <p className="mt-2 text-xs text-[#B8BFC9] italic bg-[#0B1220] p-3 rounded-xl border border-[#233863] line-clamp-2">
                    "{item.transcriptSnippet}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#233863] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3DD6E8] flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5 text-[#3DD6E8]" />
                    Buka Transkrip Lengkap
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleQuickTxt(e, item)}
                      className="px-2.5 py-1 bg-[#0B1220] hover:bg-[#141E33] text-[#B8BFC9] hover:text-white rounded-lg text-xs font-mono font-bold border border-[#233863] transition-colors shadow-sm"
                      title="Quick Download .TXT"
                    >
                      .TXT
                    </button>
                    <button
                      onClick={(e) => handleQuickDocx(e, item)}
                      className="px-2.5 py-1 bg-[#3A4E7A] hover:bg-[#4A6296] text-white rounded-lg text-xs font-mono font-bold border border-[#233863] transition-colors shadow-sm"
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



