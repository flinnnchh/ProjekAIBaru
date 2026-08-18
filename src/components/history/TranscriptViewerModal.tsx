import React, { useState } from 'react';
import { X, FileText, Search, Users, Clock, FileCode } from 'lucide-react';
import { MeetingHistory } from '../../types/meeting';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { exportToDocx } from '../../services/exportDocx';
import { exportToTxt } from '../../services/exportTxt';
import { TranscriptItem } from '../../types/transcript';

interface TranscriptViewerModalProps {
  historyItem: MeetingHistory | null;
  onClose: () => void;
}

export const TranscriptViewerModal: React.FC<TranscriptViewerModalProps> = ({
  historyItem,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('ALL');

  if (!historyItem) return null;

  const transcripts: TranscriptItem[] = historyItem.transcripts.map((t, idx) => ({
    id: t.id || `hist-v-${idx}`,
    meetingId: historyItem.id,
    speaker: t.speaker,
    speakerId: idx,
    timestamp: t.timestamp,
    text: t.text,
    isFinal: true,
    language: t.language || 'id',
    confidence: 0.98,
    createdAt: Date.now()
  }));

  const uniqueSpeakers = Array.from(new Set(transcripts.map((t) => t.speaker)));

  const filteredTranscripts = transcripts.filter((t) => {
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase()) ||
      t.speaker.toLowerCase().includes(search.toLowerCase());
    const matchSpeaker = speakerFilter === 'ALL' || t.speaker === speakerFilter;
    return matchSearch && matchSpeaker;
  });

  const handleExportDocx = () => {
    exportToDocx(
      {
        title: historyItem.title,
        platform: historyItem.platform,
        url: historyItem.url,
        elapsedSeconds: historyItem.durationSeconds,
        vpnIp: '10.24.0.12'
      },
      transcripts
    );
  };

  const handleExportTxt = () => {
    exportToTxt(
      {
        title: historyItem.title,
        platform: historyItem.platform,
        url: historyItem.url,
        elapsedSeconds: historyItem.durationSeconds,
        vpnIp: '10.24.0.12'
      },
      transcripts
    );
  };

  const mins = Math.floor(historyItem.durationSeconds / 60);
  const secs = historyItem.durationSeconds % 60;
  const durationStr = `${mins}m ${secs}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#141E33] border border-[#233863] rounded-2xl shadow-2xl flex flex-col relative text-white">
        {/* Header */}
        <div className="p-5 border-b border-[#233863] flex items-start justify-between gap-3 bg-[#0B1220]/90 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-white">
                {historyItem.title}
              </h2>
              <Badge variant="cyan" size="sm">Deepgram Nova-2</Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#B8BFC9] mt-1.5 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#3DD6E8]" />
                {durationStr}
              </span>
              <span>•</span>
              <span>{new Date(historyItem.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
              <span>•</span>
              <span className="text-white font-bold">{historyItem.totalWords} Kata</span>
              <span>•</span>
              <span className="text-[#3DD6E8]">{historyItem.speakersCount} Pembicara</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#B8BFC9] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary banner */}
        <div className="grid grid-cols-4 gap-2 m-4 p-3 bg-[#0B1220] rounded-xl border border-[#233863] text-center text-xs">
          <div>
            <span className="text-[#B8BFC9] block text-[10px] uppercase font-semibold">DURASI</span>
            <strong className="text-white font-mono font-bold">{durationStr}</strong>
          </div>
          <div>
            <span className="text-[#B8BFC9] block text-[10px] uppercase font-semibold">TOTAL KATA</span>
            <strong className="text-[#F5B400] font-mono font-bold">{historyItem.totalWords}</strong>
          </div>
          <div>
            <span className="text-[#B8BFC9] block text-[10px] uppercase font-semibold">PEMBICARA</span>
            <strong className="text-white font-mono font-bold">{historyItem.speakersCount} Orang</strong>
          </div>
          <div>
            <span className="text-[#B8BFC9] block text-[10px] uppercase font-semibold">ENGINE</span>
            <strong className="text-[#3DD6E8] font-mono font-bold">Nova-2 STT</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dalam transkrip..."
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-normal shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-[#B8BFC9] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={speakerFilter}
              onChange={(e) => setSpeakerFilter(e.target.value)}
              className="bg-[#0B1220] border border-[#233863] rounded-xl pl-7 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] appearance-none font-bold cursor-pointer shadow-inner"
            >
              <option value="ALL" className="bg-[#0B1220] text-white">Semua Pembicara ({uniqueSpeakers.length})</option>
              {uniqueSpeakers.map((spk) => (
                <option key={spk} value={spk} className="bg-[#0B1220] text-white">{spk}</option>
              ))}
            </select>
            <Users className="w-3.5 h-3.5 text-[#B8BFC9] absolute left-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Transcripts List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 divide-y divide-[#233863] bg-[#0B1220]/60 mx-4 mb-4 rounded-xl border border-[#233863]">
          {filteredTranscripts.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#B8BFC9]">
              Tidak ada transkrip yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredTranscripts.map((t) => (
              <div key={t.id} className="pt-3 first:pt-0 group hover:bg-[#141E33]/70 p-2.5 rounded-xl transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#B8BFC9] bg-[#0B1220] px-2 py-0.5 rounded border border-[#233863]">
                      [{t.timestamp}]
                    </span>
                    <span className="text-xs font-extrabold text-[#3DD6E8]">
                      {t.speaker}
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {t.language?.toUpperCase() || 'ID'}
                  </Badge>
                </div>
                <p className="text-xs text-white leading-relaxed pl-1 select-text font-normal">
                  {t.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#233863] bg-[#0B1220]/90 rounded-b-2xl flex items-center justify-between gap-3">
          <div className="text-xs text-[#B8BFC9] font-mono">
            Menampilkan <strong className="text-white">{filteredTranscripts.length}</strong> dari {transcripts.length} baris
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTxt}
              icon={<FileText className="w-3.5 h-3.5 text-[#B8BFC9]" />}
            >
              Export .TXT
            </Button>
            <Button
              variant="navy"
              size="sm"
              onClick={handleExportDocx}
              icon={<FileCode className="w-3.5 h-3.5 text-[#3DD6E8]" />}
            >
              Export .DOCX (Word)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
