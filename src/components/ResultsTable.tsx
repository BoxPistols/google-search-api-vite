import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Button,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  ButtonGroup,
} from '@mui/material';
import type { SearchResult } from '../types/search';
import ResultDetail from './ResultDetail';
import theme from '../util/theme';

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

  // CSVダウンロードのハンドラー関数
  const handleDownloadCSV = () => {
    // BOMを追加してUTF-8で正しく認識されるようにする
    const BOM = '\uFEFF';
    const headers = ['順位', 'タイトル', 'リンク', '説明'];
    const csvContent = results.map((result, index) => [
      index + 1,
      result.title.replace(/"/g, '""'), // ダブルクォートをエスケープ
      result.link,
      result.snippet.replace(/"/g, '""'),
    ]);

    const csvString =
      BOM +
      [headers.join(','), ...csvContent.map(row => row.map(cell => `"${cell}"`).join(','))].join(
        '\n'
      );

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search_results_${searchKeyword}_${new Date().toISOString().slice(0, 10)}.csv`;
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
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleShowDetail(result)}
                  >
                    <span>📋</span>
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
            <Button onClick={handleDownloadCSV} color="success">
              📄 CSV
            </Button>
            <Button onClick={handleDownloadJSON} color="info">
              📦 JSON
            </Button>
          </ButtonGroup>
        </Box>
      )}
      <ResultDetail result={selectedResult} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </TableContainer>
  );
};

export default ResultsTable;
