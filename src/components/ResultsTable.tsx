import { useState, lazy, Suspense } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DescriptionIcon from '@mui/icons-material/Description';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { SearchResult } from '../types/search';
import theme from '../util/theme';

// Lazy load the detail dialog
const ResultDetail = lazy(() => import('./ResultDetail'));

type ResultsTableProps = {
  results: SearchResult[];
  searchKeyword: string;
};

const StyledCell = ({ children }: { children: React.ReactNode }) => (
  <TableCell
    sx={{
      textWrap: 'wrap',
      wordBreak: 'break-all',
      minWidth: 300,
      maxWidth: 800,
      fontSize: '0.875rem',
      p: 1,
    }}
  >
    {children}
  </TableCell>
);

const ResultsTable = ({ results, searchKeyword }: ResultsTableProps) => {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleShowDetail = (result: SearchResult) => {
    setSelectedResult(result);
    setDetailOpen(true);
  };

  // CSV用に文字列をエスケープする関数（Windows/Mac両対応）
  const escapeCSVField = (field: string | number): string => {
    const str = String(field);
    // 改行を空白に置換（CSVの可読性向上）
    const cleaned = str.replace(/[\r\n]+/g, ' ').trim();
    // ダブルクォートをエスケープ
    const escaped = cleaned.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  // CSVダウンロードのハンドラー関数（Windows/Mac両対応）
  const handleDownloadCSV = () => {
    // BOM（Byte Order Mark）を追加してUTF-8で正しく認識されるようにする
    // これによりExcel for Windows/Macで日本語が正しく表示される
    const BOM = '\uFEFF';

    const headers = ['順位', 'タイトル', 'URL', '説明', '表示URL'];
    const headerRow = headers.map(h => escapeCSVField(h)).join(',');

    const dataRows = results.map((result, index) => {
      return [
        index + 1,
        result.title,
        result.link,
        result.snippet,
        result.displayLink || result.link,
      ]
        .map(field => escapeCSVField(field))
        .join(',');
    });

    // Windows互換性のため改行コードを\r\nに統一
    const csvString = BOM + [headerRow, ...dataRows].join('\r\n');

    // UTF-8 BOM付きでBlobを作成
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // ファイル名にタイムスタンプを含める
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `search_results_${searchKeyword}_${timestamp}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSONダウンロードのハンドラー関数
  const handleDownloadJSON = () => {
    const exportData = {
      keyword: searchKeyword,
      timestamp: new Date().toISOString(),
      totalResults: results.length,
      results: results.map((result, index) => ({
        rank: index + 1,
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        displayLink: result.displayLink,
        formattedUrl: result.formattedUrl,
        metadata: result.pagemap?.metatags?.[0],
        thumbnail: result.pagemap?.cse_thumbnail?.[0],
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search_results_${searchKeyword}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  console.log('渡すresults:', results);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid ',
        borderColor: theme.palette.grey[300],
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: 40,
                maxWidth: 80,
                width: 70,
                fontSize: '0.875rem',
                lineHeight: '1.2rem',
                textWrap: 'nowrap',
              }}
            >
              順位
            </TableCell>
            <TableCell sx={{ width: 60, textAlign: 'center' }}>画像</TableCell>
            <StyledCell>タイトル</StyledCell>
            <StyledCell>URL</StyledCell>
            <StyledCell>説明</StyledCell>
            <TableCell sx={{ width: 100, textAlign: 'center' }}>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <TableRow
              key={result.link || result.title}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}位</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {result.pagemap?.cse_thumbnail?.[0] ? (
                  <Avatar
                    src={result.pagemap.cse_thumbnail[0].src}
                    alt={result.title}
                    variant="rounded"
                    sx={{ width: 40, height: 40, mx: 'auto' }}
                  />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 40, height: 40, mx: 'auto' }}>
                    {index + 1}
                  </Avatar>
                )}
              </TableCell>
              <StyledCell>
                <strong>{result.title}</strong>
              </StyledCell>
              <StyledCell>
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.palette.primary.main }}
                >
                  {result.displayLink || result.link}
                </a>
              </StyledCell>
              <StyledCell>{result.snippet}</StyledCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Tooltip title="詳細を表示">
                  <IconButton size="small" color="primary" onClick={() => handleShowDetail(result)}>
                    <ContentPasteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {results.length === 0 ? null : (
        <Box
          sx={{
            textAlign: 'right',
            p: 2,
            position: 'fixed',
            bottom: 2,
            right: 2,
            zIndex: 1000,
          }}
        >
          <ButtonGroup variant="contained" size="large">
            <Button onClick={handleDownloadCSV} color="success" startIcon={<DescriptionIcon />}>
              CSV
            </Button>
            <Button onClick={handleDownloadJSON} color="info" startIcon={<InventoryIcon />}>
              JSON
            </Button>
          </ButtonGroup>
        </Box>
      )}
      <Suspense fallback={<CircularProgress />}>
        <ResultDetail
          result={selectedResult}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      </Suspense>
    </TableContainer>
  );
};

export default ResultsTable;
