import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg glass-card-strong p-6 shadow-2xl relative text-white animate-celebration">
        {/* Success Icon & Header */}
        <div className="text-center pb-5 border-b border-[#233863]/60">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F5B400]/25 to-[#F5B400]/5 border border-[#F5B400]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow-gold">
            <MaterialIcon icon="check_circle" size="2xl" filled className="text-[#F5B400]" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
            Sesi Rekaman Selesai!
          </h2>
          <p className="text-xs text-[#8A94A3] mt-1.5">
            Transkrip Deepgram Nova-2 telah diproses dan diarsipkan ke riwayat.
          </p>
        </div>

        {/* Meeting Summary Metrics */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#233863] text-center shadow-lui-inner group hover:border-[#3DD6E8]/30 transition-all duration-200">
            <div className="flex items-center justify-center mb-1.5">
              <MaterialIcon icon="timer" size="md" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-extrabold font-mono text-white">{durationStr}</div>
            <div className="text-[10px] text-[#6B7585] uppercase font-semibold mt-0.5">Durasi</div>
          </div>

          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#233863] text-center shadow-lui-inner group hover:border-[#F5B400]/30 transition-all duration-200">
            <div className="flex items-center justify-center mb-1.5">
              <MaterialIcon icon="text_fields" size="md" className="text-[#F5B400] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-extrabold font-mono text-gradient-gold">{totalWords}</div>
            <div className="text-[10px] text-[#6B7585] uppercase font-semibold mt-0.5">Total Kata</div>
          </div>

          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#233863] text-center shadow-lui-inner group hover:border-[#3DD6E8]/30 transition-all duration-200">
            <div className="flex items-center justify-center mb-1.5">
              <MaterialIcon icon="group" size="md" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-extrabold font-mono text-white">{uniqueSpeakers || 1}</div>
            <div className="text-[10px] text-[#6B7585] uppercase font-semibold mt-0.5">Pembicara</div>
          </div>
        </div>

        {/* Download Actions */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MaterialIcon icon="download" size="sm" className="text-[#3DD6E8]" />
              Unduh Berkas Transkrip
            </span>
            <span className="text-[10px] text-[#6B7585] font-mono">Word & Text</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportDocx}
              className="flex items-center justify-center gap-2.5 p-3.5 bg-gradient-to-b from-[#3F5585] to-[#3A4E7A] hover:from-[#4A6296] hover:to-[#3F5585] border border-[#4A6296]/30 rounded-xl text-white transition-all duration-200 shadow-md group ripple-container active:scale-[0.97]"
            >
              <MaterialIcon icon="code" size="lg" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-extrabold">.DOCX (Word)</div>
                <div className="text-[10px] text-[#8A94A3]">Format Resmi</div>
              </div>
            </button>

            <button
              onClick={handleExportTxt}
              className="flex items-center justify-center gap-2.5 p-3.5 bg-[#0B1220] hover:bg-[#141E33] border border-[#233863] hover:border-[#3A4E7A] rounded-xl text-[#B8BFC9] hover:text-white transition-all duration-200 shadow-md group ripple-container active:scale-[0.97]"
            >
              <MaterialIcon icon="description" size="lg" className="text-[#8A94A3] group-hover:text-[#B8BFC9] group-hover:scale-110 transition-all" />
              <div className="text-left">
                <div className="text-xs font-extrabold">.TXT</div>
                <div className="text-[10px] text-[#6B7585]">Plain Text</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#233863]/60 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToHistory}
            className="text-xs text-[#3DD6E8]"
            iconRight={<MaterialIcon icon="arrow_forward" size="sm" />}
          >
            Lihat Riwayat
          </Button>

          <Button variant="accent" size="sm" onClick={onClose}>
            Selesai / Sesi Baru
          </Button>
        </div>
      </div>
    </div>
  );
};
