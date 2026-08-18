import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { ScheduledMeeting, MeetingPlatform } from '../../types/meeting';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform>('gmeet');
  const [language, setLanguage] = useState<'id' | 'en' | ''>('id');
  const [url, setUrl] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [autoRecord, setAutoRecord] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !dateTime) return;

    onSave({
      title,
      platform,
      language: (language as 'id' | 'en') || 'id',
      url,
      scheduledTime: new Date(dateTime).toISOString(),
      autoRecord,
      status: 'UPCOMING'
    });

    setTitle('');
    setUrl('');
    setLanguage('id');
    setDateTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141E33] border border-[#233863] rounded-2xl p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233863]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#233863] border border-[#3A4E7A] rounded-xl text-[#3DD6E8] shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Jadwalkan Bot Meeting Baru</h2>
              <p className="text-xs text-[#B8BFC9]">Bot akan bergabung secara otomatis sesuai jadwal yang ditentukan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#B8BFC9] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Topik / Nama Meeting
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Diskusi Evaluasi Proyek Bulanan"
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-medium shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Platform Meeting
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-bold cursor-pointer shadow-inner"
              >
                <option value="gmeet" className="bg-[#0B1220] text-white">Google Meet</option>
                <option value="zoom" className="bg-[#0B1220] text-white">Zoom Meeting</option>
                <option value="teams" className="bg-[#0B1220] text-white">Microsoft Teams</option>
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Bahasa SST (Deepgram)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'id' | 'en' | '')}
                className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-bold cursor-pointer shadow-inner"
              >
                <option value="id" className="bg-[#0B1220] text-white">Indonesia (ID)</option>
                <option value="en" className="bg-[#0B1220] text-white">English (EN)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Waktu &amp; Tanggal Meeting
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-medium shadow-inner [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1">
              URL / Link Meeting
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => {
                const val = e.target.value;
                setUrl(val);
                if (val.includes('meet.google.com')) setPlatform('gmeet');
                else if (val.includes('zoom.us')) setPlatform('zoom');
                else if (val.includes('teams.microsoft.com') || val.includes('teams.live.com')) setPlatform('teams');
              }}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-mono shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-[#0B1220] rounded-xl border border-[#233863]">
            <input
              type="checkbox"
              id="autoRecord"
              checked={autoRecord}
              onChange={(e) => setAutoRecord(e.target.checked)}
              className="rounded border-[#233863] bg-[#0B1220] text-[#F5B400] focus:ring-[#F5B400] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoRecord" className="text-xs text-[#B8BFC9] cursor-pointer">
              <strong className="text-white">Auto-Record &amp; Transcribe:</strong> Mulai merekam otomatis begitu bot berhasil join
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-[#233863] flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="accent" size="sm" type="submit">
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};



