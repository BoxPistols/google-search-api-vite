// Toast Notification System
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

export const ToastProvider = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1e1e1e' : '#ffffff',
          color: isDark ? '#e0e0e0' : '#333333',
          border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#67b411',
            secondary: isDark ? '#1e1e1e' : '#ffffff',
          },
          style: {
            border: `1px solid #67b411`,
          },
        },
        error: {
          iconTheme: {
            primary: '#d32f2f',
            secondary: isDark ? '#1e1e1e' : '#ffffff',
          },
          style: {
            border: `1px solid #d32f2f`,
          },
        },
        loading: {
          iconTheme: {
            primary: '#1d6dd5',
            secondary: isDark ? '#1e1e1e' : '#ffffff',
          },
        },
      }}
    />
  );
};

// Toast notification utilities
export { toast } from 'react-hot-toast';
