import React from 'react';
import { CheckCircle2, FileText, Clock, Users, FileCode, ArrowRight } from 'lucide-react';
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
      <div className="w-full max-w-lg bg-[#141E33] border border-[#233863] rounded-2xl p-6 shadow-2xl relative text-white">
        {/* Success Icon & Header */}
        <div className="text-center pb-5 border-b border-[#233863]">
          <div className="w-14 h-14 bg-[#F5B400]/20 border border-[#F5B400]/50 text-[#F5B400] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Sesi Rekaman Selesai &amp; Tersimpan!</h2>
          <p className="text-xs text-[#B8BFC9] mt-1">
            Transkrip lengkap Deepgram Nova-2 telah diproses dan diarsipkan ke riwayat meeting.
          </p>
        </div>

        {/* Meeting Summary Metrics */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-[#0B1220] p-3 rounded-xl border border-[#233863] text-center shadow-inner">
            <div className="flex items-center justify-center text-[#B8BFC9] mb-1">
              <Clock className="w-4 h-4 text-[#3DD6E8]" />
            </div>
            <div className="text-sm font-extrabold font-mono text-white">{durationStr}</div>
            <div className="text-[10px] text-[#B8BFC9] uppercase font-semibold">Durasi Rekaman</div>
          </div>

          <div className="bg-[#0B1220] p-3 rounded-xl border border-[#233863] text-center shadow-inner">
            <div className="flex items-center justify-center text-[#B8BFC9] mb-1">
              <FileText className="w-4 h-4 text-[#F5B400]" />
            </div>
            <div className="text-sm font-extrabold font-mono text-[#F5B400]">{totalWords}</div>
            <div className="text-[10px] text-[#B8BFC9] uppercase font-semibold">Total Kata</div>
          </div>

          <div className="bg-[#0B1220] p-3 rounded-xl border border-[#233863] text-center shadow-inner">
            <div className="flex items-center justify-center text-[#B8BFC9] mb-1">
              <Users className="w-4 h-4 text-[#3DD6E8]" />
            </div>
            <div className="text-sm font-extrabold font-mono text-white">{uniqueSpeakers || 1} Pembicara</div>
            <div className="text-[10px] text-[#B8BFC9] uppercase font-semibold">Diarization</div>
          </div>
        </div>

        {/* Direct Download Actions */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span>Unduh Berkas Transkrip:</span>
            <span className="text-[10px] text-[#B8BFC9] font-mono">Format Resmi Microsoft Word &amp; Text</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportDocx}
              className="flex items-center justify-center gap-2.5 p-3 bg-[#3A4E7A] hover:bg-[#4A6296] border border-[#233863] rounded-xl text-white transition-all shadow-md group"
            >
              <FileCode className="w-5 h-5 text-[#3DD6E8] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-extrabold">Unduh .DOCX (Word)</div>
                <div className="text-[10px] text-[#B8BFC9]">Format Resmi &amp; Tabel</div>
              </div>
            </button>

            <button
              onClick={handleExportTxt}
              className="flex items-center justify-center gap-2.5 p-3 bg-[#0B1220] hover:bg-[#141E33] border border-[#233863] rounded-xl text-[#B8BFC9] hover:text-white transition-all shadow-md group"
            >
              <FileText className="w-5 h-5 text-[#B8BFC9] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-extrabold">Unduh .TXT</div>
                <div className="text-[10px] text-[#B8BFC9]">Plain Text &amp; Log</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#233863] flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onGoToHistory} className="text-xs text-[#3DD6E8]">
            Lihat di Riwayat <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>

          <Button variant="accent" size="sm" onClick={onClose}>
            Selesai / Sesi Baru
          </Button>
        </div>
      </div>
    </div>
  );
};



