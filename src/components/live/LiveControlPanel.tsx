import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AudioVisualizer } from './AudioVisualizer';
import { BotState, MeetingPlatform } from '../../types/meeting';

interface LiveControlPanelProps {
  meetingUrl: string;
  setMeetingUrl: (url: string) => void;
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  platform: MeetingPlatform;
  setPlatform: (p: MeetingPlatform) => void;
  language: 'id' | 'en' | '';
  setLanguage: (lang: 'id' | 'en' | '') => void;
  botState: BotState;
  elapsedSeconds: number;
  audioActive: boolean;
  onJoin: () => void;
  onJoinClick: () => void;
  onRecord: () => void;
  onPauseResume: () => void;
  onStop: () => void;
  onLeave: () => void;
}

export const LiveControlPanel: React.FC<LiveControlPanelProps> = ({
  meetingUrl,
  setMeetingUrl,
  meetingTitle,
  setMeetingTitle,
  platform,
  setPlatform,
  language,
  setLanguage,
  botState,
  elapsedSeconds,
  audioActive,
  onJoin,
  onJoinClick,
  onRecord,
  onPauseResume,
  onStop,
  onLeave,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [urlError, setUrlError] = React.useState(false);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUrl = () => {
    if (!meetingUrl) return;
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // State condition flags (Error Prevention State Machine — Rule 5)
  const isIdle = botState === 'IDLE' || botState === 'ERROR';
  const isJoining = botState === 'JOINING';
  const isInRoomStandby = botState === 'IN_ROOM_STANDBY';
  const isRecording = botState === 'RECORDING';
  const isPaused = botState === 'PAUSED';
  const inSession = isInRoomStandby || isRecording || isPaused;

  const canJoin = isIdle && meetingUrl.trim().length > 0;
  const canRecord = isInRoomStandby;
  const canPauseResume = isRecording || isPaused;
  const canStop = isRecording || isPaused;
  const canLeave = inSession || isJoining;

  const handleJoinClick = () => {
    if (!meetingUrl.trim()) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    onJoinClick();
  };

  const scrollToTranscript = () => {
    const el = document.getElementById('live-transcriber-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Step indicators for visual flow (Rule 8 — Reduce short-term memory load)
  const getStepState = (step: number) => {
    if (step === 1 && (inSession || isJoining)) return 'completed';
    if (step === 2 && (isRecording || isPaused)) return 'completed';
    if (step === 1 && isIdle) return 'active';
    if (step === 2 && isInRoomStandby) return 'active';
    if (step === 3 && (isRecording || isPaused)) return 'active';
    if (step === 4 && (isRecording || isPaused)) return 'active';
    return 'inactive';
  };

  return (
    <div className={`glass-card-strong p-4 sm:p-5 space-y-4 sm:space-y-5 transition-all duration-300 ${
      isRecording ? 'glow-recording' : ''
    }`}>
      {/* 1. Header & Quick Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#233863]/60">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shadow-md flex-shrink-0 transition-all duration-300 ${
            isRecording
              ? 'bg-gradient-to-br from-[#7A2530] to-[#992E3C] border border-[#992E3C]/40'
              : 'bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40'
          }`}>
            {isRecording ? (
              <MaterialIcon
                icon="radio"
                size="lg"
                filled
                className="text-[#FF8E9D] animate-pulse"
              />
            ) : (
              <img src="/chatbot-icon.png" alt="Chatbot" className="w-7 h-7" />
            )}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <span>Panel Kontrol Bot</span>
              <span className="text-[10px] sm:text-[11px] font-normal text-[#8A94A3] hidden sm:inline capitalize font-sans">
                (Google Meet, Zoom, MS Teams)
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] text-[#8A94A3] font-medium">Status:</span>
              {isIdle && <Badge variant="default" icon="check_circle">SIAP / STANDBY</Badge>}
              {isJoining && <Badge variant="warning" pulse icon="sync">MENGHUBUNGKAN...</Badge>}
              {isInRoomStandby && <Badge variant="cyan" icon="meeting_room">DI DALAM ROOM</Badge>}
              {isRecording && <Badge variant="danger" pulse icon="fiber_manual_record">LIVE RECORDING</Badge>}
              {isPaused && <Badge variant="warning" icon="pause_circle">DIJEDA (PAUSED)</Badge>}
            </div>
          </div>
        </div>

        {/* Timer & Audio Visualizer */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#233863]/40">
          <AudioVisualizer active={audioActive} isRecording={isRecording} />

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-mono text-xs sm:text-sm font-bold transition-all duration-300 shadow-lui-inner ${
            isRecording
              ? 'bg-gradient-to-r from-[#7A2530]/40 to-[#7A2530]/20 border-[#992E3C]/40 text-[#FF8E9D]'
              : isPaused
              ? 'bg-[#D9A441]/10 border-[#D9A441]/30 text-[#D9A441]'
              : 'bg-[#0B1220] border-[#233863] text-white'
          }`}>
            <MaterialIcon
              icon={isRecording ? 'fiber_manual_record' : isPaused ? 'pause' : 'timer'}
              size="sm"
              filled={isRecording}
              className={`${
                isRecording ? 'text-[#FF8E9D] animate-pulse' : isPaused ? 'text-[#D9A441]' : 'text-[#8A94A3]'
              }`}
            />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* 2. Target Meeting Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Platform Selector */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <MaterialIcon icon="devices" size="xs" className="text-[#3DD6E8]" />
            Platform
          </label>
          <div className="relative">
            <select
              value={platform}
              disabled={inSession}
              onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
              className={`w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 focus:border-[#3DD6E8]/50 disabled:opacity-40 appearance-none cursor-pointer shadow-lui-inner transition-all duration-200 ${
                platform ? 'text-white font-bold' : 'text-[#6B7585] font-normal'
              }`}
            >
              <option value="" className="bg-[#0B1220] text-[#6B7585]">-- Pilih Platform --</option>
              <option value="gmeet" className="bg-[#0B1220] text-white">Google Meet</option>
              <option value="zoom" className="bg-[#0B1220] text-white">Zoom Meeting</option>
              <option value="teams" className="bg-[#0B1220] text-white">Microsoft Teams</option>
            </select>
            <MaterialIcon icon="unfold_more" size="sm" className="absolute right-3 top-2.5 pointer-events-none text-[#6B7585]" />
          </div>
        </div>

        {/* Language Selector */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <MaterialIcon icon="translate" size="xs" className="text-[#3DD6E8]" />
            Language
          </label>
          <div className="relative">
            <select
              value={language}
              disabled={isRecording || isPaused}
              onChange={(e) => setLanguage(e.target.value as 'id' | 'en' | '')}
              className={`w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 focus:border-[#3DD6E8]/50 disabled:opacity-40 appearance-none cursor-pointer shadow-lui-inner transition-all duration-200 ${
                language ? 'text-white font-bold' : 'text-[#6B7585] font-normal'
              }`}
            >
              <option value="" className="bg-[#0B1220] text-[#6B7585]">-- Bahasa --</option>
              <option value="id" className="bg-[#0B1220] text-white">Indonesia (ID)</option>
              <option value="en" className="bg-[#0B1220] text-white">English (EN)</option>
            </select>
            <MaterialIcon icon="unfold_more" size="sm" className="absolute right-3 top-2.5 pointer-events-none text-[#6B7585]" />
          </div>
        </div>

        {/* Meeting Title */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <MaterialIcon icon="title" size="xs" className="text-[#3DD6E8]" />
            Topik Meeting
          </label>
          <input
            type="text"
            value={meetingTitle}
            disabled={inSession}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Masukkan judul meeting..."
            className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 focus:border-[#3DD6E8]/50 disabled:opacity-40 font-medium shadow-lui-inner transition-all duration-200"
          />
        </div>

        {/* Meeting URL */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-bold text-[#B8BFC9] mb-1.5 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MaterialIcon icon="link" size="xs" className="text-[#3DD6E8]" />
              Link URL Room
            </span>
            {meetingUrl && (
              <button
                onClick={handleCopyUrl}
                type="button"
                className="text-[10px] text-[#3DD6E8] hover:text-white font-bold flex items-center gap-1 transition-colors normal-case tracking-normal"
              >
                <MaterialIcon icon={copied ? 'check' : 'content_copy'} size="xs" className={copied ? 'text-[#3DD6E8]' : ''} />
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            )}
          </label>
          <div className="relative flex items-center">
            <input
              type="url"
              value={meetingUrl}
              disabled={inSession}
              onChange={(e) => {
                const val = e.target.value;
                setMeetingUrl(val);
                if (urlError && val.trim().length > 0) setUrlError(false);
                if (!platform) {
                  if (val.includes('meet.google.com')) setPlatform('gmeet');
                  else if (val.includes('zoom.us')) setPlatform('zoom');
                  else if (val.includes('teams.microsoft.com') || val.includes('teams.live.com')) setPlatform('teams');
                }
              }}
              placeholder="Masukkan link URL room meeting..."
              className={`w-full bg-[#0B1220] border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-[#6B7585] focus:outline-none focus:ring-2 focus:ring-[#3DD6E8]/50 font-mono disabled:opacity-40 shadow-lui-inner transition-all duration-200 ${
                urlError ? 'border-[#992E3C] focus:ring-[#992E3C]/50' : 'border-[#233863]'
              }`}
            />
            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 text-[#6B7585] hover:text-[#3DD6E8] transition-colors"
                title="Buka Link di Tab Baru"
              >
                <MaterialIcon icon="open_in_new" size="sm" />
              </a>
            )}
          </div>
          {urlError && (
            <p className="text-[11px] text-[#FF8E9D] mt-1.5 font-semibold flex items-center gap-1 animate-slide-up">
              <MaterialIcon icon="error" size="xs" className="text-[#FF8E9D]" />
              <span>Harap masukkan link URL room meeting</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Action Buttons — Desktop (Rule 1: Consistent flow, Rule 8: Step numbers) */}
      <div className="pt-1">
        <div className="hidden sm:grid sm:grid-cols-5 gap-3">
          {/* JOIN BOT */}
          <Button
            variant="primary"
            size="lg"
            loading={isJoining}
            disabled={!canJoin && isIdle}
            onClick={handleJoinClick}
            icon={
              <div className="flex items-center gap-1.5">
                <span className="step-chip bg-[#0B1220]/30 text-[#0B1220]">1</span>
                <MaterialIcon icon="login" size="md" className="text-[#0B1220]" />
              </div>
            }
            title="Bergabung ke room meeting (Ctrl + J)"
            className="w-full"
          >
            <span className="flex flex-col items-start">
              <span className="font-extrabold text-xs tracking-wide text-[#0B1220]">JOIN BOT</span>
              <span className="text-[9px] opacity-60 font-mono text-[#0B1220]">Ctrl+J</span>
            </span>
          </Button>

          {/* RECORD */}
          <Button
            variant="danger"
            size="lg"
            disabled={!canRecord}
            onClick={onRecord}
            icon={
              <div className="flex items-center gap-1.5">
                <span className="step-chip bg-white/15 text-white">2</span>
                <MaterialIcon icon="fiber_manual_record" size="md" filled={isRecording} className={isRecording ? 'animate-pulse' : ''} />
              </div>
            }
            title="Mulai Rekaman & Live Transkrip (Ctrl + R)"
            className="w-full"
          >
            <span className="flex flex-col items-start">
              <span className="font-bold text-xs tracking-wide">RECORD</span>
              <span className="text-[9px] opacity-60 font-mono">Ctrl+R</span>
            </span>
          </Button>

          {/* PAUSE / RESUME */}
          <Button
            variant="warning"
            size="lg"
            disabled={!canPauseResume}
            onClick={onPauseResume}
            icon={
              <div className="flex items-center gap-1.5">
                <span className="step-chip bg-[#0B1220]/30 text-[#0B1220]">3</span>
                <MaterialIcon icon={isPaused ? 'play_arrow' : 'pause'} size="md" filled className="text-[#0B1220]" />
              </div>
            }
            title="Jeda / Lanjutkan rekaman (Spacebar)"
            className="w-full"
          >
            <span className="flex flex-col items-start">
              <span className="font-extrabold text-xs tracking-wide text-[#0B1220]">{isPaused ? 'RESUME' : 'PAUSE'}</span>
              <span className="text-[9px] opacity-60 font-mono text-[#0B1220]">Space</span>
            </span>
          </Button>

          {/* STOP & SAVE */}
          <Button
            variant="navy"
            size="lg"
            disabled={!canStop}
            onClick={onStop}
            icon={
              <div className="flex items-center gap-1.5">
                <span className="step-chip bg-[#3DD6E8]/20 text-[#3DD6E8]">4</span>
                <MaterialIcon icon="stop" size="md" filled className="text-[#3DD6E8]" />
              </div>
            }
            title="Hentikan rekaman dan simpan otomatis (Ctrl + S)"
            className="w-full"
          >
            <span className="flex flex-col items-start">
              <span className="font-bold text-xs tracking-wide text-white">STOP & SAVE</span>
              <span className="text-[9px] opacity-60 font-mono text-[#3DD6E8]">Ctrl+S</span>
            </span>
          </Button>

          {/* LEAVE ROOM */}
          <Button
            variant="outline"
            size="lg"
            disabled={!canLeave}
            onClick={onLeave}
            icon={<MaterialIcon icon="logout" size="md" className="text-[#8A94A3]" />}
            title="Keluarkan bot dari room meeting"
            className="w-full hover:text-[#FF8E9D] hover:border-[#7A2530]/50"
          >
            <span className="flex flex-col items-start">
              <span className="font-bold text-xs tracking-wide">LEAVE</span>
              <span className="text-[9px] opacity-60 font-mono">Keluar</span>
            </span>
          </Button>
        </div>

        {/* Mobile View (2x2 + Full Leave) */}
        <div className="sm:hidden space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="primary"
              size="md"
              loading={isJoining}
              disabled={!canJoin && isIdle}
              onClick={handleJoinClick}
              icon={<MaterialIcon icon="login" size="sm" className="text-[#0B1220]" />}
              className="w-full"
            >
              <span className="font-extrabold text-xs text-[#0B1220]">1. JOIN</span>
            </Button>

            <Button
              variant="danger"
              size="md"
              disabled={!canRecord}
              onClick={onRecord}
              icon={<MaterialIcon icon="fiber_manual_record" size="sm" filled={isRecording} className={isRecording ? 'animate-pulse' : ''} />}
              className="w-full"
            >
              <span className="font-bold text-xs">2. RECORD</span>
            </Button>

            <Button
              variant="warning"
              size="md"
              disabled={!canPauseResume}
              onClick={onPauseResume}
              icon={<MaterialIcon icon={isPaused ? 'play_arrow' : 'pause'} size="sm" filled className="text-[#0B1220]" />}
              className="w-full"
            >
              <span className="font-extrabold text-xs text-[#0B1220]">{isPaused ? 'RESUME' : '3. PAUSE'}</span>
            </Button>

            <Button
              variant="navy"
              size="md"
              disabled={!canStop}
              onClick={onStop}
              icon={<MaterialIcon icon="stop" size="sm" filled className="text-[#3DD6E8]" />}
              className="w-full"
            >
              <span className="font-bold text-xs text-white">4. STOP</span>
            </Button>
          </div>

          <button
            onClick={onLeave}
            disabled={!canLeave}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0B1220] hover:bg-[#141E33] border border-[#233863] rounded-xl text-xs font-bold text-[#8A94A3] hover:text-[#FF8E9D] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] transition-all duration-200 ripple-container"
          >
            <MaterialIcon icon="logout" size="sm" />
            <span>Keluar Room (Leave Bot)</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Link (Mobile) */}
      {inSession && (
        <div className="sm:hidden pt-1 flex justify-center">
          <button
            onClick={scrollToTranscript}
            className="text-[11px] text-[#3DD6E8] hover:text-white font-bold flex items-center gap-1.5 bg-[#0B1220] px-3.5 py-1.5 rounded-full border border-[#233863] shadow-sm transition-all duration-200 hover:border-[#3DD6E8]/40"
          >
            <MaterialIcon icon="arrow_downward" size="xs" />
            <span>Lihat Transkrip Live</span>
          </button>
        </div>
      )}
    </div>
  );
};
