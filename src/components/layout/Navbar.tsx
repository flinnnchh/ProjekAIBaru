import React, { useState } from 'react';
import { Bot, Calendar, History, Radio, Keyboard, Menu, X, ShieldCheck } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#233863] bg-[#0B1220]/95 backdrop-blur-xl text-white shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#233863] via-[#3A4E7A] to-[#F5B400] p-[1.5px] shadow-md shadow-black/40 flex-shrink-0">
              <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#3DD6E8]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1 truncate">
                  ENTERPRISE <span className="text-[#F5B400]">MEETBOT</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-[#141E33] border border-[#233863] text-[#3DD6E8] font-mono font-bold flex-shrink-0">
                  NOVA-2
                </span>
              </div>
              <p className="text-[11px] text-[#B8BFC9] hidden md:block truncate">
                Automated Bot &amp; Enterprise Multilingual Transcriber
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#080E1A]/90 p-1 rounded-xl border border-[#233863] shadow-inner">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'live'
                  ? 'bg-[#233863] text-white border border-[#3DD6E8]/60 shadow-md shadow-black/30'
                  : 'text-[#B8BFC9] hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'live' ? 'animate-pulse text-[#3DD6E8]' : ''}`} />
              Live Session
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-[#233863] text-white border border-[#3DD6E8]/60 shadow-md shadow-black/30'
                  : 'text-[#B8BFC9] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Jadwal Meeting
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#233863] text-white border border-[#3DD6E8]/60 shadow-md shadow-black/30'
                  : 'text-[#B8BFC9] hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat &amp; Transkrip
            </button>
          </nav>

          {/* Right Info & Hotkey trigger (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <VpnStatusBadge connected={vpnConnected} ip={vpnIp} />

            <button
              onClick={onOpenHotkeyGuide}
              title="Panduan Tombol Pintas Keyboard (Tekan '?')"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#B8BFC9] hover:text-white bg-[#141E33] hover:bg-[#1C2C4C] border border-[#233863] rounded-xl transition-all shadow-sm"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#3DD6E8]" />
              <span className="font-mono text-[11px] font-bold">Hotkeys</span>
              <kbd className="px-1.5 py-0.2 bg-[#0B1220] rounded border border-[#233863] text-[10px] text-[#F5B400] font-bold">?</kbd>
            </button>
          </div>

          {/* Mobile Quick Action / Menu Toggle (Mobile Only) */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#141E33] border border-[#233863] rounded-lg text-[10px] font-mono text-[#3DD6E8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DD6E8] animate-ping" />
              <span>VPN ON</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-[#141E33] border border-[#233863] rounded-xl text-[#B8BFC9] hover:text-white transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#233863] bg-[#0B1220]/98 px-4 py-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-[#141E33] p-3 rounded-xl border border-[#233863] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#3DD6E8]" />
                <div>
                  <div className="text-white font-bold">Corporate Private VPN</div>
                  <div className="text-[10px] text-[#B8BFC9] font-mono">{vpnIp || '10.24.0.12 (VPC Private)'}</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#3DD6E8]/20 text-[#3DD6E8] border border-[#3DD6E8]/40 px-2 py-0.5 rounded-full font-bold">
                Aktif
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenHotkeyGuide();
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-[#141E33] border border-[#233863] rounded-xl text-xs font-bold text-white hover:bg-[#1C2C4C]"
              >
                <Keyboard className="w-4 h-4 text-[#F5B400]" />
                <span>Panduan Tombol Pintas</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (Thumb-Friendly for Ergonomics) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-xl border-t border-[#233863] px-2 py-1.5 flex justify-around items-center shadow-2xl">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'live'
              ? 'text-[#3DD6E8] font-extrabold'
              : 'text-[#B8BFC9] hover:text-white font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'live' ? 'bg-[#233863] border border-[#3DD6E8]/50' : ''}`}>
            <Radio className={`w-4 h-4 ${activeTab === 'live' ? 'animate-pulse text-[#3DD6E8]' : ''}`} />
          </div>
          <span className="text-[10px]">Live Session</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'schedule'
              ? 'text-[#3DD6E8] font-extrabold'
              : 'text-[#B8BFC9] hover:text-white font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'schedule' ? 'bg-[#233863] border border-[#3DD6E8]/50' : ''}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[10px]">Jadwal</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'text-[#3DD6E8] font-extrabold'
              : 'text-[#B8BFC9] hover:text-white font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'history' ? 'bg-[#233863] border border-[#3DD6E8]/50' : ''}`}>
            <History className="w-4 h-4" />
          </div>
          <span className="text-[10px]">Riwayat</span>
        </button>
      </nav>
    </>
  );
};




