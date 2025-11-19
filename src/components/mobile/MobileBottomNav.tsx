import { useState } from 'react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileBottomNavProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Mobile bottom navigation component
 *
 * Only visible on mobile devices
 */
export function MobileBottomNav({ value, onChange }: MobileBottomNavProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(_event, newValue: number) => onChange(newValue)}
        showLabels
      >
        <BottomNavigationAction label="Search" icon={<SearchIcon />} />
        <BottomNavigationAction label="History" icon={<HistoryIcon />} />
        <BottomNavigationAction label="Stats" icon={<BarChartIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

/**
 * Hook for managing mobile bottom navigation
 */
export function useMobileBottomNav() {
  const [value, setValue] = useState(0);

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  return {
    value,
    onChange: handleChange,
    isSearch: value === 0,
    isHistory: value === 1,
    isStats: value === 2,
    isSettings: value === 3,
  };
}
