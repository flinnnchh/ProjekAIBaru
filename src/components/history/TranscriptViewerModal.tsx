import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { MeetingHistory } from '../../types/meeting';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { exportToDocx } from '../../services/exportDocx';
import { exportToTxt } from '../../services/exportTxt';
import { driveService } from '../../services/driveService';
import { TranscriptItem } from '../../types/transcript';


// Speaker color palette (same as LiveTranscriber)
const SPEAKER_COLORS = [
  { bg: 'bg-[#3DD6E8]/20', text: 'text-[#3DD6E8]', border: 'border-[#3DD6E8]/30' },
  { bg: 'bg-[#F5B400]/20', text: 'text-[#F5B400]', border: 'border-[#F5B400]/30' },
  { bg: 'bg-[#FF8E9D]/20', text: 'text-[#FF8E9D]', border: 'border-[#FF8E9D]/30' },
  { bg: 'bg-[#7EEAF5]/20', text: 'text-[#7EEAF5]', border: 'border-[#7EEAF5]/30' },
  { bg: 'bg-[#D9A441]/20', text: 'text-[#D9A441]', border: 'border-[#D9A441]/30' },
  { bg: 'bg-[#B8BFC9]/20', text: 'text-[#B8BFC9]', border: 'border-[#B8BFC9]/30' },
];

const getSpeakerColor = (speaker: string) => {
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
  return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
};

