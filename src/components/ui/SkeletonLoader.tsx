// Skeleton Loading Components
import { memo } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

export const TableSkeleton = memo(() => (
  <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Skeleton variant="rectangular" width={60} height={40} />
      <Skeleton variant="rectangular" width="30%" height={40} />
      <Skeleton variant="rectangular" width="40%" height={40} />
      <Skeleton variant="rectangular" width="20%" height={40} />
    </Box>

    {/* Rows */}
    {[...Array(5)].map((_, index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width="30%" height={40} />
        <Skeleton variant="rectangular" width="40%" height={40} />
        <Skeleton variant="rectangular" width="20%" height={40} />
      </Box>
    ))}
  </Paper>
));

TableSkeleton.displayName = 'TableSkeleton';

export const CardSkeleton = memo(() => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
    </Box>
  </Paper>
));

CardSkeleton.displayName = 'CardSkeleton';

export const StatsSkeleton = memo(() => (
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    {[...Array(3)].map((_, index) => (
      <Paper key={index} elevation={3} sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={36} />
      </Paper>
    ))}
  </Box>
));

StatsSkeleton.displayName = 'StatsSkeleton';
