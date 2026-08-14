import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Play, ExternalLink, Clock, Shield } from 'lucide-react';
import { ScheduledMeeting } from '../../types/meeting';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ScheduleModal } from './ScheduleModal';

interface ScheduleListProps {
  schedules: ScheduledMeeting[];
  onAddSchedule: (schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => void;
  onDeleteSchedule: (id: string) => void;
  onStartSessionFromSchedule: (schedule: ScheduledMeeting, autoJoin?: boolean) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
  onStartSessionFromSchedule,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setTick] = useState(0);

  // Re-render countdown every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'gmeet':
        return <Badge variant="success" size="sm">Google Meet</Badge>;
      case 'zoom':
        return <Badge variant="info" size="sm">Zoom</Badge>;
      case 'teams':
        return <Badge variant="purple" size="sm">MS Teams</Badge>;
      default:
        return <Badge variant="default" size="sm">{platform}</Badge>;
    }
  };

  const formatCountdown = (scheduledTime: string) => {
    const diffMs = new Date(scheduledTime).getTime() - Date.now();
    if (diffMs <= 0) {
      return 'Waktu Tiba / Lewat';
    }
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (diffHours > 0) {
      return `Mulai dalam ${diffHours} jam ${mins} mnt`;
    }
    return `Mulai dalam ${mins} menit`;
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/80 border border-blue-500/30 rounded-xl text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Manajemen Jadwal Meeting Bot
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Auto-Scheduler Active (24/7)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bot akan otomatis bergabung &amp; merekam rapat ketika jam jadwal yang ditentukan tiba.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Jadwal Meeting
        </Button>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Belum ada jadwal meeting aktif</p>
            <p className="text-[11px] text-slate-500 mt-1">Klik tombol di atas untuk menambahkan jadwal bot.</p>
          </div>
        ) : (
          schedules.map((item) => {
            const dateObj = new Date(item.scheduledTime);
            const isPassed = dateObj.getTime() < Date.now();
            const countdownText = formatCountdown(item.scheduledTime);

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-5 shadow-lg backdrop-blur-xl space-y-3 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPlatformBadge(item.platform)}
                      {item.autoRecord && (
                        <span className="text-[10px] text-red-400 font-mono bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                          Auto-Record
                        </span>
                      )}
                      {!isPassed && (
                        <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          ⏳ {countdownText}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteSchedule(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {dateObj.toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}{' '}
                      -{' '}
                      {dateObj.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}{' '}
                      WIB
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-slate-400 truncate bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    {item.url}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${isPassed ? 'text-amber-400' : 'text-emerald-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    {isPassed ? 'Waktu Lewat (Telah Siap)' : 'Terjadwal Otomatis'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onStartSessionFromSchedule(item, true)}
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      Jalankan Sekarang
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddSchedule}
      />
    </div>
  );
};
