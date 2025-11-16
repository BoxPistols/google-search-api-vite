// src/components/AuthButton.tsx
import { useState } from 'react';
import {
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../contexts/AuthContext';
import { QUOTA_LIMITS } from '../types/user';
import { firebaseEnabled } from '../services/firebase';

const AuthButton = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      handleSignIn();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {user ? (
        <>
          <Button
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'none',
            }}
          >
            <Avatar
              src={user.photoURL || undefined}
              alt={user.displayName || ''}
              sx={{ width: 32, height: 32 }}
            />
            <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
              <Box sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'text.primary' }}>
                {user.displayName || 'ユーザー'}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {user.userType === 'owner' ? 'オーナー' : '一般ユーザー'}
              </Box>
            </Box>
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem disabled>
              <ListItemText
                primary={user.displayName || 'ユーザー'}
                secondary={user.email}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </MenuItem>
            <MenuItem disabled>
              <ListItemIcon>
                {user.userType === 'owner' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Chip
                    label={`${QUOTA_LIMITS[user.userType]}クエリ/日`}
                    size="small"
                    color={user.userType === 'owner' ? 'success' : 'primary'}
                  />
                }
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>ログアウト</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Tooltip
          title={
            !firebaseEnabled
              ? 'Firebase認証が設定されていません。FIREBASE_SETUP.mdを参照してください。'
              : ''
          }
        >
          <span>
            <Button
              variant="contained"
              color={!firebaseEnabled ? 'warning' : 'primary'}
              onClick={handleSignIn}
              startIcon={!firebaseEnabled ? <InfoIcon /> : <LoginIcon />}
              disabled={!firebaseEnabled}
              sx={{ textTransform: 'none' }}
            >
              {!firebaseEnabled ? '認証未設定' : 'Googleでログイン'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

export default AuthButton;
