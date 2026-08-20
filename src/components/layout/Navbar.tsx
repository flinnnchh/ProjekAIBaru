import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { VpnStatusBadge } from './VpnStatusBadge';

interface NavbarProps {
  activeTab: 'live' | 'schedule' | 'history';
  setActiveTab: (tab: 'live' | 'schedule' | 'history') => void;
  onOpenHotkeyGuide: () => void;
  vpnConnected: boolean;
  vpnIp?: string;
}

const tabs = [
  { key: 'live' as const, label: 'Live Session', icon: 'radio', mobileLabel: 'Live' },
  { key: 'schedule' as const, label: 'Jadwal Meeting', icon: 'calendar_month', mobileLabel: 'Jadwal' },
  { key: 'history' as const, label: 'Riwayat & Transkrip', icon: 'history', mobileLabel: 'Riwayat' },
];

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
      <header className="sticky top-0 z-40 w-full border-b border-[#233863]/60 bg-[#0B1220]/90 backdrop-blur-2xl text-white shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#233863] via-[#3A4E7A] to-[#F5B400] p-[1.5px] shadow-lg shadow-black/30 flex-shrink-0 group">
              <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center group-hover:bg-[#0D1528] transition-colors">
                <MaterialIcon icon="smart_toy" size="md" className="text-[#3DD6E8]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 truncate font-display">
                  LUI <span className="text-gradient-gold">MEETBOT</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-[#141E33] border border-[#233863] text-[#3DD6E8] font-mono font-bold flex-shrink-0">
                  NOVA-2
                </span>
              </div>
              <p className="text-[11px] text-[#8A94A3] hidden md:block truncate">
                Enterprise AI Bot & Multilingual Transcriber
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-0.5 bg-[#080E1A]/80 p-1 rounded-2xl border border-[#233863]/60 shadow-lui-inner relative">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-b from-[#1A2845] to-[#141E33] text-white shadow-md shadow-black/20 border border-[#3DD6E8]/30'
                    : 'text-[#8A94A3] hover:text-white hover:bg-white/5'
                }`}
              >
                <MaterialIcon
                  icon={tab.icon}
                  size="sm"
                  filled={activeTab === tab.key}
                  className={`transition-all duration-200 ${
                    activeTab === tab.key ? 'text-[#3DD6E8]' : ''
                  } ${activeTab === tab.key && tab.key === 'live' ? 'animate-pulse' : ''}`}
                />
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-[#3DD6E8] to-[#F5B400]" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Info & Hotkey (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            <VpnStatusBadge connected={vpnConnected} ip={vpnIp} />

            <button
              onClick={onOpenHotkeyGuide}
              title="Panduan Tombol Pintas Keyboard (Tekan '?')"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#8A94A3] hover:text-white bg-[#141E33]/60 hover:bg-[#1A2845] border border-[#233863]/60 hover:border-[#3DD6E8]/30 rounded-xl transition-all duration-200 shadow-sm group"
            >
              <MaterialIcon icon="keyboard" size="sm" className="text-[#3DD6E8] group-hover:scale-110 transition-transform" />
              <span className="font-mono text-[11px] font-bold">Hotkeys</span>
              <span className="keycap">?</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#141E33] border border-[#233863] rounded-lg text-[10px] font-mono text-[#3DD6E8]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3DD6E8]" />
              </span>
              <span>VPN ON</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-[#141E33] border border-[#233863] rounded-xl text-[#B8BFC9] hover:text-white transition-all duration-200 active:scale-95"
              aria-label="Buka Menu"
            >
              <MaterialIcon icon={mobileMenuOpen ? 'close' : 'menu'} size="md" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#233863]/60 bg-[#0B1220]/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-slide-up">
            <div className="bg-[#141E33]/80 p-3 rounded-xl border border-[#233863] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <MaterialIcon icon="vpn_lock" size="md" className="text-[#3DD6E8]" />
                <div>
                  <div className="text-white font-bold">Corporate Private VPN</div>
                  <div className="text-[10px] text-[#B8BFC9] font-mono">{vpnIp || '10.24.0.12 (VPC Private)'}</div>
                </div>
              </div>
              <span className="text-[10px] bg-[#3DD6E8]/15 text-[#3DD6E8] border border-[#3DD6E8]/30 px-2 py-0.5 rounded-full font-bold">
                Aktif
              </span>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHotkeyGuide();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#141E33]/80 border border-[#233863] rounded-xl text-xs font-bold text-white hover:bg-[#1A2845] transition-colors"
            >
              <MaterialIcon icon="keyboard" size="md" className="text-[#F5B400]" />
              <span>Panduan Tombol Pintas</span>
            </button>
          </div>
        )}
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-2xl border-t border-[#233863]/60 px-2 py-1.5 flex justify-around items-center shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-200 relative ${
              activeTab === tab.key
                ? 'text-[#3DD6E8]'
                : 'text-[#6B7585] hover:text-white'
            }`}
          >
            {/* Active background pill */}
            {activeTab === tab.key && (
              <span className="absolute inset-0 bg-[#3DD6E8]/10 rounded-2xl border border-[#3DD6E8]/20 animate-scale-in" />
            )}
            <MaterialIcon
              icon={tab.icon}
              size="md"
              filled={activeTab === tab.key}
              className={`relative z-10 transition-all duration-200 ${
                activeTab === tab.key && tab.key === 'live' ? 'animate-pulse' : ''
              }`}
            />
            <span className={`text-[10px] relative z-10 ${activeTab === tab.key ? 'font-extrabold' : 'font-medium'}`}>
              {tab.mobileLabel}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
};
