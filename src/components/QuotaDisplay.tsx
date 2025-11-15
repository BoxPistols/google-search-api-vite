// src/components/QuotaDisplay.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Paper, Chip, Tooltip } from '@mui/material';
import {
  getQuotaData,
  getRemainingQueries,
  getQuotaUsagePercentage,
  getTimeUntilResetFormatted,
  QUOTA_LIMIT,
} from '../utils/apiQuotaManager';
import theme from '../util/theme';

interface QuotaDisplayProps {
  onQuotaUpdate?: () => void;
}

const QuotaDisplay = ({ onQuotaUpdate }: QuotaDisplayProps) => {
  const [quotaData, setQuotaData] = useState(getQuotaData());
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilResetFormatted());

  useEffect(() => {
    // 定期的にクォータデータを更新
    const interval = setInterval(() => {
      setQuotaData(getQuotaData());
      setTimeUntilReset(getTimeUntilResetFormatted());
      onQuotaUpdate?.();
    }, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [onQuotaUpdate]);

  const remaining = getRemainingQueries();
  const usagePercentage = getQuotaUsagePercentage();
  const isLowQuota = remaining < 20;
  const isCriticalQuota = remaining < 10;

  // 進捗バーの色を決定
  const getProgressColor = () => {
    if (isCriticalQuota) return 'error';
    if (isLowQuota) return 'warning';
    return 'primary';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background: isCriticalQuota
          ? 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)'
          : isLowQuota
          ? 'linear-gradient(135deg, #fffbf0 0%, #fff4e0 100%)'
          : 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)',
        border: '2px solid',
        borderColor: isCriticalQuota
          ? theme.palette.error.light
          : isLowQuota
          ? theme.palette.warning.light
          : theme.palette.primary.light,
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          📊 API使用状況（1日の制限）
        </Typography>
        <Tooltip title="0:00にリセットされます">
          <Chip
            label={`⏰ リセットまで: ${timeUntilReset}`}
            color={isLowQuota ? 'warning' : 'info'}
            variant="outlined"
            size="small"
          />
        </Tooltip>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            使用済み: {quotaData.queriesUsed} / {QUOTA_LIMIT} クエリ
          </Typography>
          <Typography
            variant="body2"
            fontWeight="bold"
            color={isCriticalQuota ? 'error' : isLowQuota ? 'warning.main' : 'success.main'}
          >
            残り: {remaining} クエリ
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={usagePercentage}
          color={getProgressColor()}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[200],
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          使用率: {usagePercentage.toFixed(1)}%
        </Typography>
      </Box>

      {isCriticalQuota && (
        <Box
          sx={{
            p: 1.5,
            backgroundColor: theme.palette.error.light + '20',
            borderRadius: 1,
            border: '1px solid',
            borderColor: theme.palette.error.light,
          }}
        >
          <Typography variant="body2" color="error" fontWeight="bold">
            ⚠️ クエリ残数が少なくなっています。本日のAPI使用は{timeUntilReset}後にリセットされます。
          </Typography>
        </Box>
      )}

      {isLowQuota && !isCriticalQuota && (
        <Box
          sx={{
            p: 1.5,
            backgroundColor: theme.palette.warning.light + '20',
            borderRadius: 1,
            border: '1px solid',
            borderColor: theme.palette.warning.light,
          }}
        >
          <Typography variant="body2" color="warning.main" fontWeight="bold">
            💡 クエリ残数が少なくなっています。計画的にご利用ください。
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          ※ Google Custom Search APIの無料枠は1日100クエリです。
          <br />※ 1回の検索で2クエリ（1〜10位、11〜20位）× キーワード数を消費します。
        </Typography>
      </Box>
    </Paper>
  );
};

export default QuotaDisplay;
