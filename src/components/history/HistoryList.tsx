import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { MeetingHistory } from '../../types/meeting';
import { Badge } from '../common/Badge';
import { TranscriptViewerModal } from './TranscriptViewerModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredHistory = history.filter((h) => {
    return (
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.transcriptSnippet.toLowerCase().includes(search.toLowerCase()) ||
      h.url.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'gmeet': return { label: 'Google Meet', icon: 'video_call', badgeVariant: 'cyan' as const };
      case 'zoom': return { label: 'Zoom', icon: 'videocam', badgeVariant: 'neutral' as const };
      case 'teams': return { label: 'MS Teams', icon: 'groups', badgeVariant: 'primary' as const };
      default: return { label: platform, icon: 'videocam', badgeVariant: 'default' as const };
    }
  };

  const makeTranscriptItems = (item: MeetingHistory): TranscriptItem[] => {
    return item.transcripts.map((t, idx) => ({
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
  };

  const handleQuickDocx = (e: React.MouseEvent, item: MeetingHistory) => {
    e.stopPropagation();
    exportToDocx(
      {
        title: item.title,
        platform: item.platform,
        url: item.url,
        date: item.date,
        elapsedSeconds: item.durationSeconds,
        vpnIp: '10.24.0.12',
        participants: item.participants,
      },
      makeTranscriptItems(item)
    );
  };

  const handleQuickTxt = (e: React.MouseEvent, item: MeetingHistory) => {
    e.stopPropagation();
    exportToTxt(
      {
        title: item.title,
        platform: item.platform,
        url: item.url,
        date: item.date,
        elapsedSeconds: item.durationSeconds,
        vpnIp: '10.24.0.12',
        participants: item.participants,
      },
      makeTranscriptItems(item)
    );
  };


  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card-strong p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40 rounded-xl shadow-md">
            <MaterialIcon icon="history" size="lg" className="text-[#3DD6E8]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-display">
              Riwayat & Arsip Transkrip
            </h2>
            <p className="text-xs text-[#8A94A3]">
              Koleksi sesi rekaman yang telah diproses oleh Deepgram Nova-2.
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari riwayat atau kata kunci..."
            className="bg-[#0B1220] border border-[#233863] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 w-64 shadow-lui-inner transition-all duration-200"
          />
          <MaterialIcon icon="search" size="sm" className="absolute left-3 top-2.5 pointer-events-none text-[#6B7585]" />
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHistory.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center border-dashed animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#141E33] border border-[#233863] flex items-center justify-center mx-auto mb-3">
              <MaterialIcon icon="history" size="xl" className="text-[#6B7585]" />
            </div>
            <p className="text-xs font-bold text-white font-display">Belum ada riwayat transkrip</p>
            <p className="text-[11px] text-[#8A94A3] mt-1">Lakukan rekaman pada tab Live Session untuk membuat arsip baru.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const mins = Math.floor(item.durationSeconds / 60);
            const secs = item.durationSeconds % 60;
            const platformInfo = getPlatformInfo(item.platform);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass-card hover:shadow-lui-card-hover space-y-3 transition-all duration-200 flex flex-col justify-between cursor-pointer group gradient-border p-5"
              >
                {/* Top color strip */}
                <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-[#3DD6E8]/50 via-[#F5B400]/50 to-[#3DD6E8]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={platformInfo.badgeVariant} size="sm" icon={platformInfo.icon}>
                        {platformInfo.label}
                      </Badge>
                      <Badge variant="default" size="sm" icon="group">
                        {item.speakersCount} Org
                      </Badge>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(item.id);
                      }}
                      className="text-[#6B7585] hover:text-[#FF8E9D] p-1.5 rounded-xl hover:bg-[#7A2530]/10 transition-all duration-200 active:scale-90"
                      title="Hapus Riwayat"
                    >
                      <MaterialIcon icon="delete" size="md" />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-white mt-2.5 group-hover:text-gradient-gold transition-colors leading-snug font-display">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#8A94A3] mt-1.5 font-mono flex-wrap">
                    <span className="flex items-center gap-1">
                      <MaterialIcon icon="timer" size="xs" className="text-[#3DD6E8]" />
                      {mins}m {secs}s
                    </span>
                    <span className="text-[#233863]">•</span>
                    <span className="flex items-center gap-1">
                      <MaterialIcon icon="calendar_today" size="xs" className="text-[#8A94A3]" />
                      {new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                    <span className="text-[#233863]">•</span>
                    <span className="text-white font-bold">{item.totalWords} Kata</span>
                    <span className="text-[#233863]">•</span>
                    <span className="text-[#3DD6E8] flex items-center gap-1">
                      <MaterialIcon icon="group" size="xs" />
                      {item.participants?.length || item.speakersCount} Peserta
                    </span>
                  </div>


                  <p className="mt-2.5 text-xs text-[#8A94A3] italic bg-[#0B1220] p-3 rounded-xl border border-[#233863] line-clamp-2 leading-relaxed">
                    "{item.transcriptSnippet}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#233863]/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3DD6E8] flex items-center gap-1.5 group-hover:underline decoration-[#3DD6E8]/40">
                    <MaterialIcon icon="visibility" size="sm" />
                    Buka Transkrip
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleQuickTxt(e, item)}
                      className="px-2.5 py-1 bg-[#0B1220] hover:bg-[#141E33] text-[#8A94A3] hover:text-white rounded-lg text-xs font-mono font-bold border border-[#233863] hover:border-[#3A4E7A] transition-all duration-200 shadow-sm active:scale-95"
                      title="Quick Download .TXT"
                    >
                      .TXT
                    </button>
                    <button
                      onClick={(e) => handleQuickDocx(e, item)}
                      className="px-2.5 py-1 bg-gradient-to-b from-[#3F5585] to-[#3A4E7A] hover:from-[#4A6296] hover:to-[#3F5585] text-white rounded-lg text-xs font-mono font-bold border border-[#4A6296]/30 transition-all duration-200 shadow-sm active:scale-95"
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

      <TranscriptViewerModal
        historyItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteHistoryItem(deleteTargetId);
        }}
        title="Hapus Riwayat Transkrip?"
        message="Seluruh data transkrip pada sesi ini akan dihapus secara permanen dan tidak dapat dikembalikan. Yakin ingin melanjutkan?"
      />
    </div>
  );
};
