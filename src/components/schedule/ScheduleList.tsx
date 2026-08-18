import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Play, Clock } from 'lucide-react';
import { ScheduledMeeting } from '../../types/meeting';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ScheduleModal } from './ScheduleModal';

interface ScheduleListProps {
  schedules: ScheduledMeeting[];
  onAddSchedule: (schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => void;
  onDeleteSchedule: (id: string) => void;
  onStartSessionFromSchedule: (schedule: ScheduledMeeting, autoJoin?: boolean) => void;
  currentMeetingUrl?: string;
  botState?: string;
  onGoToLiveTab?: () => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
  onStartSessionFromSchedule,
  currentMeetingUrl,
  botState,
  onGoToLiveTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Real-time live countdown ticker every 1 second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'gmeet':
        return <Badge variant="cyan" size="sm">Google Meet</Badge>;
      case 'zoom':
        return <Badge variant="neutral" size="sm">Zoom</Badge>;
      case 'teams':
        return <Badge variant="primary" size="sm">MS Teams</Badge>;
      default:
        return <Badge variant="default" size="sm">{platform}</Badge>;
    }
  };

  const getCountdownBadge = (item: ScheduledMeeting) => {
    const isBotActiveHere =
      Boolean(botState && botState !== 'IDLE' && botState !== 'ERROR') &&
      (currentMeetingUrl === item.url || item.status === 'IN_PROGRESS');

    if (isBotActiveHere || item.status === 'IN_PROGRESS') {
      return (
        <span className="text-[10px] text-[#3DD6E8] font-mono font-bold bg-[#3DD6E8]/20 px-2.5 py-0.5 rounded-full border border-[#3DD6E8] flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3DD6E8] animate-ping" />
          <span>🟢 Sedang Berlangsung</span>
        </span>
      );
    }

    if (item.status === 'COMPLETED') {
      return (
        <span className="text-[10px] text-[#B8BFC9] font-mono font-bold bg-[#0B1220] px-2.5 py-0.5 rounded-full border border-[#233863] flex items-center gap-1">
          <span>✓</span>
          <span>Selesai</span>
        </span>
      );
    }

    const diffMs = new Date(item.scheduledTime).getTime() - now;

    // Jika waktu sudah lewat lebih dari 15 menit dan belum pernah di-join / selesai -> Terlewat
    if (item.status === 'MISSED' || diffMs < -15 * 60 * 1000) {
      return (
        <span className="text-[10px] text-[#FF8E9D] font-mono font-bold bg-[#7A2530]/40 px-2.5 py-0.5 rounded-full border border-[#7A2530] flex items-center gap-1 shadow-sm">
          <span>⚠️</span>
          <span>Waktu Terlewat</span>
        </span>
      );
    }

    // Waktu pas tiba (< 0 s/d -15 menit)
    if (diffMs <= 0) {
      return (
        <span className="text-[10px] text-[#FF8E9D] font-mono font-bold bg-[#7A2530]/40 px-2.5 py-0.5 rounded-full border border-[#7A2530] flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8E9D] animate-ping" />
          <span>🔴 Waktu Mulai Tiba</span>
        </span>
      );
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let countdownText = '';
    let isUrgent = false;

    if (hours > 0) {
      countdownText = `${hours}j ${mins}m ${secs}d`;
    } else if (mins > 0) {
      countdownText = `${mins}m ${secs}d`;
      if (mins < 5) isUrgent = true;
    } else {
      countdownText = `${secs} detik lagi`;
      isUrgent = true;
    }

    return (
      <span
        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-sm transition-all ${
          isUrgent
            ? 'bg-[#F5B400]/20 border-[#F5B400] text-[#F5B400] animate-pulse'
            : 'bg-[#0B1220] border-[#233863] text-[#F5B400]'
        }`}
      >
        <span>⏳</span>
        <span>Mulai dalam {countdownText}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141E33] p-5 rounded-2xl border border-[#233863] shadow-lui-card backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#233863] border border-[#3A4E7A] rounded-xl text-[#3DD6E8] shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">
                Manajemen Jadwal Meeting Bot
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B1220] border border-[#233863] text-[10px] text-[#3DD6E8] font-mono font-bold flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3DD6E8] animate-pulse"></span>
                Auto-Scheduler Active (24/7)
              </span>
            </div>
            <p className="text-xs text-[#B8BFC9] mt-0.5">
              Bot akan otomatis bergabung &amp; merekam rapat ketika jam jadwal yang ditentukan tiba.
            </p>
          </div>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-[#0B1220]" />}
        >
          Tambah Jadwal Meeting
        </Button>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full bg-[#141E33]/60 border border-dashed border-[#233863] rounded-2xl p-12 text-center shadow-inner">
            <Calendar className="w-10 h-10 text-[#B8BFC9]/40 mx-auto mb-2" />
            <p className="text-xs font-bold text-white">Belum ada jadwal meeting aktif</p>
            <p className="text-[11px] text-[#B8BFC9] mt-1">Klik tombol di atas untuk menambahkan jadwal bot baru.</p>
          </div>
        ) : (
          schedules.map((item) => {
            const dateObj = new Date(item.scheduledTime);
            const diffMs = dateObj.getTime() - now;

            const isBotActiveHere =
              Boolean(botState && botState !== 'IDLE' && botState !== 'ERROR') &&
              (currentMeetingUrl === item.url || item.status === 'IN_PROGRESS');

            const isInProgress = isBotActiveHere || item.status === 'IN_PROGRESS';
            const isCompleted = !isBotActiveHere && item.status === 'COMPLETED';
            const isMissed = !isBotActiveHere && !isCompleted && (item.status === 'MISSED' || (item.status === 'UPCOMING' && diffMs < -15 * 60 * 1000));
            const isDueNow = !isBotActiveHere && !isCompleted && !isMissed && (item.status === 'UPCOMING' && diffMs <= 0);

            return (
              <div
                key={item.id}
                className="bg-[#141E33] border border-[#233863] hover:border-[#3DD6E8]/60 rounded-2xl p-5 shadow-lui-card hover:shadow-lui-hover space-y-3 transition-all flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPlatformBadge(item.platform)}
                      {item.language && (
                        <span className="text-[10px] text-[#3DD6E8] font-mono bg-[#141E33] px-2 py-0.5 rounded-full border border-[#233863] font-bold">
                          {item.language === 'en' ? 'EN' : 'ID'}
                        </span>
                      )}
                      {item.autoRecord && (
                        <span className="text-[10px] text-[#FF8E9D] font-mono bg-[#7A2530]/40 px-2 py-0.5 rounded-full border border-[#7A2530] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8E9D] animate-ping"></span>
                          Auto-Record
                        </span>
                      )}
                      {getCountdownBadge(item)}
                    </div>

                    <button
                      onClick={() => onDeleteSchedule(item.id)}
                      className="text-[#B8BFC9] hover:text-[#FF8E9D] p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-white mt-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#B8BFC9] mt-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#3DD6E8]" />
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
                        minute: '2-digit',
                        second: '2-digit'
                      })}{' '}
                      WIB
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-[#B8BFC9] truncate bg-[#0B1220] p-2.5 rounded-xl border border-[#233863]">
                    {item.url}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#233863] flex items-center justify-between gap-2">
                  {/* Status Indicator Bawah */}
                  {isInProgress ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#3DD6E8]">
                      <span className="w-2 h-2 rounded-full bg-[#3DD6E8] animate-ping"></span>
                      Bot Sedang di Dalam Room
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#B8BFC9]">
                      <span className="w-2 h-2 rounded-full bg-[#B8BFC9]"></span>
                      Meeting sudah selesai
                    </span>
                  ) : isMissed ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#FF8E9D]">
                      <span className="w-2 h-2 rounded-full bg-[#FF8E9D]"></span>
                      Meeting sudah terlewat
                    </span>
                  ) : isDueNow ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#F5B400]">
                      <span className="w-2 h-2 rounded-full bg-[#F5B400] animate-ping"></span>
                      Waktu Tiba — Bot Siap Bergabung
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#3DD6E8]">
                      <span className="w-2 h-2 rounded-full bg-[#3DD6E8]"></span>
                      Terjadwal Otomatis
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isInProgress ? 'accent' : isCompleted ? 'outline' : 'accent'}
                      size="sm"
                      onClick={() => {
                        if (isInProgress && onGoToLiveTab) {
                          onGoToLiveTab();
                        } else {
                          onStartSessionFromSchedule(item, !isInProgress);
                        }
                      }}
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      {isInProgress
                        ? 'Buka Sesi Live'
                        : isCompleted
                        ? 'Jalankan Ulang'
                        : 'Jalankan Sekarang'}
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



