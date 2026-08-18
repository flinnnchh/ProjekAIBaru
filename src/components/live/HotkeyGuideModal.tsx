import React from 'react';
import { X, Keyboard } from 'lucide-react';
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
    { key: 'Ctrl + Shift + X', label: 'Bersihkan Transkrip Live', desc: 'Menghapus daftar teks transkrip live agar tidak menumpuk' },
    { key: '?', label: 'Buka Panduan Pintasan', desc: 'Menampilkan modal daftar tombol pintas keyboard ini' },
  ];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141E33] border border-[#233863] rounded-2xl p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233863]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#233863] border border-[#3A4E7A] rounded-xl text-[#3DD6E8] shadow-md">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Panduan Tombol Pintas Keyboard</h2>
              <p className="text-xs text-[#B8BFC9]">Akses cepat dan efisien bagi operator meeting enterprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#B8BFC9] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[#0B1220] rounded-xl border border-[#233863] hover:border-[#3DD6E8]/50 transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-white">{sc.label}</div>
                <div className="text-[11px] text-[#B8BFC9]">{sc.desc}</div>
              </div>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-[#F5B400] bg-[#233863] border border-[#3A4E7A] rounded-lg shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#233863] flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
};



