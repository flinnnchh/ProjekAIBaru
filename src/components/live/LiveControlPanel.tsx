import React from 'react';
import {
  LogIn,
  Circle,
  Pause,
  Play,
  Square,
  LogOut,
  Radio,
  ExternalLink,
  Layers,
  Globe,
  Copy,
  Check
} from 'lucide-react';
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

  // State condition flags (Error Prevention State Machine)
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
    onJoin();
  };

  const scrollToTranscript = () => {
    const el = document.getElementById('live-transcriber-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#141E33] border border-[#233863] rounded-2xl p-4 sm:p-5 shadow-lui-card backdrop-blur-xl space-y-4 sm:space-y-5">
      {/* 1. Header & Quick Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#233863]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#233863] border border-[#3A4E7A] rounded-xl text-[#3DD6E8] shadow-md flex-shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Panel Kontrol Bot Meeting</span>
              <span className="text-[10px] sm:text-[11px] font-normal text-[#B8BFC9] hidden sm:inline capitalize">
                (Google Meet, Zoom, MS Teams)
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-[#B8BFC9] font-medium">Status Bot:</span>
              {isIdle && <Badge variant="default">SIAP / STANDBY</Badge>}
              {isJoining && <Badge variant="warning" pulse>MENGHUBUNGKAN BOT...</Badge>}
              {isInRoomStandby && <Badge variant="cyan">DI DALAM ROOM (STANDBY)</Badge>}
              {isRecording && <Badge variant="danger" pulse>LIVE RECORDING</Badge>}
              {isPaused && <Badge variant="warning">REKAMAN DIJEDA (PAUSED)</Badge>}
            </div>
          </div>
        </div>

        {/* Informative Feedback: Recording Timer & Audio Visualizer */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#233863]/60">
          <AudioVisualizer active={audioActive} isRecording={isRecording} />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold transition-all shadow-inner ${
            isRecording
              ? 'bg-[#7A2530]/40 border-[#7A2530] text-[#FF8E9D]'
              : isPaused
              ? 'bg-[#D9A441]/20 border-[#D9A441]/50 text-[#D9A441]'
              : 'bg-[#0B1220] border-[#233863] text-white'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-[#FF8E9D] animate-ping' : isPaused ? 'bg-[#D9A441]' : 'bg-[#B8BFC9]'
            }`} />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* 2. Target Meeting Inputs (Navy #141E33 with Border #233863) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Platform Selector */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-white mb-1.5">
            Platform Meeting
          </label>
          <div className="relative">
            <select
              value={platform}
              disabled={inSession}
              onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
              className={`w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] focus:border-[#3DD6E8] disabled:opacity-50 appearance-none cursor-pointer shadow-inner ${
                platform ? 'text-white font-bold' : 'text-[#B8BFC9]/70 font-normal'
              }`}
            >
              <option value="" className="bg-[#0B1220] text-[#B8BFC9]/60">-- Pilih Platform Meeting --</option>
              <option value="gmeet" className="bg-[#0B1220] text-white">Google Meet</option>
              <option value="zoom" className="bg-[#0B1220] text-white">Zoom Meeting (Web Engine)</option>
              <option value="teams" className="bg-[#0B1220] text-white">Microsoft Teams</option>
            </select>
            <Layers className="w-4 h-4 text-[#B8BFC9] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Language Selector */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-white mb-1.5">
            Language
          </label>
          <div className="relative">
            <select
              value={language}
              disabled={inSession}
              onChange={(e) => setLanguage(e.target.value as 'id' | 'en' | '')}
              className={`w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] focus:border-[#3DD6E8] disabled:opacity-50 appearance-none cursor-pointer shadow-inner ${
                language ? 'text-white font-bold' : 'text-[#B8BFC9]/70 font-normal'
              }`}
            >
              <option value="" className="bg-[#0B1220] text-[#B8BFC9]/60">-- Pilih Bahasa --</option>
              <option value="id" className="bg-[#0B1220] text-white">Indonesia (ID)</option>
              <option value="en" className="bg-[#0B1220] text-white">English (EN)</option>
            </select>
            <Globe className="w-4 h-4 text-[#B8BFC9] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Meeting Title Input */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-white mb-1.5">
            Topik / Judul Meeting
          </label>
          <input
            type="text"
            value={meetingTitle}
            disabled={inSession}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Masukkan topik / judul meeting..."
            className="w-full bg-[#0B1220] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] focus:border-[#3DD6E8] disabled:opacity-50 font-medium shadow-inner"
          />
        </div>

        {/* Meeting URL Input */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
            <span>Link URL Room Meeting</span>
            {meetingUrl && (
              <button
                onClick={handleCopyUrl}
                type="button"
                className="text-[10px] text-[#3DD6E8] hover:text-white font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-[#3DD6E8]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Tersalin' : 'Salin URL'}
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
                // Smart platform auto-detect if platform not yet chosen
                if (!platform) {
                  if (val.includes('meet.google.com')) setPlatform('gmeet');
                  else if (val.includes('zoom.us')) setPlatform('zoom');
                  else if (val.includes('teams.microsoft.com') || val.includes('teams.live.com')) setPlatform('teams');
                }
              }}
              placeholder="Masukkan link URL room meeting..."
              className={`w-full bg-[#0B1220] border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-[#B8BFC9]/60 focus:outline-none focus:ring-2 focus:ring-[#3DD6E8] font-mono disabled:opacity-50 shadow-inner ${
                urlError ? 'border-[#7A2530] focus:ring-[#7A2530]' : 'border-[#233863]'
              }`}
            />
            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 text-[#B8BFC9] hover:text-white"
                title="Buka Link di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {urlError && (
            <p className="text-[11px] text-[#FF8E9D] mt-1 font-semibold flex items-center gap-1 animate-in fade-in duration-150">
              <span>⚠️ Harap masukkan link URL room meeting terlebih dahulu</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Action Buttons Grid (Responsive 2x2 + 1 on Mobile, 1x5 on Desktop) */}
      <div className="pt-1">
        {/* Desktop View (1x5) */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-3">
          {/* Button 1: JOIN (Primary Action -> Gold #F5B400 with dark navy text #0B1220) */}
          <Button
            variant="primary"
            size="lg"
            loading={isJoining}
            disabled={!canJoin && isIdle}
            onClick={handleJoinClick}
            icon={<LogIn className="w-4 h-4 text-[#0B1220]" />}
            title="Bergabung ke room meeting (Ctrl + J)"
            className="w-full relative group shadow-md active:scale-[0.98] transition-transform"
          >
            <span className="flex flex-col items-center">
              <span className="font-extrabold text-xs tracking-wide text-[#0B1220]">1. JOIN BOT</span>
              <span className="text-[10px] opacity-75 font-mono text-[#0B1220]">Ctrl+J</span>
            </span>
          </Button>

          {/* Button 2: RECORD (Red Maroon #7A2530) */}
          <Button
            variant="danger"
            size="lg"
            disabled={!canRecord}
            onClick={onRecord}
            icon={<Circle className={`w-4 h-4 fill-current ${isRecording ? 'animate-pulse' : ''}`} />}
            title="Mulai Rekaman & Live Transkrip (Ctrl + R)"
            className="w-full group shadow-md active:scale-[0.98] transition-transform"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide">2. RECORD</span>
              <span className="text-[10px] opacity-80 font-mono">Ctrl+R</span>
            </span>
          </Button>

          {/* Button 3: PAUSE / RESUME (Lighter Gold #D9A441) */}
          <Button
            variant="warning"
            size="lg"
            disabled={!canPauseResume}
            onClick={onPauseResume}
            icon={isPaused ? <Play className="w-4 h-4 fill-current text-[#0B1220]" /> : <Pause className="w-4 h-4 fill-current text-[#0B1220]" />}
            title="Jeda / Lanjutkan rekaman tanpa merusak transkrip (Spacebar)"
            className="w-full group shadow-md active:scale-[0.98] transition-transform"
          >
            <span className="flex flex-col items-center">
              <span className="font-extrabold text-xs tracking-wide text-[#0B1220]">
                {isPaused ? 'RESUME' : '3. PAUSE'}
              </span>
              <span className="text-[10px] opacity-75 font-mono text-[#0B1220]">Spacebar</span>
            </span>
          </Button>

          {/* Button 4: STOP & SAVE (Navy Terang #3A4E7A) */}
          <Button
            variant="navy"
            size="lg"
            disabled={!canStop}
            onClick={onStop}
            icon={<Square className="w-4 h-4 fill-current text-[#3DD6E8]" />}
            title="Hentikan rekaman dan simpan otomatis (Ctrl + S)"
            className="w-full group shadow-md active:scale-[0.98] transition-transform"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide text-white">4. STOP &amp; SAVE</span>
              <span className="text-[10px] opacity-80 font-mono text-[#3DD6E8]">Ctrl+S</span>
            </span>
          </Button>

          {/* Button 5: LEAVE ROOM */}
          <Button
            variant="outline"
            size="lg"
            disabled={!canLeave}
            onClick={onLeave}
            icon={<LogOut className="w-4 h-4 text-[#B8BFC9]" />}
            title="Keluarkan bot dari room meeting"
            className="w-full border-[#233863] hover:bg-white/5 text-[#B8BFC9] hover:text-white group active:scale-[0.98] transition-transform"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide">LEAVE ROOM</span>
              <span className="text-[10px] opacity-70 font-mono">Keluar</span>
            </span>
          </Button>
        </div>

        {/* Mobile View (Clean 2x2 Flow + Full Width Leave Bar) */}
        <div className="sm:hidden space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. JOIN BOT */}
            <Button
              variant="primary"
              size="md"
              loading={isJoining}
              disabled={!canJoin && isIdle}
              onClick={handleJoinClick}
              icon={<LogIn className="w-4 h-4 text-[#0B1220]" />}
              className="w-full shadow-md active:scale-[0.98] transition-transform"
            >
              <span className="font-extrabold text-xs text-[#0B1220]">1. JOIN BOT</span>
            </Button>

            {/* 2. RECORD */}
            <Button
              variant="danger"
              size="md"
              disabled={!canRecord}
              onClick={onRecord}
              icon={<Circle className={`w-4 h-4 fill-current ${isRecording ? 'animate-pulse' : ''}`} />}
              className="w-full shadow-md active:scale-[0.98] transition-transform"
            >
              <span className="font-bold text-xs">2. RECORD</span>
            </Button>

            {/* 3. PAUSE / RESUME */}
            <Button
              variant="warning"
              size="md"
              disabled={!canPauseResume}
              onClick={onPauseResume}
              icon={isPaused ? <Play className="w-4 h-4 fill-current text-[#0B1220]" /> : <Pause className="w-4 h-4 fill-current text-[#0B1220]" />}
              className="w-full shadow-md active:scale-[0.98] transition-transform"
            >
              <span className="font-extrabold text-xs text-[#0B1220]">{isPaused ? 'RESUME' : '3. PAUSE'}</span>
            </Button>

            {/* 4. STOP & SAVE */}
            <Button
              variant="navy"
              size="md"
              disabled={!canStop}
              onClick={onStop}
              icon={<Square className="w-4 h-4 fill-current text-[#3DD6E8]" />}
              className="w-full shadow-md active:scale-[0.98] transition-transform"
            >
              <span className="font-bold text-xs text-white">4. STOP &amp; SAVE</span>
            </Button>
          </div>

          {/* 5. LEAVE ROOM (Balanced Secondary Full Bar) */}
          <button
            onClick={onLeave}
            disabled={!canLeave}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0B1220] hover:bg-[#141E33] border border-[#233863] rounded-xl text-xs font-bold text-[#B8BFC9] hover:text-[#FF8E9D] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Room (Leave Bot)</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Link on Mobile when in session */}
      {inSession && (
        <div className="sm:hidden pt-1 flex justify-center">
          <button
            onClick={scrollToTranscript}
            className="text-[11px] text-[#3DD6E8] hover:text-white font-bold flex items-center gap-1 bg-[#0B1220] px-3 py-1 rounded-full border border-[#233863] shadow-sm"
          >
            <span>Lihat Transkrip Live Mengalir</span>
            <span>↓</span>
          </button>
        </div>
      )}
    </div>
  );
};




