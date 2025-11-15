// src/components/UserTypeSelector.tsx
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { getUserSettings, setUserType } from '../utils/userSettings';
import { QUOTA_LIMITS, UserType } from '../types/user';

interface UserTypeSelectorProps {
  onUserTypeChange?: () => void;
}

const UserTypeSelector = ({ onUserTypeChange }: UserTypeSelectorProps) => {
  const [currentUserType, setCurrentUserType] = useState<UserType>(
    getUserSettings().userType
  );

  const handleUserTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: UserType | null) => {
    if (newType !== null) {
      setUserType(newType);
      setCurrentUserType(newType);
      onUserTypeChange?.();
      // ページをリロードして変更を反映
      window.location.reload();
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentUserType === 'owner' ? (
            <AdminPanelSettingsIcon color="primary" />
          ) : (
            <PersonIcon color="primary" />
          )}
          <Typography variant="h6" color="primary">
            ユーザータイプ設定
          </Typography>
        </Box>
        <Chip
          label={`制限: ${QUOTA_LIMITS[currentUserType]}クエリ/日`}
          color={currentUserType === 'owner' ? 'success' : 'default'}
          size="small"
        />
      </Box>

      <ToggleButtonGroup
        value={currentUserType}
        exclusive
        onChange={handleUserTypeChange}
        aria-label="ユーザータイプ"
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="user" aria-label="一般ユーザー">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="bold">
                一般ユーザー
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {QUOTA_LIMITS.user}クエリ/日
              </Typography>
            </Box>
          </Box>
        </ToggleButton>
        <ToggleButton value="owner" aria-label="オーナー">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettingsIcon />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="bold">
                オーナー
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {QUOTA_LIMITS.owner}クエリ/日
              </Typography>
            </Box>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="caption" color="text.secondary">
        ※ オーナーモードは、アプリの所有者が利用するモードです。一般ユーザーは制限付きでご利用ください。
      </Typography>
    </Paper>
  );
};

export default UserTypeSelector;
