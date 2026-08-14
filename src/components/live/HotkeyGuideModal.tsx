import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { Button } from '../common/Button';

interface HotkeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeyGuideModal: React.FC<HotkeyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + J', label: 'Join Room Meeting', desc: 'Menghubungkan bot ke URL meeting yang ditentukan' },
    { key: 'Ctrl + R', label: 'Mulai Rekaman (Record)', desc: 'Mengaktifkan perekaman audio dan live transcriber Deepgram' },
    { key: 'Spacebar', label: 'Pause / Resume Rekaman', desc: 'Jeda atau lanjutkan rekaman tanpa merusak urutan transkrip' },
    { key: 'Ctrl + S', label: 'Stop & Save Rekaman', desc: 'Menghentikan rekaman permanen dan memunculkan modal download' },
    { key: 'Ctrl + Shift + T', label: 'Export ke .TXT', desc: 'Mengunduh transkrip real-time dalam format teks murni' },
    { key: 'Ctrl + Shift + D', label: 'Export ke .DOCX', desc: 'Mengunduh transkrip berformat tabel & metadata resmi Microsoft Word' },
    { key: '?', label: 'Buka Panduan Pintasan', desc: 'Menampilkan modal daftar tombol pintas keyboard ini' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-950 border border-blue-500/30 rounded-lg text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Panduan Tombol Pintas Keyboard</h2>
              <p className="text-xs text-slate-400">Prinsip 8 Golden Rules: <em>Enable Frequent Users to Use Shortcuts</em></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200">{sc.label}</div>
                <div className="text-[11px] text-slate-400">{sc.desc}</div>
              </div>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 bg-slate-800 border border-slate-700 rounded-lg shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
};
