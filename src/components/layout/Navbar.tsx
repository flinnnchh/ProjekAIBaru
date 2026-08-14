import React from 'react';
import { Bot, Calendar, History, Radio, Keyboard, HelpCircle } from 'lucide-react';
import { VpnStatusBadge } from './VpnStatusBadge';

interface NavbarProps {
  activeTab: 'live' | 'schedule' | 'history';
  setActiveTab: (tab: 'live' | 'schedule' | 'history') => void;
  onOpenHotkeyGuide: () => void;
  vpnConnected: boolean;
  vpnIp?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHotkeyGuide,
  vpnConnected,
  vpnIp,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0F172A] rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                MEETBOT <span className="text-blue-400">AI</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300 font-mono">
                DEEPGRAM NOVA-2
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated Bot & Live Multilingual Transcriber</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'live'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeTab === 'live' ? 'animate-pulse text-white' : ''}`} />
            Live Session
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Jadwal Meeting
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat & Transkrip
          </button>
        </nav>

        {/* Right Info & Hotkey trigger */}
        <div className="flex items-center gap-3">
          <VpnStatusBadge connected={vpnConnected} ip={vpnIp} />

          <button
            onClick={onOpenHotkeyGuide}
            title="Panduan Tombol Pintas Keyboard (Tekan '?')"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all"
          >
            <Keyboard className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[11px]">Hotkeys</span>
            <kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-700 text-[10px] text-slate-400">?</kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
