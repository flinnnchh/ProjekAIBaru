import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { Button } from '../common/Button';
import { MeetingSession } from '../../types/meeting';
import { TranscriptItem } from '../../types/transcript';
import { exportToDocx } from '../../services/exportDocx';
import { exportToTxt } from '../../services/exportTxt';
import { driveService, DriveStatus } from '../../services/driveService';

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
  const [driveStatus, setDriveStatus] = useState<DriveStatus>({ connected: false });
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveResult, setDriveResult] = useState<{ success: boolean; link?: string; fileName?: string; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      driveService.getStatus().then((st) => setDriveStatus(st));
      setDriveResult(null);
    }
  }, [isOpen]);

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

  const handleUploadToDrive = async (format: 'docx' | 'txt' = 'docx') => {
    setIsUploadingDrive(true);
    setDriveResult(null);

    try {
      // If not connected yet, trigger connection popup first
      if (!driveStatus.connected) {
        const authRes = await driveService.connect();
        if (!authRes.success) {
          setDriveResult({ success: false, error: authRes.error || 'Google Drive belum terhubung' });
          setIsUploadingDrive(false);
          return;
        }
        setDriveStatus({ connected: true, email: authRes.email });
      }

      const res = await driveService.uploadMeetingDocument(session, transcripts, format);
      if (res.success) {
        setDriveResult({ success: true, link: res.webViewLink, fileName: res.fileName });
      } else {
        setDriveResult({ success: false, error: res.message || 'Gagal mengunggah berkas' });
      }
    } catch (err: any) {
      setDriveResult({ success: false, error: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setIsUploadingDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg glass-card-strong p-6 shadow-2xl relative text-white animate-celebration max-h-[95vh] overflow-y-auto">
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

        {/* Google Drive Upload Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#141E33] to-[#1A2845] border border-[#3DD6E8]/30 mb-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#233863] flex items-center justify-center">
                <MaterialIcon icon="add_to_drive" size="sm" className="text-[#3DD6E8]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Google Drive Cloud Storage</span>
                  {driveStatus.connected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  )}
                </div>
                <div className="text-[10px] text-[#8A94A3]">
                  {driveStatus.connected ? `Tersambung: ${driveStatus.email}` : 'Simpan langsung ke Drive pribadi'}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleUploadToDrive('docx')}
              disabled={isUploadingDrive}
              className="px-3 py-1.5 bg-gradient-to-r from-[#233863] to-[#3A4E7A] hover:from-[#3A4E7A] hover:to-[#4A6296] border border-[#3DD6E8]/40 hover:border-[#3DD6E8] text-white rounded-lg text-xs font-extrabold transition-all duration-200 shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <MaterialIcon
                icon={isUploadingDrive ? 'sync' : 'cloud_upload'}
                size="xs"
                className={isUploadingDrive ? 'animate-spin text-[#3DD6E8]' : 'text-[#3DD6E8]'}
              />
              <span>{isUploadingDrive ? 'Mengunggah...' : 'Upload ke Drive (.DOCX)'}</span>
            </button>
          </div>

          {/* Drive Upload Result Message & Direct Link */}
          {driveResult && (
            <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 animate-fade-in ${
              driveResult.success
                ? 'bg-[#102A24] border-[#22C55E]/40 text-[#4ADE80]'
                : 'bg-[#3B171F] border-[#FF8E9D]/40 text-[#FF8E9D]'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <MaterialIcon icon={driveResult.success ? 'check_circle' : 'error'} size="sm" />
                <span className="truncate">
                  {driveResult.success ? `Tersimpan: ${driveResult.fileName}` : driveResult.error}
                </span>
              </div>

              {driveResult.success && driveResult.link && (
                <a
                  href={driveResult.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-[#22C55E]/20 hover:bg-[#22C55E]/30 border border-[#22C55E]/40 rounded text-[11px] font-bold text-white flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  <span>Buka di Drive</span>
                  <MaterialIcon icon="open_in_new" size="xs" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Download Actions */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MaterialIcon icon="download" size="sm" className="text-[#3DD6E8]" />
              Unduh Berkas Transkrip Lokal
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

