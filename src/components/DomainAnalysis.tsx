// src/components/DomainAnalysis.tsx
import { memo, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LanguageIcon from '@mui/icons-material/Language';
import type { SearchResult } from '../types/search';
import theme from '../util/theme';

interface DomainAnalysisProps {
  results: SearchResult[];
}

const DomainAnalysis = memo(({ results }: DomainAnalysisProps) => {
  // ドメインごとの出現回数を集計 - useMemoで最適化
  const sortedDomains = useMemo(() => {
    if (results.length === 0) return [];

    const domainCounts = results.reduce(
      (acc, result) => {
        const domain = result.displayLink || new URL(result.link).hostname;
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 出現回数でソート
    return Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [results]);

  if (sortedDomains.length === 0) return null;

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
        <LanguageIcon color="primary" />
        <Typography variant="h6" color="primary">
          ドメイン分析
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
});

DomainAnalysis.displayName = 'DomainAnalysis';

export default DomainAnalysis;
