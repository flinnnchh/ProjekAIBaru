import React from 'react';
import { X, FileCode, FileText, Calendar, Clock, Users, Globe2, Volume2 } from 'lucide-react';
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
  if (!historyItem) return null;

  const minutes = Math.floor(historyItem.durationSeconds / 60);
  const seconds = historyItem.durationSeconds % 60;
  const durationStr = `${minutes}m ${seconds}s`;

  // Format to standard transcript item for export
  const transcriptItems: TranscriptItem[] = historyItem.transcripts.map((t, idx) => ({
    id: t.id || `hist-t-${idx}`,
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

  const handleExportDocx = () => {
    exportToDocx(
      {
        title: historyItem.title,
        platform: historyItem.platform,
        url: historyItem.url,
        elapsedSeconds: historyItem.durationSeconds,
        vpnIp: '10.24.0.12'
      },
      transcriptItems
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
      transcriptItems
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">{historyItem.platform.toUpperCase()}</Badge>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(historyItem.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{historyItem.title}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{historyItem.url}</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary banner */}
        <div className="grid grid-cols-4 gap-2 my-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">DURASI</span>
            <strong className="text-white font-mono">{durationStr}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL KATA</span>
            <strong className="text-cyan-300 font-mono">{historyItem.totalWords}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">PEMBICARA</span>
            <strong className="text-indigo-300 font-mono">{historyItem.speakersCount} Orang</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ENGINE</span>
            <strong className="text-emerald-300 font-mono">Nova-2 STT</strong>
          </div>
        </div>

        {/* Transcripts scroll area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 my-2 divide-y divide-slate-800/50 font-sans">
          {historyItem.transcripts.map((t, idx) => (
            <div key={idx} className="pt-2.5 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    [{t.timestamp}]
                  </span>
                  <span className="text-xs font-bold text-blue-400">{t.speaker}</span>
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-500">
                  {t.language === 'mixed' ? 'ID + EN' : t.language}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed pl-1">{t.text}</p>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Dapat diunduh ulang kapan saja dalam format resmi.
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTxt}
              icon={<FileText className="w-3.5 h-3.5" />}
            >
              Unduh .TXT
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportDocx}
              icon={<FileCode className="w-3.5 h-3.5" />}
            >
              Unduh .DOCX (Word)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
