// src/components/QuotaDisplay.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Paper, Chip, Tooltip } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {
  getQuotaData,
  getRemainingQueries,
  getQuotaUsagePercentage,
  getTimeUntilResetFormatted,
  getQuotaLimit,
} from '../utils/apiQuotaManager';

interface QuotaDisplayProps {
  onQuotaUpdate?: () => void;
}

const QuotaDisplay = ({ onQuotaUpdate }: QuotaDisplayProps) => {
  const [quotaData, setQuotaData] = useState(getQuotaData());
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilResetFormatted());
  const [quotaLimit, setQuotaLimit] = useState(getQuotaLimit());

  useEffect(() => {
    // 定期的にクォータデータを更新
    const interval = setInterval(() => {
      setQuotaData(getQuotaData());
      setTimeUntilReset(getTimeUntilResetFormatted());
      setQuotaLimit(getQuotaLimit());
      onQuotaUpdate?.();
    }, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [onQuotaUpdate]);

  const remaining = getRemainingQueries();
  const usagePercentage = getQuotaUsagePercentage();
  // クォータ制限の10%未満を警告、5%未満を危機的と判定
  const isLowQuota = remaining < quotaLimit * 0.1;
  const isCriticalQuota = remaining < quotaLimit * 0.05;

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
        border: '2px solid',
        borderColor: isCriticalQuota
          ? 'error.light'
          : isLowQuota
          ? 'warning.light'
          : 'primary.light',
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" color="primary">
            API使用状況（1日の制限）
          </Typography>
        </Box>
        <Tooltip title="0:00にリセットされます">
          <Chip
            icon={<AccessTimeIcon />}
            label={`リセットまで: ${timeUntilReset}`}
            color={isLowQuota ? 'warning' : 'info'}
            variant="outlined"
            size="small"
          />
        </Tooltip>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            使用済み: {quotaData.queriesUsed} / {quotaLimit} クエリ
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
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          使用率: {usagePercentage.toFixed(1)}%
        </Typography>
      </Box>

      {isCriticalQuota && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            backgroundColor: 'error.light',
            opacity: 0.15,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'error.light',
          }}
        >
          <WarningIcon color="error" />
          <Typography variant="body2" color="error" fontWeight="bold">
            クエリ残数が少なくなっています。本日のAPI使用は{timeUntilReset}後にリセットされます。
          </Typography>
        </Box>
      )}

      {isLowQuota && !isCriticalQuota && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            backgroundColor: 'warning.light',
            opacity: 0.15,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'warning.light',
          }}
        >
          <LightbulbIcon color="warning" />
          <Typography variant="body2" color="warning.main" fontWeight="bold">
            クエリ残数が少なくなっています。計画的にご利用ください。
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          ※ 現在のクォータ制限: {quotaLimit}クエリ/日
          <br />※ 1回の検索で2クエリ（1〜10位、11〜20位）× キーワード数を消費します。
          <br />※ ユーザータイプ設定で制限を変更できます。
        </Typography>
      </Box>
    </Paper>
  );
};

export default QuotaDisplay;
