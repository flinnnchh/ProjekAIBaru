import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { Button } from '../common/Button';

interface HotkeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeyGuideModal: React.FC<HotkeyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + J', label: 'Join Room Meeting', desc: 'Menghubungkan bot ke URL meeting', icon: 'login', color: 'text-[#F5B400]' },
    { key: 'Ctrl + R', label: 'Mulai Rekaman', desc: 'Aktifkan perekaman & live transcriber', icon: 'fiber_manual_record', color: 'text-[#FF8E9D]' },
    { key: 'Space', label: 'Pause / Resume', desc: 'Jeda atau lanjutkan rekaman', icon: 'pause_circle', color: 'text-[#D9A441]' },
    { key: 'Ctrl + S', label: 'Stop & Save', desc: 'Hentikan rekaman dan simpan otomatis', icon: 'stop_circle', color: 'text-[#3DD6E8]' },
    { key: 'Ctrl + ⇧ + T', label: 'Export .TXT', desc: 'Unduh transkrip format teks murni', icon: 'description', color: 'text-[#B8BFC9]' },
    { key: 'Ctrl + ⇧ + D', label: 'Export .DOCX', desc: 'Unduh transkrip format Microsoft Word', icon: 'code', color: 'text-[#3DD6E8]' },
    { key: 'Ctrl + ⇧ + X', label: 'Bersihkan Transkrip', desc: 'Hapus daftar teks transkrip live', icon: 'delete_sweep', color: 'text-[#FF8E9D]' },
    { key: '?', label: 'Panduan Pintasan', desc: 'Tampilkan modal daftar hotkeys ini', icon: 'help', color: 'text-[#F5B400]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg glass-card-strong p-6 shadow-2xl relative text-white animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233863]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-[#233863] to-[#2D4A7A] border border-[#3A4E7A]/40 rounded-xl shadow-md">
              <MaterialIcon icon="keyboard" size="lg" className="text-[#3DD6E8]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-display">Panduan Tombol Pintas</h2>
              <p className="text-[11px] text-[#8A94A3]">Akses cepat bagi operator meeting enterprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7585] hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 active:scale-90"
          >
            <MaterialIcon icon="close" size="md" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[#0B1220]/80 rounded-xl border border-[#233863]/60 hover:border-[#3DD6E8]/30 hover:bg-[#141E33]/60 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon icon={sc.icon} size="md" className={`${sc.color} group-hover:scale-110 transition-transform`} />
                <div>
                  <div className="text-xs font-bold text-white">{sc.label}</div>
                  <div className="text-[10px] text-[#6B7585]">{sc.desc}</div>
                </div>
              </div>
              <kbd className="keycap">{sc.key}</kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#233863]/60 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
};
