import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { LiveControlPanel } from './components/live/LiveControlPanel';
import { LiveTranscriber } from './components/live/LiveTranscriber';
import { ScheduleList } from './components/schedule/ScheduleList';
import { HistoryList } from './components/history/HistoryList';
import { ClosureDialog } from './components/live/ClosureDialog';
import { HotkeyGuideModal } from './components/live/HotkeyGuideModal';
import { useMeetingBot } from './hooks/useMeetingBot';
import { useHotkeys } from './hooks/useHotkeys';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'schedule' | 'history'>('live');
  const [isHotkeyGuideOpen, setIsHotkeyGuideOpen] = useState(false);

  const {
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
    vpnConnected,
    vpnIp,
    transcripts,
    interimText,
    interimSpeaker,
    interimLanguage,
    schedules,
    history,
    isClosureOpen,
    setIsClosureOpen,
    activeNotification,
    setActiveNotification,
    handleJoin,
    handleRecord,
    handlePauseResume,
    handleStop,
    handleLeave,
    handleExportDocx,
    handleExportTxt,
    handleAddSchedule,
    handleDeleteSchedule,
    handleDeleteHistoryItem,
    handleStartSessionFromSchedule
  } = useMeetingBot();

  // Switch to live tab if an auto-schedule triggers
  React.useEffect(() => {
    if (activeNotification) {
      setActiveTab('live');
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, setActiveNotification]);

  // Register Global Keyboard Hotkeys
  useHotkeys({
    onJoin: handleJoin,
    onRecord: handleRecord,
    onPauseResume: handlePauseResume,
    onStop: handleStop,
    onExportTxt: handleExportTxt,
    onExportDocx: handleExportDocx,
    onToggleGuide: () => setIsHotkeyGuideOpen((prev) => !prev),
  });

  const onStartFromSchedule = (schedule: any, autoJoin: boolean = true) => {
    handleStartSessionFromSchedule(schedule, autoJoin);
    setActiveTab('live');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Auto-Scheduler Notification Banner */}
      {activeNotification && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl sticky top-0 z-50 animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </span>
              <span>{activeNotification}</span>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-2.5 py-1 rounded-lg text-[11px] transition-colors"
            >
              Tutup Notifikasi
            </button>
          </div>
        </div>
      )}

      {/* 1. Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHotkeyGuide={() => setIsHotkeyGuideOpen(true)}
        vpnConnected={vpnConnected}
        vpnIp={vpnIp}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'live' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Live Control Panel */}
            <LiveControlPanel
              meetingUrl={meetingUrl}
              setMeetingUrl={setMeetingUrl}
              meetingTitle={meetingTitle}
              setMeetingTitle={setMeetingTitle}
              platform={platform}
              setPlatform={setPlatform}
              language={language}
              setLanguage={setLanguage}
              botState={botState}
              elapsedSeconds={elapsedSeconds}
              audioActive={audioActive}
              onJoin={handleJoin}
              onRecord={handleRecord}
              onPauseResume={handlePauseResume}
              onStop={handleStop}
              onLeave={handleLeave}
            />

            {/* Live Transcriber Panel */}
            <LiveTranscriber
              transcripts={transcripts}
              interimText={interimText}
              interimSpeaker={interimSpeaker}
              interimLanguage={interimLanguage}
              isRecording={botState === 'RECORDING'}
              onExportDocx={handleExportDocx}
              onExportTxt={handleExportTxt}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="animate-in fade-in duration-200">
            <ScheduleList
              schedules={schedules}
              onAddSchedule={handleAddSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onStartSessionFromSchedule={onStartFromSchedule}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <HistoryList
              history={history}
              onDeleteHistoryItem={handleDeleteHistoryItem}
            />
          </div>
        )}
      </main>

      {/* 3. Footer Status Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Engine: <strong className="text-slate-300">Playwright + Deepgram Nova-2</strong>
            </span>
            <span className="hidden sm:inline-block text-slate-700">•</span>
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Traffic Encrypted via Corporate VPN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHotkeyGuideOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Hotkeys: <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-slate-300">?</kbd>
            </button>
            <span>v1.0.0 (Production Ready)</span>
          </div>
        </div>
      </footer>

      {/* 4. Modals & Dialogs */}
      <ClosureDialog
        isOpen={isClosureOpen}
        session={{
          title: meetingTitle,
          platform,
          url: meetingUrl,
          elapsedSeconds,
          vpnIp
        }}
        transcripts={transcripts}
        onClose={() => setIsClosureOpen(false)}
        onGoToHistory={() => {
          setIsClosureOpen(false);
          setActiveTab('history');
        }}
      />

      <HotkeyGuideModal
        isOpen={isHotkeyGuideOpen}
        onClose={() => setIsHotkeyGuideOpen(false)}
      />
    </div>
  );
}

export default App;
