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
    handleClearTranscripts,
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
    onClearTranscripts: handleClearTranscripts,
    onToggleGuide: () => setIsHotkeyGuideOpen((prev) => !prev),
  });

  const onStartFromSchedule = (schedule: any, autoJoin: boolean = true) => {
    handleStartSessionFromSchedule(schedule, autoJoin);
    setActiveTab('live');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col selection:bg-[#F5B400] selection:text-[#0B1220] relative overflow-x-hidden">
      {/* Background Ambient Glows (Matching LUI Website Visuals) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#233863]/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-[#3DD6E8]/10 rounded-full blur-3xl" />
      </div>

      {/* Auto-Scheduler Notification Banner */}
      {activeNotification && (
        <div className="bg-gradient-to-r from-[#141E33] via-[#233863] to-[#3A4E7A] text-white px-4 py-2.5 text-xs font-semibold shadow-lg sticky top-0 z-50 animate-in slide-in-from-top duration-300 border-b border-[#233863]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-lg bg-black/30">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B400]" />
              </span>
              <span>{activeNotification}</span>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-[#B8BFC9] hover:text-white bg-black/40 hover:bg-black/60 px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors"
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

      {/* Mobile Floating Recording Status Pill (Rule 8: Reduce short-term memory load) */}
      {botState === 'RECORDING' && (
        <div className="sm:hidden sticky top-16 z-30 px-4 py-2 bg-[#7A2530]/95 backdrop-blur-md border-b border-[#FF8E9D]/40 text-white flex items-center justify-between text-xs shadow-lg animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF8E9D] animate-ping" />
            <span className="font-extrabold text-[11px] text-[#FF8E9D]">RECORDING</span>
            <span className="font-bold">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={handleStop}
            className="px-2.5 py-1 bg-[#3A4E7A] hover:bg-[#4A6296] border border-[#233863] text-white rounded-lg text-[10px] font-bold shadow-sm"
          >
            Stop &amp; Simpan
          </button>
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 relative z-10">
        {activeTab === 'live' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
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
              onClearTranscripts={handleClearTranscripts}
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
              currentMeetingUrl={meetingUrl}
              botState={botState}
              onGoToLiveTab={() => setActiveTab('live')}
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
      <footer className="hidden sm:block border-t border-[#233863] bg-[#0B1220]/95 backdrop-blur-xl py-3.5 text-xs text-[#B8BFC9] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#B8BFC9]">
              <Cpu className="w-3.5 h-3.5 text-[#3DD6E8]" />
              Engine: <strong className="text-white">Playwright + Deepgram Nova-2</strong>
            </span>
            <span className="hidden sm:inline-block text-[#233863]">•</span>
            <span className="hidden sm:flex items-center gap-1.5 text-[#3DD6E8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3DD6E8]" />
              Traffic Encrypted via Corporate Private VPN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHotkeyGuideOpen(true)}
              className="text-[#B8BFC9] hover:text-white transition-colors"
            >
              Hotkeys: <kbd className="font-mono bg-[#233863] px-1.5 py-0.5 rounded border border-[#3A4E7A] text-[11px] text-[#F5B400] font-bold">?</kbd>
            </button>
            <span className="text-[#B8BFC9]/70 font-mono">v1.0.0 (Enterprise Production Ready)</span>
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



