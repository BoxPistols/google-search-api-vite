// src/components/ResultDetail.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Link,
} from '@mui/material';
import type { SearchResult } from '../types/search';
import theme from '../util/theme';

interface ResultDetailProps {
  result: SearchResult | null;
  open: boolean;
  onClose: () => void;
}

const ResultDetail = ({ result, open, onClose }: ResultDetailProps) => {
  if (!result) return null;

  const metadata = result.pagemap?.metatags?.[0];
  const thumbnail = result.pagemap?.cse_thumbnail?.[0];
  const image = result.pagemap?.cse_image?.[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
        <Typography variant="h6" component="div">
          検索結果詳細
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {/* サムネイル */}
        {(thumbnail || image) && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img
              src={thumbnail?.src || image?.src}
              alt={result.title}
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
        )}

        {/* タイトルとURL */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            {result.title}
          </Typography>
          <Link href={result.link} target="_blank" rel="noopener noreferrer">
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {result.link}
            </Typography>
          </Link>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            表示URL: {result.displayLink}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* スニペット */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            スニペット
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {result.snippet}
          </Typography>
        </Box>

        {/* メタデータ */}
        {metadata && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                メタデータ
              </Typography>

              {metadata['og:title'] && (
                <Box sx={{ mb: 2 }}>
                  <Chip label="OG Title" size="small" color="primary" sx={{ mb: 1 }} />
                  <Typography variant="body2">{metadata['og:title']}</Typography>
                </Box>
              )}

              {metadata['og:description'] && (
                <Box sx={{ mb: 2 }}>
                  <Chip label="OG Description" size="small" color="primary" sx={{ mb: 1 }} />
                  <Typography variant="body2">{metadata['og:description']}</Typography>
                </Box>
              )}

              {metadata.description && (
                <Box sx={{ mb: 2 }}>
                  <Chip label="Description" size="small" color="secondary" sx={{ mb: 1 }} />
                  <Typography variant="body2">{metadata.description}</Typography>
                </Box>
              )}

              {metadata.keywords && (
                <Box sx={{ mb: 2 }}>
                  <Chip label="Keywords" size="small" color="secondary" sx={{ mb: 1 }} />
                  <Typography variant="body2">{metadata.keywords}</Typography>
                </Box>
              )}

              {metadata['og:type'] && (
                <Box sx={{ mb: 2 }}>
                  <Chip label="OG Type" size="small" color="info" sx={{ mb: 1 }} />
                  <Typography variant="body2">{metadata['og:type']}</Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultDetail;
