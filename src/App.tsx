import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { LiveControlPanel } from './components/live/LiveControlPanel';
import { LiveTranscriber } from './components/live/LiveTranscriber';
import { TranscribeModePicker, TranscribeMode } from './components/live/TranscribeModePicker';
import { TranscriptProcessingLoader } from './components/live/TranscriptProcessingLoader';
import { ScheduleList } from './components/schedule/ScheduleList';
import { HistoryList } from './components/history/HistoryList';
import { AdminPanel } from './components/admin/AdminPanel';
import { ClosureDialog } from './components/live/ClosureDialog';
import { HotkeyGuideModal } from './components/live/HotkeyGuideModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { MaterialIcon } from './components/common/MaterialIcon';
import { useMeetingBot } from './hooks/useMeetingBot';
import { useHotkeys } from './hooks/useHotkeys';
import { authService } from './services/authService';
import { AuthUser } from './types/auth';

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getUser());
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'live' | 'schedule' | 'history' | 'admin'>(() => {
    const u = authService.getUser();
    return u?.role === 'admin' ? 'admin' : 'live';
  });
  const [isHotkeyGuideOpen, setIsHotkeyGuideOpen] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);


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
    meetingStartTime,
    participants,
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
    handleStartSessionFromSchedule,
    transcribeMode,
    setTranscribeMode,
    isProcessingBatch,
    batchProgress,
  } = useMeetingBot(currentUser?.id);

  // Sync current user profile from server on mount
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getCurrentUser().then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
          if (res.user.role === 'admin') {
            setActiveTab('admin');
          } else if (activeTab === 'admin') {
            setActiveTab('live');
          }
        }
      });
    }
  }, []);


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

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAuthView('login');
  };

  // If user is not logged in, display Login or Register page
  if (!currentUser) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col selection:bg-[#F5B400] selection:text-[#0B1220] relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#233863]/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-[#3DD6E8]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#F5B400]/5 rounded-full blur-3xl" />
      </div>

      {/* Auto-Scheduler Notification Banner */}
      {activeNotification && (
        <div className="bg-gradient-to-r from-[#141E33] via-[#1A2845] to-[#233863] text-white px-4 py-2.5 text-xs font-semibold shadow-lg sticky top-0 z-50 animate-slide-up border-b border-[#233863]/60">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-lg bg-black/20">
                <MaterialIcon icon="auto_awesome" size="sm" className="text-[#F5B400]" />
              </span>
              <span>{activeNotification}</span>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-[#8A94A3] hover:text-white bg-black/20 hover:bg-black/40 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center gap-1"
            >
              <MaterialIcon icon="close" size="xs" />
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHotkeyGuide={() => setIsHotkeyGuideOpen(true)}
        vpnConnected={vpnConnected}
        vpnIp={vpnIp}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Mobile Recording Status Pill (Rule 8: Reduce memory load) */}
      {botState === 'RECORDING' && (
        <div className="sm:hidden sticky top-16 z-30 px-4 py-2 bg-gradient-to-r from-[#7A2530]/90 to-[#992E3C]/80 backdrop-blur-xl border-b border-[#FF8E9D]/30 text-white flex items-center justify-between text-xs shadow-lg animate-slide-up">
          <div className="flex items-center gap-2 font-mono">
            <MaterialIcon icon="fiber_manual_record" size="xs" filled className="text-[#FF8E9D] animate-pulse" />
            <span className="font-extrabold text-[11px] text-[#FF8E9D]">REC</span>
            <span className="font-bold">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={handleStop}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1"
          >
            <MaterialIcon icon="stop" size="xs" filled />
            Stop & Simpan
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 relative z-10">
        {currentUser?.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <>
            {activeTab === 'live' && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
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
                  onJoinClick={() => setShowModePicker(true)}
                  onRecord={handleRecord}
                  onPauseResume={handlePauseResume}
                  onStop={handleStop}
                  onLeave={handleLeave}
                />

                {/* Show Processing Loader during batch processing */}
                {isProcessingBatch && (
                  <TranscriptProcessingLoader
                    currentStep={batchProgress.step}
                    currentMessage={batchProgress.message}
                  />
                )}

                {/* Always show LiveTranscriber container when not processing batch */}
                {!isProcessingBatch && (
                  <LiveTranscriber
                    transcripts={transcripts}
                    interimText={interimText}
                    interimSpeaker={interimSpeaker}
                    interimLanguage={interimLanguage}
                    isRecording={botState === 'RECORDING'}
                    liveTranscribeEnabled={transcribeMode !== 'background'}
                    onExportDocx={handleExportDocx}
                    onExportTxt={handleExportTxt}
                    onClearTranscripts={handleClearTranscripts}
                  />
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <ScheduleList
                schedules={schedules}
                onAddSchedule={handleAddSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onStartSessionFromSchedule={onStartFromSchedule}
                currentMeetingUrl={meetingUrl}
                botState={botState}
                onGoToLiveTab={() => setActiveTab('live')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryList
                history={history}
                onDeleteHistoryItem={handleDeleteHistoryItem}
              />
            )}
          </>
        )}
      </main>


      {/* Footer */}
      <footer className="hidden sm:block border-t border-[#233863]/60 bg-[#0B1220]/90 backdrop-blur-2xl py-3.5 text-xs text-[#8A94A3] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MaterialIcon icon="memory" size="sm" className="text-[#3DD6E8]" />
              Engine: <strong className="text-white">Playwright + Deepgram Nova-2</strong>
            </span>
            <span className="hidden sm:inline-block text-[#233863]">•</span>
            <span className="hidden sm:flex items-center gap-1.5 text-[#3DD6E8]">
              <MaterialIcon icon="vpn_lock" size="sm" />
              Traffic Encrypted via Corporate VPN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHotkeyGuideOpen(true)}
              className="text-[#8A94A3] hover:text-white transition-colors flex items-center gap-1.5"
            >
              Hotkeys: <kbd className="keycap">?</kbd>
            </button>
            <span className="text-[#6B7585] font-mono">v1.0.0 (Enterprise)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClosureDialog
        isOpen={isClosureOpen}
        session={{
          title: meetingTitle,
          platform,
          url: meetingUrl,
          startTime: meetingStartTime,
          date: meetingStartTime || new Date().toISOString(),
          elapsedSeconds,
          vpnIp,
          participants
        }}
        transcripts={transcripts}
        onClose={() => {
          setIsClosureOpen(false);
          handleClearTranscripts();
        }}
        onGoToHistory={() => {
          setIsClosureOpen(false);
          handleClearTranscripts();
          setActiveTab('history');
        }}
      />


      <HotkeyGuideModal
        isOpen={isHotkeyGuideOpen}
        onClose={() => setIsHotkeyGuideOpen(false)}
      />

      {/* Transcribe Mode Picker Popup */}
      <TranscribeModePicker
        isOpen={showModePicker}
        meetingTitle={meetingTitle}
        onConfirm={(mode: TranscribeMode) => {
          setTranscribeMode(mode);
          setShowModePicker(false);
          handleJoin();
        }}
        onCancel={() => setShowModePicker(false)}
      />
    </div>
  );
}

export default App;
