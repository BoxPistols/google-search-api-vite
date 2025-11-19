// Keyboard Shortcuts Hook
import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const matchesAlt = shortcut.alt ? event.altKey : true;
        const matchesShift = shortcut.shift ? event.shiftKey : true;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          // Check if we're not in an input/textarea
          const target = event.target as HTMLElement;
          const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

          if (!isInput) {
            event.preventDefault();
            shortcut.callback();
          }
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return shortcuts;
};

// Predefined shortcuts helper
export const createShortcuts = {
  search: (callback: () => void): ShortcutConfig => ({
    key: 'k',
    ctrl: true,
    callback,
    description: 'フォーカス検索',
  }),
  newSearch: (callback: () => void): ShortcutConfig => ({
    key: 'n',
    ctrl: true,
    callback,
    description: '新しい検索',
  }),
  export: (callback: () => void): ShortcutConfig => ({
    key: 'e',
    ctrl: true,
    callback,
    description: 'エクスポート',
  }),
  theme: (callback: () => void): ShortcutConfig => ({
    key: 'd',
    ctrl: true,
    callback,
    description: 'テーマ切り替え',
  }),
  help: (callback: () => void): ShortcutConfig => ({
    key: '?',
    shift: true,
    callback,
    description: 'ヘルプ表示',
  }),
};
