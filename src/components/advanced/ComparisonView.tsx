// Comparison View Component
import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import type { SearchResult } from '../../types/search';

interface ComparisonData {
  keyword: string;
  date: string;
  results: SearchResult[];
}

interface ComparisonViewProps {
  data: ComparisonData[];
}

export const ComparisonView = memo(({ data }: ComparisonViewProps) => {
  const [showAll, setShowAll] = useState(false);

  if (data.length < 2) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary">
          比較するには、少なくとも2つの検索結果が必要です
        </Typography>
      </Paper>
    );
  }

  // Compare top 10 results
  const comparison = data[0].results.slice(0, 10).map((result, index) => {
    const previousResult = data[1].results.find(r => r.link === result.link);
    const previousRank = previousResult
      ? data[1].results.indexOf(previousResult) + 1
      : null;

    const currentRank = index + 1;
    const rankChange = previousRank ? previousRank - currentRank : null;

    return {
      title: result.title,
      link: result.link,
      currentRank,
      previousRank,
      rankChange,
    };
  });

  const displayData = showAll ? comparison : comparison.slice(0, 5);

  const getRankChangeIcon = (change: number | null) => {
    if (change === null) return <RemoveIcon fontSize="small" color="disabled" />;
    if (change > 0) return <TrendingUpIcon fontSize="small" color="success" />;
    if (change < 0) return <TrendingDownIcon fontSize="small" color="error" />;
    return <RemoveIcon fontSize="small" color="disabled" />;
  };

  const getRankChangeColor = (change: number | null) => {
    if (change === null) return 'default';
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CompareArrowsIcon color="primary" />
        <Typography variant="h6" fontWeight="bold" color="primary">
          検索結果比較
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip
          label={`現在: ${data[0].date}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`以前: ${data[1].date}`}
          color="secondary"
          variant="outlined"
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>タイトル</TableCell>
            <TableCell align="center">現在順位</TableCell>
            <TableCell align="center">以前順位</TableCell>
            <TableCell align="center">変動</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.title}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip label={item.currentRank} size="small" color="primary" />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={item.previousRank || '-'}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {getRankChangeIcon(item.rankChange)}
                  <Chip
                    label={
                      item.rankChange === null
                        ? '新規'
                        : item.rankChange === 0
                        ? '変化なし'
                        : `${Math.abs(item.rankChange)}位${item.rankChange > 0 ? '上昇' : '下降'}`
                    }
                    size="small"
                    color={getRankChangeColor(item.rankChange) as any}
                    variant="outlined"
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {comparison.length > 5 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button onClick={() => setShowAll(!showAll)} variant="outlined">
            {showAll ? '表示を減らす' : `残り${comparison.length - 5}件を表示`}
          </Button>
        </Box>
      )}
    </Paper>
  );
});

ComparisonView.displayName = 'ComparisonView';
