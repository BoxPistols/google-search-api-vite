import { ReactNode, useState } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Mobile-friendly swipeable drawer
 *
 * Automatically uses full width on mobile, partial width on desktop
 */
export function MobileDrawer({
  open,
  onOpen,
  onClose,
  children,
  title,
  anchor = 'bottom',
}: MobileDrawerProps) {
  const { isMobile } = useResponsive();

  const drawerWidth = isMobile ? '100%' : 400;
  const drawerHeight = anchor === 'bottom' || anchor === 'top' ? '80vh' : '100vh';

  return (
    <SwipeableDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      PaperProps={{
        sx: {
          width: anchor === 'left' || anchor === 'right' ? drawerWidth : '100%',
          height: anchor === 'bottom' || anchor === 'top' ? drawerHeight : '100vh',
          borderTopLeftRadius: anchor === 'bottom' ? 16 : 0,
          borderTopRightRadius: anchor === 'bottom' ? 16 : 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header with close button */}
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ typography: 'h6' }}>{title}</Box>
            <IconButton edge="end" onClick={onClose} aria-label="close" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Pull indicator for bottom drawer */}
        {anchor === 'bottom' && (
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: 'divider',
              borderRadius: 2,
              mx: 'auto',
              mt: 1,
              mb: 2,
            }}
          />
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}

/**
 * Hook for managing mobile drawer state
 */
export function useMobileDrawer() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleToggle = () => setOpen(prev => !prev);

  return {
    open,
    onOpen: handleOpen,
    onClose: handleClose,
    onToggle: handleToggle,
  };
}
