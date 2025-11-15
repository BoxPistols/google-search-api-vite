// src/components/DomainAnalysis.tsx
import { Box, Typography, Paper, Chip } from '@mui/material';
import type { SearchResult } from '../types/search';
import theme from '../util/theme';

interface DomainAnalysisProps {
  results: SearchResult[];
}

const DomainAnalysis = ({ results }: DomainAnalysisProps) => {
  if (results.length === 0) return null;

  // ドメインごとの出現回数を集計
  const domainCounts = results.reduce((acc, result) => {
    const domain = result.displayLink || new URL(result.link).hostname;
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 出現回数でソート
  const sortedDomains = Object.entries(domainCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" color="primary">
          🌐 ドメイン分析
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {sortedDomains.map(([domain, count]) => (
          <Chip
            key={domain}
            label={`${domain} (${count}件)`}
            color={count > 1 ? 'primary' : 'default'}
            variant={count > 1 ? 'filled' : 'outlined'}
            sx={{
              fontSize: '0.875rem',
              fontWeight: count > 1 ? 'bold' : 'normal',
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          トップ20の検索結果に含まれるドメインの分布
        </Typography>
      </Box>
    </Paper>
  );
};

export default DomainAnalysis;
