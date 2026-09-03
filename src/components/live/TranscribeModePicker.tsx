import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { Button } from '../common/Button';

export type TranscribeMode = 'live' | 'background';

interface TranscribeModePickerProps {
  isOpen: boolean;
  meetingTitle: string;
  onConfirm: (mode: TranscribeMode) => void;
  onCancel: () => void;
}

export const TranscribeModePicker: React.FC<TranscribeModePickerProps> = ({
  isOpen,
  meetingTitle,
  onConfirm,
  onCancel,
}) => {
  const [selectedMode, setSelectedMode] = useState<TranscribeMode | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg glass-card-strong p-6 shadow-2xl relative text-white animate-scale-in">
        {/* Header */}
        <div className="text-center pb-5 border-b border-[#233863]/60">
          <div className="w-14 h-14 bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <MaterialIcon icon="settings_voice" size="xl" className="text-[#3DD6E8]" />
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight font-display">
            Pilih Mode Transkripsi
          </h2>
          <p className="text-xs text-[#8A94A3] mt-1.5">
            {meetingTitle || 'Meeting'} — Bagaimana Anda ingin melihat transkrip?
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {/* Live Transcribe */}
          <div
            onClick={() => setSelectedMode('live')}
            className={`mode-card group ${selectedMode === 'live' ? 'selected-cyan' : ''}`}
          >
            {/* Selected Check */}
            {selectedMode === 'live' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#3DD6E8] flex items-center justify-center animate-scale-in">
                <MaterialIcon icon="check" size="xs" className="text-[#0B1220]" />
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                selectedMode === 'live'
                  ? 'bg-[#3DD6E8]/20 border border-[#3DD6E8]/30'
                  : 'bg-[#233863]/50 border border-[#233863] group-hover:bg-[#3DD6E8]/10 group-hover:border-[#3DD6E8]/20'
              }`}>
                <MaterialIcon icon="subtitles" size="lg" className={`transition-colors ${
                  selectedMode === 'live' ? 'text-[#3DD6E8]' : 'text-[#8A94A3] group-hover:text-[#3DD6E8]'
                }`} />
              </div>

              <div>
                <h3 className={`text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  selectedMode === 'live' ? 'text-[#3DD6E8]' : 'text-white'
                }`}>
                  Live Transcribe
                </h3>
                <p className="text-[10px] text-[#8A94A3] mt-1.5 leading-relaxed">
                  Teks transkrip muncul <strong className="text-white">real-time</strong> saat meeting berlangsung. Cocok untuk koneksi internet stabil.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <MaterialIcon icon="wifi" size="xs" className="text-[#3DD6E8]" />
                <span className="text-[9px] text-[#6B7585] font-mono">Butuh koneksi stabil</span>
              </div>
            </div>
          </div>

          {/* Background Mode */}
          <div
            onClick={() => setSelectedMode('background')}
            className={`mode-card group ${selectedMode === 'background' ? 'selected-gold' : ''}`}
          >
            {/* Recommended Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-full bg-[#F5B400]/15 border border-[#F5B400]/30 text-[8px] font-extrabold text-[#F5B400] uppercase tracking-wider">
                ⭐ Recommended
              </span>
            </div>

            {/* Selected Check */}
            {selectedMode === 'background' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#F5B400] flex items-center justify-center animate-scale-in">
                <MaterialIcon icon="check" size="xs" className="text-[#0B1220]" />
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-3 mt-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                selectedMode === 'background'
                  ? 'bg-[#F5B400]/20 border border-[#F5B400]/30'
                  : 'bg-[#233863]/50 border border-[#233863] group-hover:bg-[#F5B400]/10 group-hover:border-[#F5B400]/20'
              }`}>
                <MaterialIcon icon="cloud_sync" size="lg" className={`transition-colors ${
                  selectedMode === 'background' ? 'text-[#F5B400]' : 'text-[#8A94A3] group-hover:text-[#F5B400]'
                }`} />
              </div>

              <div>
                <h3 className={`text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  selectedMode === 'background' ? 'text-[#F5B400]' : 'text-white'
                }`}>
                  Background Mode
                </h3>
                <p className="text-[10px] text-[#8A94A3] mt-1.5 leading-relaxed">
                  Bot merekam di background. Transkrip <strong className="text-white">akurasi tinggi</strong> tersedia setelah meeting selesai.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <MaterialIcon icon="bolt" size="xs" className="text-[#F5B400]" />
                <span className="text-[9px] text-[#6B7585] font-mono">Hemat bandwidth & akurasi 99%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#233863]/60 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-[#8A94A3]"
          >
            Batal
          </Button>

          <Button
            variant={selectedMode === 'live' ? 'primary' : selectedMode === 'background' ? 'accent' : 'navy'}
            size="sm"
            disabled={!selectedMode}
            onClick={() => selectedMode && onConfirm(selectedMode)}
            icon={<MaterialIcon icon="login" size="sm" className={selectedMode === 'live' ? 'text-[#0B1220]' : ''} />}
          >
            <span className="font-extrabold">Mulai & Join Meeting</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
