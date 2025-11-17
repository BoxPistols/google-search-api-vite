// Keyboard Shortcuts Help Dialog
import { memo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { useTheme } from '@mui/material/styles';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts: ShortcutItem[] = [
  { keys: ['Ctrl', 'K'], description: '検索フォームにフォーカス' },
  { keys: ['Ctrl', 'N'], description: '新しい検索を開始' },
  { keys: ['Ctrl', 'E'], description: 'エクスポートメニューを開く' },
  { keys: ['Ctrl', 'D'], description: 'ダークモード切り替え' },
  { keys: ['Shift', '?'], description: 'このヘルプを表示' },
  { keys: ['Esc'], description: 'ダイアログを閉じる' },
];

export const KeyboardShortcutsHelp = memo(({ open, onClose }: KeyboardShortcutsHelpProps) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardIcon color="primary" />
          <Typography variant="h6" component="span">
            キーボードショートカット
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {shortcuts.map((shortcut, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e8e8e8',
                },
              }}
            >
              <Typography variant="body1">{shortcut.description}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {shortcut.keys.map((key, keyIndex) => (
                  <Chip
                    key={keyIndex}
                    label={key}
                    size="small"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      minWidth: '50px',
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          ※ Mac ユーザーは Ctrl の代わりに ⌘ (Command) キーを使用してください
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
});

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';
