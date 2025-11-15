// src/components/SearchStats.tsx
import { Box, Typography, Paper, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface SearchStatsProps {
  totalSearches: number;
  totalQueries: number;
  lastSearch?: string;
}

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    }}
  >
    <Box sx={{ fontSize: '2rem', display: 'flex', alignItems: 'center', color }}>
      {icon}
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold" sx={{ color }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const SearchStats = ({ totalSearches, totalQueries, lastSearch }: SearchStatsProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<SearchIcon sx={{ fontSize: '2rem' }} />}
            label="総検索回数"
            value={totalSearches}
            color="#1d6dd5"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<BarChartIcon sx={{ fontSize: '2rem' }} />}
            label="総クエリ消費数"
            value={totalQueries}
            color="#736482"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<CalendarTodayIcon sx={{ fontSize: '2rem' }} />}
            label="最新の検索"
            value={lastSearch || '-'}
            color="#67b411"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchStats;
