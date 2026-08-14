import React from 'react';
import { CheckCircle2, FileText, Download, Clock, Users, FileCode, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { MeetingSession } from '../../types/meeting';
import { TranscriptItem } from '../../types/transcript';
import { exportToDocx } from '../../services/exportDocx';
import { exportToTxt } from '../../services/exportTxt';

interface ClosureDialogProps {
  isOpen: boolean;
  session: Partial<MeetingSession>;
  transcripts: TranscriptItem[];
  onClose: () => void;
  onGoToHistory: () => void;
}

export const ClosureDialog: React.FC<ClosureDialogProps> = ({
  isOpen,
  session,
  transcripts,
  onClose,
  onGoToHistory,
}) => {
  if (!isOpen) return null;

  const totalWords = transcripts.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0);
  const uniqueSpeakers = Array.from(new Set(transcripts.map((t) => t.speaker))).length;

  const minutes = Math.floor((session.elapsedSeconds || 0) / 60);
  const seconds = (session.elapsedSeconds || 0) % 60;
  const durationStr = `${minutes}m ${seconds}s`;

  const handleExportDocx = () => {
    exportToDocx(session, transcripts);
  };

  const handleExportTxt = () => {
    exportToTxt(session, transcripts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative text-slate-100">
        {/* Success Icon & Header */}
        <div className="text-center pb-5 border-b border-slate-800">
          <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Sesi Rekaman Selesai & Berhasil Disimpan!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Transkrip lengkap Deepgram telah diproses dan diarsipkan ke riwayat meeting.
          </p>
        </div>

        {/* Meeting Summary Metrics */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold font-mono text-white">{durationStr}</div>
            <div className="text-[10px] text-slate-400 uppercase">Durasi Rekaman</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold font-mono text-cyan-300">{totalWords}</div>
            <div className="text-[10px] text-slate-400 uppercase">Total Kata</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold font-mono text-indigo-300">{uniqueSpeakers || 1} Pembicara</div>
            <div className="text-[10px] text-slate-400 uppercase">Diarization</div>
          </div>
        </div>

        {/* Direct Download Actions */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Unduh File Transkrip Instan:</span>
            <span className="text-[10px] text-slate-500 font-mono">Prinsip Golden Rule: Yield Closure</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportDocx}
              className="flex items-center justify-center gap-2 p-3 bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 rounded-xl text-blue-200 hover:text-white transition-all shadow-md group"
            >
              <FileCode className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold">Unduh .DOCX (Word)</div>
                <div className="text-[10px] text-blue-300/80">Format Resmi & Tabel</div>
              </div>
            </button>

            <button
              onClick={handleExportTxt}
              className="flex items-center justify-center gap-2 p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-slate-200 hover:text-white transition-all shadow-md group"
            >
              <FileText className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold">Unduh .TXT</div>
                <div className="text-[10px] text-slate-400">Plain Text & Log</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onGoToHistory} className="text-xs text-slate-300">
            Lihat di Riwayat <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Selesai / Sesi Baru
          </Button>
        </div>
      </div>
    </div>
  );
};
