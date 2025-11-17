// Ranking Trend Chart Component
import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface RankingData {
  date: string;
  rank: number;
  keyword: string;
}

interface RankingTrendChartProps {
  data: RankingData[];
}

export const RankingTrendChart = memo(({ data }: RankingTrendChartProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      順位: item.rank,
    }));
  }, [data]);

  if (data.length === 0) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" fontWeight="bold" color="primary">
          順位推移チャート
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#333' : '#e0e0e0'}
          />
          <XAxis
            dataKey="date"
            stroke={isDark ? '#e0e0e0' : '#333'}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            reversed
            domain={[1, 20]}
            stroke={isDark ? '#e0e0e0' : '#333'}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="順位"
            stroke="#1d6dd5"
            strokeWidth={3}
            dot={{ fill: '#1d6dd5', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        ※ 低い数値ほど順位が高いことを示します（1位が最高位）
      </Typography>
    </Paper>
  );
});

RankingTrendChart.displayName = 'RankingTrendChart';
