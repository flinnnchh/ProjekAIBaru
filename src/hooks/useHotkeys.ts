import { useEffect } from 'react';

interface HotkeyActions {
  onJoin?: () => void;
  onRecord?: () => void;
  onPauseResume?: () => void;
  onStop?: () => void;
  onExportTxt?: () => void;
  onExportDocx?: () => void;
  onToggleGuide?: () => void;
}

export function useHotkeys(actions: HotkeyActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Toggle Help Guide with '?' (Shift + /)
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        actions.onToggleGuide?.();
        return;
      }

      // Spacebar for Pause / Resume
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        actions.onPauseResume?.();
        return;
      }

      // Ctrl or Meta combinations
      if (e.ctrlKey || e.metaKey) {
        // Ctrl + J : Join
        if (e.key.toLowerCase() === 'j') {
          e.preventDefault();
          actions.onJoin?.();
        }
        // Ctrl + R : Record
        else if (e.key.toLowerCase() === 'r' && !e.shiftKey) {
          e.preventDefault();
          actions.onRecord?.();
        }
        // Ctrl + S : Stop & Save
        else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          actions.onStop?.();
        }
        // Ctrl + Shift + T : Export .TXT
        else if (e.shiftKey && e.key.toLowerCase() === 't') {
          e.preventDefault();
          actions.onExportTxt?.();
        }
        // Ctrl + Shift + D : Export .DOCX
        else if (e.shiftKey && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          actions.onExportDocx?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
