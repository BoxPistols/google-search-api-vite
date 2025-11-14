// src/components/SearchStats.tsx
import { Box, Typography, Paper, Grid } from '@mui/material';
import theme from '../util/theme';

interface SearchStatsProps {
  totalSearches: number;
  totalQueries: number;
  lastSearch?: string;
}

const StatCard = ({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
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
    <Typography sx={{ fontSize: '2rem' }}>{emoji}</Typography>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold" color={color}>
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
            emoji="🔍"
            label="総検索回数"
            value={totalSearches}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            emoji="📊"
            label="総クエリ消費数"
            value={totalQueries}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            emoji="📅"
            label="最新の検索"
            value={lastSearch || '-'}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchStats;