const getSpeakerInitials = (speaker: string) => {
  const parts = speaker.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return speaker.substring(0, 2);
};

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
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveUploadResult, setDriveUploadResult] = useState<{ success: boolean; link?: string; error?: string } | null>(null);

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
        date: historyItem.date,
        elapsedSeconds: historyItem.durationSeconds,
        vpnIp: '10.24.0.12',
        participants: historyItem.participants || uniqueSpeakers,
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
        date: historyItem.date,
        elapsedSeconds: historyItem.durationSeconds,
        vpnIp: '10.24.0.12',
        participants: historyItem.participants || uniqueSpeakers,
      },
      transcripts
    );
  };

  const handleUploadToDrive = async (format: 'docx' | 'txt' = 'docx') => {
    setIsUploadingDrive(true);
    setDriveUploadResult(null);

    try {
      const status = await driveService.getStatus();
      if (!status.connected) {
        const authRes = await driveService.connect();
        if (!authRes.success) {
          setDriveUploadResult({ success: false, error: authRes.error || 'Google Drive belum terhubung' });
          setIsUploadingDrive(false);
          return;
        }
      }

      const res = await driveService.uploadMeetingDocument(
        {
          title: historyItem.title,
          platform: historyItem.platform,
          url: historyItem.url,
          date: historyItem.date,
          elapsedSeconds: historyItem.durationSeconds,
          participants: historyItem.participants || uniqueSpeakers,
        },
        transcripts,
        format
      );

      if (res.success) {
        setDriveUploadResult({ success: true, link: res.webViewLink });
      } else {
        setDriveUploadResult({ success: false, error: res.message || 'Gagal mengunggah berkas' });
      }
    } catch (err: any) {
      setDriveUploadResult({ success: false, error: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const mins = Math.floor(historyItem.durationSeconds / 60);
  const secs = historyItem.durationSeconds % 60;
  const durationStr = `${mins}m ${secs}s`;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] glass-card-strong shadow-2xl flex flex-col relative text-white animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-[#233863]/60 flex items-start justify-between gap-3 bg-[#0B1220]/80 backdrop-blur-xl rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-white font-display">{historyItem.title}</h2>
              <Badge variant="cyan" size="sm" icon="auto_awesome">Nova-2</Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8A94A3] mt-1.5 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <MaterialIcon icon="timer" size="xs" className="text-[#3DD6E8]" />
                {durationStr}
              </span>
              <span className="text-[#233863]">•</span>
              <span className="flex items-center gap-1">
                <MaterialIcon icon="calendar_today" size="xs" className="text-[#8A94A3]" />
                {new Date(historyItem.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })} {new Date(historyItem.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </span>
              <span className="text-[#233863]">•</span>
              <span className="text-white font-bold">{historyItem.totalWords} Kata</span>
              <span className="text-[#233863]">•</span>
              <span className="text-[#3DD6E8] flex items-center gap-1">
                <MaterialIcon icon="group" size="xs" />
                {historyItem.participants?.length || historyItem.speakersCount} Peserta
              </span>
            </div>
          </div>


          <button
            onClick={onClose}
            className="text-[#6B7585] hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 active:scale-90"
          >
            <MaterialIcon icon="close" size="md" />
          </button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-4 gap-2 m-4 p-3 bg-[#0B1220] rounded-xl border border-[#233863] text-center text-xs">
          <div className="group">
            <span className="text-[#6B7585] block text-[10px] uppercase font-semibold">Durasi</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <MaterialIcon icon="timer" size="xs" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
              <strong className="text-white font-mono font-bold">{durationStr}</strong>
            </div>
          </div>
          <div className="group">
            <span className="text-[#6B7585] block text-[10px] uppercase font-semibold">Total Kata</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <MaterialIcon icon="text_fields" size="xs" className="text-[#F5B400] group-hover:scale-110 transition-transform" />
              <strong className="text-gradient-gold font-mono font-bold">{historyItem.totalWords}</strong>
            </div>
          </div>
          <div className="group">
            <span className="text-[#6B7585] block text-[10px] uppercase font-semibold">Pembicara</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <MaterialIcon icon="group" size="xs" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
              <strong className="text-white font-mono font-bold">{historyItem.speakersCount} Org</strong>
            </div>
          </div>
          <div className="group">
            <span className="text-[#6B7585] block text-[10px] uppercase font-semibold">Engine</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <MaterialIcon icon="auto_awesome" size="xs" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
              <strong className="text-[#3DD6E8] font-mono font-bold">Nova-2</strong>
            </div>
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
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 font-normal shadow-lui-inner transition-all duration-200"
            />
            <MaterialIcon icon="search" size="sm" className="absolute left-2.5 top-2 pointer-events-none text-[#6B7585]" />
          </div>

          <div className="relative">
            <select
              value={speakerFilter}
              onChange={(e) => setSpeakerFilter(e.target.value)}
              className="bg-[#0B1220] border border-[#233863] rounded-xl pl-8 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 appearance-none font-bold cursor-pointer shadow-lui-inner transition-all duration-200"
            >
              <option value="ALL" className="bg-[#0B1220] text-white">Semua ({uniqueSpeakers.length})</option>
              {uniqueSpeakers.map((spk) => (
                <option key={spk} value={spk} className="bg-[#0B1220] text-white">{spk}</option>
              ))}
            </select>
            <MaterialIcon icon="group" size="sm" className="absolute left-2 top-2 pointer-events-none text-[#6B7585]" />
          </div>
        </div>

        {/* Transcripts List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-[#0B1220]/40 mx-4 mb-4 rounded-xl border border-[#233863]">
          {filteredTranscripts.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#6B7585] flex flex-col items-center gap-2">
              <MaterialIcon icon="search_off" size="xl" className="text-[#6B7585]" />
              <span>Tidak ada transkrip yang cocok dengan filter.</span>
            </div>
          ) : (
            filteredTranscripts.map((t) => {
              const color = getSpeakerColor(t.speaker);
              const initials = getSpeakerInitials(t.speaker);

              return (
                <div key={t.id} className="group hover:bg-[#141E33]/50 p-2.5 rounded-xl transition-all duration-150">
                  <div className="flex gap-2.5">
                    <div className={`speaker-avatar ${color.bg} ${color.text} border ${color.border} mt-0.5`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold ${color.text}`}>{t.speaker}</span>
                          <span className="text-[10px] font-mono text-[#6B7585]">{t.timestamp}</span>
                        </div>
                        <Badge variant="neutral" size="sm">{t.language?.toUpperCase() || 'ID'}</Badge>
                      </div>
                      <p className="text-xs text-[#E0E4EA] leading-relaxed select-text font-normal">{t.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#233863]/60 bg-[#0B1220]/80 backdrop-blur-xl rounded-b-2xl flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[#8A94A3] font-mono flex items-center gap-1.5">
            <MaterialIcon icon="format_list_numbered" size="xs" className="text-[#6B7585]" />
            <strong className="text-white">{filteredTranscripts.length}</strong> / {transcripts.length} baris
            {driveUploadResult && (
              <span className={`ml-2 px-2 py-0.5 rounded text-[11px] font-bold ${
                driveUploadResult.success ? 'text-[#4ADE80] bg-[#22C55E]/10' : 'text-[#FF8E9D] bg-[#FF8E9D]/10'
              }`}>
                {driveUploadResult.success ? '✅ Terupload ke Drive' : driveUploadResult.error}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {driveUploadResult?.success && driveUploadResult.link ? (
              <a
                href={driveUploadResult.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#22C55E]/20 hover:bg-[#22C55E]/30 border border-[#22C55E]/40 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Buka di Drive</span>
                <MaterialIcon icon="open_in_new" size="xs" />
              </a>
            ) : (
              <button
                onClick={() => handleUploadToDrive('docx')}
                disabled={isUploadingDrive}
                className="px-3 py-1.5 bg-[#141E33] hover:bg-[#1A2845] border border-[#3DD6E8]/40 hover:border-[#3DD6E8] rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <MaterialIcon icon={isUploadingDrive ? 'sync' : 'cloud_upload'} size="xs" className={isUploadingDrive ? 'animate-spin text-[#3DD6E8]' : 'text-[#3DD6E8]'} />
                <span>{isUploadingDrive ? 'Mengunggah...' : 'Drive'}</span>
              </button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTxt}
              icon={<MaterialIcon icon="description" size="sm" className="text-[#8A94A3]" />}
            >
              .TXT
            </Button>
            <Button
              variant="navy"
              size="sm"
              onClick={handleExportDocx}
              icon={<MaterialIcon icon="code" size="sm" className="text-[#3DD6E8]" />}
            >
              .DOCX (Word)
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
