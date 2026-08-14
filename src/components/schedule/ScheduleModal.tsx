import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Link, CheckSquare } from 'lucide-react';
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
      url,
      scheduledTime: new Date(dateTime).toISOString(),
      autoRecord,
      status: 'UPCOMING'
    });

    setTitle('');
    setUrl('');
    setDateTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-950 border border-blue-500/30 rounded-lg text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Jadwalkan Bot Meeting Baru</h2>
              <p className="text-xs text-slate-400">Bot akan bergabung secara otomatis sesuai jadwal yang ditentukan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Topik / Nama Meeting
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Diskusi Evaluasi Proyek Bulanan"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gmeet">Google Meet</option>
                <option value="zoom">Zoom Meeting</option>
                <option value="teams">Microsoft Teams</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Waktu & Tanggal
              </label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL / Link Meeting
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              id="autoRecord"
              checked={autoRecord}
              onChange={(e) => setAutoRecord(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="autoRecord" className="text-xs text-slate-300 cursor-pointer">
              <strong>Auto-Record & Transcribe:</strong> Mulai merekam otomatis begitu bot berhasil join
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
