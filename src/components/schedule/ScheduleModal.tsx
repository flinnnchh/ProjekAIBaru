import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg glass-card-strong p-6 shadow-2xl relative text-white animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233863]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40 rounded-xl shadow-md">
              <MaterialIcon icon="calendar_month" size="lg" className="text-[#3DD6E8]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-display">Jadwalkan Meeting Baru</h2>
              <p className="text-[11px] text-[#8A94A3]">Bot akan join otomatis sesuai jadwal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7585] hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 active:scale-90"
          >
            <MaterialIcon icon="close" size="md" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <MaterialIcon icon="title" size="xs" className="text-[#3DD6E8]" />
              Topik / Nama Meeting
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Diskusi Evaluasi Proyek Bulanan"
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 focus:border-[#3DD6E8]/50 font-medium shadow-lui-inner transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <MaterialIcon icon="devices" size="xs" className="text-[#3DD6E8]" />
                Platform
              </label>
              <div className="relative">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                  className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 font-bold cursor-pointer shadow-lui-inner appearance-none transition-all duration-200"
                >
                  <option value="gmeet" className="bg-[#0B1220] text-white">Google Meet</option>
                  <option value="zoom" className="bg-[#0B1220] text-white">Zoom Meeting</option>
                  <option value="teams" className="bg-[#0B1220] text-white">Microsoft Teams</option>
                </select>
                <MaterialIcon icon="unfold_more" size="sm" className="absolute right-3 top-2.5 pointer-events-none text-[#6B7585]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <MaterialIcon icon="translate" size="xs" className="text-[#3DD6E8]" />
                Bahasa STT
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'id' | 'en' | '')}
                  className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 font-bold cursor-pointer shadow-lui-inner appearance-none transition-all duration-200"
                >
                  <option value="id" className="bg-[#0B1220] text-white">Indonesia (ID)</option>
                  <option value="en" className="bg-[#0B1220] text-white">English (EN)</option>
                </select>
                <MaterialIcon icon="unfold_more" size="sm" className="absolute right-3 top-2.5 pointer-events-none text-[#6B7585]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <MaterialIcon icon="event" size="xs" className="text-[#3DD6E8]" />
              Waktu & Tanggal
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 font-medium shadow-lui-inner [color-scheme:dark] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <MaterialIcon icon="link" size="xs" className="text-[#3DD6E8]" />
              URL Meeting
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
              className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 font-mono shadow-lui-inner transition-all duration-200"
            />
          </div>

          {/* M3 Toggle Switch for Auto-Record */}
          <div className="flex items-center gap-3 p-3 bg-[#0B1220] rounded-xl border border-[#233863]">
            <button
              type="button"
              onClick={() => setAutoRecord(!autoRecord)}
              className={`toggle-switch ${autoRecord ? 'active' : ''}`}
              role="switch"
              aria-checked={autoRecord}
              aria-label="Auto-Record & Transcribe"
            />
            <label className="text-xs text-[#B8BFC9] cursor-pointer" onClick={() => setAutoRecord(!autoRecord)}>
              <strong className="text-white">Auto-Record & Transcribe:</strong> Mulai merekam otomatis saat bot join
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#233863]/60 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="accent" size="sm" type="submit" icon={<MaterialIcon icon="save" size="sm" className="text-[#0B1220]" />}>
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
