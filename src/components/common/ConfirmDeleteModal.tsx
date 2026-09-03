import React, { useEffect, useRef } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { Button } from './Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Hapus Data?',
  message = 'Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="glass-card-strong w-full max-w-sm mx-4 p-6 space-y-5 animate-slide-up shadow-2xl border border-[#233863]">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#7A2530]/20 border border-[#7A2530]/40 flex items-center justify-center">
            <MaterialIcon icon="warning" size="xl" className="text-[#FF8E9D]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-base font-extrabold text-white font-display">{title}</h3>
          <p className="text-xs text-[#8A94A3] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => { onConfirm(); onClose(); }}
            icon={<MaterialIcon icon="delete" size="sm" />}
            className="flex-1"
          >
            Ya, Hapus
          </Button>
        </div>
      </div>
    </div>
  );
};
