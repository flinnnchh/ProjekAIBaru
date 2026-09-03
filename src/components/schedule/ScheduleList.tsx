import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { ScheduledMeeting } from '../../types/meeting';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ScheduleModal } from './ScheduleModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'gmeet': return { label: 'Google Meet', icon: 'video_call', color: 'text-[#3DD6E8]', badgeVariant: 'cyan' as const };
      case 'zoom': return { label: 'Zoom', icon: 'videocam', color: 'text-[#B8BFC9]', badgeVariant: 'neutral' as const };
      case 'teams': return { label: 'MS Teams', icon: 'groups', color: 'text-white', badgeVariant: 'primary' as const };
      default: return { label: platform, icon: 'videocam', color: 'text-[#B8BFC9]', badgeVariant: 'default' as const };
    }
  };

  const getCountdownBadge = (item: ScheduledMeeting) => {
    const isBotActiveHere =
      Boolean(botState && botState !== 'IDLE' && botState !== 'ERROR') &&
      (currentMeetingUrl === item.url || item.status === 'IN_PROGRESS');

    if (isBotActiveHere || item.status === 'IN_PROGRESS') {
      return (
        <span className="text-[10px] text-[#3DD6E8] font-mono font-bold bg-[#3DD6E8]/10 px-2.5 py-0.5 rounded-full border border-[#3DD6E8]/30 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3DD6E8]" />
          </span>
          <span>Berlangsung</span>
        </span>
      );
    }

    if (item.status === 'COMPLETED') {
      return (
        <span className="text-[10px] text-[#8A94A3] font-mono font-bold bg-[#0B1220] px-2.5 py-0.5 rounded-full border border-[#233863] flex items-center gap-1">
          <MaterialIcon icon="check_circle" size="xs" className="text-[#8A94A3]" />
          <span>Selesai</span>
        </span>
      );
    }

    const diffMs = new Date(item.scheduledTime).getTime() - now;

    if (item.status === 'MISSED' || diffMs < -15 * 60 * 1000) {
      return (
        <span className="text-[10px] text-[#FF8E9D] font-mono font-bold bg-[#7A2530]/20 px-2.5 py-0.5 rounded-full border border-[#7A2530]/40 flex items-center gap-1">
          <MaterialIcon icon="warning" size="xs" className="text-[#FF8E9D]" />
          <span>Terlewat</span>
        </span>
      );
    }

    if (diffMs <= 0) {
      return (
        <span className="text-[10px] text-[#FF8E9D] font-mono font-bold bg-[#7A2530]/20 px-2.5 py-0.5 rounded-full border border-[#7A2530]/40 flex items-center gap-1.5 animate-pulse">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8E9D] opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF8E9D]" />
          </span>
          <span>Waktu Tiba</span>
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
      countdownText = `${secs}d lagi`;
      isUrgent = true;
    }

    return (
      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-all ${
        isUrgent
          ? 'bg-[#F5B400]/10 border-[#F5B400]/30 text-[#F5B400] animate-pulse'
          : 'bg-[#0B1220] border-[#233863] text-[#F5B400]'
      }`}>
        <MaterialIcon icon="schedule" size="xs" />
        <span>{countdownText}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card-strong p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40 rounded-xl shadow-md">
            <MaterialIcon icon="calendar_month" size="lg" className="text-[#3DD6E8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide font-display">
                Jadwal Meeting Bot
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B1220] border border-[#233863] text-[10px] text-[#3DD6E8] font-mono font-bold flex items-center gap-1 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-40" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3DD6E8]" />
                </span>
                Auto-Scheduler
              </span>
            </div>
            <p className="text-xs text-[#8A94A3] mt-0.5">
              Bot otomatis join & merekam rapat sesuai jadwal yang ditentukan.
            </p>
          </div>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<MaterialIcon icon="add" size="sm" className="text-[#0B1220]" />}
        >
          Tambah Jadwal
        </Button>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center border-dashed animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#141E33] border border-[#233863] flex items-center justify-center mx-auto mb-3">
              <MaterialIcon icon="calendar_month" size="xl" className="text-[#6B7585]" />
            </div>
            <p className="text-xs font-bold text-white font-display">Belum ada jadwal meeting</p>
            <p className="text-[11px] text-[#8A94A3] mt-1">Klik tombol di atas untuk menambahkan jadwal baru.</p>
          </div>
        ) : (
          schedules.map((item) => {
            const dateObj = new Date(item.scheduledTime);
            const diffMs = dateObj.getTime() - now;
            const platformInfo = getPlatformInfo(item.platform);

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
                className="glass-card hover:shadow-lui-card-hover space-y-3 transition-all duration-200 flex flex-col justify-between group gradient-border p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={platformInfo.badgeVariant} size="sm" icon={platformInfo.icon}>
                        {platformInfo.label}
                      </Badge>
                      {item.language && (
                        <Badge variant="default" size="sm" icon="translate">
                          {item.language === 'en' ? 'EN' : 'ID'}
                        </Badge>
                      )}
                      {item.autoRecord && (
                        <Badge variant="danger" size="sm" pulse icon="fiber_manual_record">
                          Auto-Rec
                        </Badge>
                      )}
                      {getCountdownBadge(item)}
                    </div>

                    <button
                      onClick={() => setDeleteTargetId(item.id)}
                      className="text-[#6B7585] hover:text-[#FF8E9D] p-1.5 rounded-xl hover:bg-[#7A2530]/10 transition-all duration-200 active:scale-90"
                      title="Hapus Jadwal"
                    >
                      <MaterialIcon icon="delete" size="md" />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-white mt-2.5 leading-snug font-display group-hover:text-gradient-gold transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#8A94A3] mt-2 font-mono">
                    <MaterialIcon icon="schedule" size="sm" className="text-[#3DD6E8]" />
                    <span>
                      {dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      {' — '}
                      {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-[#6B7585] truncate bg-[#0B1220] p-2.5 rounded-xl border border-[#233863]">
                    {item.url}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#233863]/60 flex items-center justify-between gap-2">
                  {isInProgress ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#3DD6E8]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-50" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3DD6E8]" />
                      </span>
                      Bot di Dalam Room
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#8A94A3]">
                      <MaterialIcon icon="check_circle" size="xs" />
                      Selesai
                    </span>
                  ) : isMissed ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#FF8E9D]">
                      <MaterialIcon icon="warning" size="xs" />
                      Terlewat
                    </span>
                  ) : isDueNow ? (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#F5B400]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5B400] opacity-50" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5B400]" />
                      </span>
                      Waktu Tiba — Siap
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold flex items-center gap-1.5 text-[#3DD6E8]">
                      <MaterialIcon icon="schedule" size="xs" />
                      Terjadwal Otomatis
                    </span>
                  )}

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
                    icon={<MaterialIcon icon="play_arrow" size="sm" filled className={isInProgress || !isCompleted ? 'text-[#0B1220]' : ''} />}
                  >
                    {isInProgress ? 'Buka Live' : isCompleted ? 'Ulang' : 'Jalankan'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddSchedule}
      />

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteSchedule(deleteTargetId);
        }}
        title="Hapus Jadwal Meeting?"
        message="Jadwal meeting ini akan dihapus secara permanen. Bot tidak akan otomatis join untuk sesi ini. Yakin ingin melanjutkan?"
      />
    </div>
  );
};
