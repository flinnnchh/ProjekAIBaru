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
  Video,
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
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
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

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-5">
      {/* 1. Header & Quick Info Bar (Reduce Memory Load) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/80 border border-blue-500/30 rounded-xl text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Panel Kontrol Bot Meeting
              <span className="text-[11px] font-normal text-slate-400 capitalize">
                (Google Meet, Zoom, MS Teams)
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">Status Bot:</span>
              {isIdle && <Badge variant="default">SIAP / DISCONNECTED</Badge>}
              {isJoining && <Badge variant="warning" pulse>MENGHUBUNGKAN BOT...</Badge>}
              {isInRoomStandby && <Badge variant="cyan">DI DALAM ROOM (STANDBY)</Badge>}
              {isRecording && <Badge variant="danger" pulse>LIVE RECORDING</Badge>}
              {isPaused && <Badge variant="warning">REKAMAN DIJEDA (PAUSED)</Badge>}
            </div>
          </div>
        </div>

        {/* Informative Feedback: Recording Timer & Audio Visualizer */}
        <div className="flex items-center gap-3">
          <AudioVisualizer active={audioActive} isRecording={isRecording} />

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all ${
            isRecording
              ? 'bg-red-950/60 border-red-500/40 text-red-300 shadow-md shadow-red-500/10'
              : isPaused
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/70 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-red-500 animate-ping' : isPaused ? 'bg-amber-400' : 'bg-slate-600'
            }`} />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* 2. Target Meeting Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Platform Selector */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Platform Meeting
          </label>
          <div className="relative">
            <select
              value={platform}
              disabled={inSession}
              onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none font-medium cursor-pointer"
            >
              <option value="gmeet">Google Meet (Utama)</option>
              <option value="zoom">Zoom Meeting (Web Engine)</option>
              <option value="teams">Microsoft Teams</option>
            </select>
            <Layers className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Language Selector */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Bahasa STT
          </label>
          <div className="relative">
            <select
              value={language}
              disabled={inSession}
              onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none font-medium cursor-pointer"
            >
              <option value="id">🇮🇩 ID (Indo)</option>
              <option value="en">🇬🇧 EN (English)</option>
            </select>
            <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Meeting Title Input */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Topik / Judul Meeting
          </label>
          <input
            type="text"
            value={meetingTitle}
            disabled={inSession}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Contoh: Sprint Review"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Meeting URL Input */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Link URL Room Meeting</span>
            {meetingUrl && (
              <button
                onClick={handleCopyUrl}
                type="button"
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Tersalin' : 'Salin URL'}
              </button>
            )}
          </label>
          <div className="relative flex items-center">
            <input
              type="url"
              value={meetingUrl}
              disabled={inSession}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono disabled:opacity-50"
            />
            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 text-slate-400 hover:text-white"
                title="Buka Link di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Action Buttons Grid (8 Golden Rules: Consistency, Error Prevention, Feedback) */}
      <div className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Button 1: JOIN */}
          <Button
            variant="success"
            size="lg"
            loading={isJoining}
            disabled={!canJoin}
            onClick={onJoin}
            icon={<LogIn className="w-4 h-4" />}
            title="Bergabung ke room meeting (Ctrl + J)"
            className="w-full relative group"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide">1. JOIN BOT</span>
              <span className="text-[10px] opacity-75 font-mono">Ctrl+J</span>
            </span>
          </Button>

          {/* Button 2: RECORD (Standard Industrial Red Circle) */}
          <Button
            variant="danger"
            size="lg"
            disabled={!canRecord}
            onClick={onRecord}
            icon={<Circle className={`w-4 h-4 fill-current ${isRecording ? 'animate-pulse' : ''}`} />}
            title="Mulai Rekaman & Live Transkrip (Ctrl + R)"
            className="w-full group"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide">2. RECORD</span>
              <span className="text-[10px] opacity-75 font-mono">Ctrl+R</span>
            </span>
          </Button>

          {/* Button 3: PAUSE / RESUME (Standard Double Line / Play Icon) */}
          <Button
            variant="warning"
            size="lg"
            disabled={!canPauseResume}
            onClick={onPauseResume}
            icon={isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            title="Jeda / Lanjutkan rekaman tanpa merusak transkrip (Spacebar)"
            className="w-full group"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide">
                {isPaused ? 'RESUME' : '3. PAUSE'}
              </span>
              <span className="text-[10px] opacity-75 font-mono">Spacebar</span>
            </span>
          </Button>

          {/* Button 4: STOP & SAVE (Standard Square Icon) */}
          <Button
            variant="secondary"
            size="lg"
            disabled={!canStop}
            onClick={onStop}
            icon={<Square className="w-4 h-4 fill-current text-blue-400" />}
            title="Hentikan rekaman dan simpan otomatis (Ctrl + S)"
            className="w-full hover:border-blue-500/60 group"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide text-blue-300">4. STOP & SAVE</span>
              <span className="text-[10px] opacity-75 font-mono">Ctrl+S</span>
            </span>
          </Button>

          {/* Button 5: LEAVE ROOM */}
          <Button
            variant="outline"
            size="lg"
            disabled={!canLeave}
            onClick={onLeave}
            icon={<LogOut className="w-4 h-4 text-red-400" />}
            title="Keluarkan bot dari room meeting"
            className="w-full hover:bg-red-950/40 hover:border-red-500/40 group"
          >
            <span className="flex flex-col items-center">
              <span className="font-bold text-xs tracking-wide text-red-300">LEAVE ROOM</span>
              <span className="text-[10px] opacity-60 font-mono">Keluar</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
