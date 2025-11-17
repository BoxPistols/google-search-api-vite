// src/App.tsx
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import SearchForm from './components/SearchForm';
import QuotaDisplay from './components/QuotaDisplay';
import AuthButton from './components/AuthButton';
import { ToastProvider, toast } from './components/ui/Toast';
import { TableSkeleton, StatsSkeleton } from './components/ui/SkeletonLoader';
import { AnimatedBox } from './components/animated/AnimatedBox';
import { useKeyboardShortcuts, createShortcuts } from './hooks/useKeyboardShortcuts';
import { exportToPDF, exportToExcel } from './utils/advancedExport';

// Lazy load heavy components
const ResultsTable = lazy(() => import('./components/ResultsTable'));
const SearchHistory = lazy(() => import('./components/SearchHistory'));
const SearchStats = lazy(() => import('./components/SearchStats'));
const DomainAnalysis = lazy(() => import('./components/DomainAnalysis'));
const KeyboardShortcutsHelp = lazy(() => import('./components/advanced/KeyboardShortcutsHelp').then(module => ({ default: module.KeyboardShortcutsHelp })));
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Fab from '@mui/material/Fab';
import { Analytics } from '@vercel/analytics/react';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { SearchResult } from './types/search';
import { saveSearchToHistory, getSearchStats } from './utils/localStorage';
import {
  recordQueryUsage,
  canExecuteQuery,
  getRemainingQueries,
} from './utils/apiQuotaManager';
import { createCustomTheme } from './util/theme';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [queriesUsed, setQueriesUsed] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [stats, setStats] = useState(getSearchStats());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const searchFormRef = useRef<HTMLInputElement>(null);

  const currentTheme = createCustomTheme(darkMode ? 'dark' : 'light');

  // Keyboard shortcuts
  useKeyboardShortcuts([
    createShortcuts.search(() => {
      searchFormRef.current?.focus();
      toast.success('検索フォームにフォーカスしました');
    }),
    createShortcuts.export(() => {
      if (results.length > 0) {
        setExportMenuAnchor(document.body);
        toast.success('エクスポートメニューを開きました');
      } else {
        toast.error('エクスポートする結果がありません');
      }
    }),
    createShortcuts.theme(() => {
      setDarkMode(!darkMode);
      toast.success(`${!darkMode ? 'ダーク' : 'ライト'}モードに切り替えました`);
    }),
    createShortcuts.help(() => setShowHelp(true)),
  ]);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    setStats(getSearchStats());
  }, [results]);

  const handleExport = (format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') {
        exportToPDF(results, searchKeyword);
        toast.success('PDFエクスポートが完了しました');
      } else {
        exportToExcel(results, searchKeyword, stats);
        toast.success('Excelエクスポートが完了しました');
      }
    } catch (error) {
      toast.error('エクスポートに失敗しました');
      console.error('Export error:', error);
    }
    setExportMenuAnchor(null);
  };

  const handleSearch = async (apiKey: string, cx: string, query: string) => {
    const keywordCount = query.trim().split(/\s+/).length;
    const newQueries = 2 * keywordCount;

    if (!canExecuteQuery(newQueries)) {
      const remaining = getRemainingQueries();
      toast.error(
        `クォータ不足: 必要${newQueries}、残り${remaining}クエリ`,
        { duration: 5000 }
      );
      return;
    }

    setLoading(true);
    setResults([]);
    setSearchKeyword(query);
    toast.loading('検索中...');

    try {
      const firstPageResponse = await fetchResults(apiKey, cx, query, 1);
      console.log('firstPageResponse:', firstPageResponse);
      const firstPageResults = firstPageResponse.items || [];

      const secondPageResponse = await fetchResults(apiKey, cx, query, 11);
      console.log('secondPageResponse:', secondPageResponse);
      const secondPageResults = secondPageResponse.items || [];

      const allResults: SearchResult[] = [...firstPageResults, ...secondPageResults];

      setResults(allResults);

      recordQueryUsage(query, newQueries);
      setQueriesUsed(prev => prev + newQueries);

      // 検索履歴に保存
      saveSearchToHistory({
        id: `${Date.now()}-${query}`,
        query,
        timestamp: Date.now(),
        results: allResults,
        queriesUsed: newQueries,
      });

      setStats(getSearchStats());

      toast.dismiss();
      toast.success(`${allResults.length}件の検索結果を取得しました`);
    } catch (error) {
      console.error('検索エラー:', error);
      toast.dismiss();
      toast.error('検索中にエラーが発生しました。APIキーとSearch IDを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (history: any) => {
    setResults(history.results);
    setSearchKeyword(history.query);
    setQueriesUsed(prev => prev + history.queriesUsed);
  };
  // 残りのクエリ数を計算
  // const remainingQueries = 1000 - queriesUsed
  const remainingQueries = queriesUsed;

  // Google Custom Search APIへのリクエストを行う関数
  const fetchResults = async (apiKey: string, cx: string, query: string, start: number) => {
    try {
      // APIキーと検索エンジンIDの確認
      console.log(`API Key: ${apiKey?.substring(0, 5)}...`);
      console.log(`Search ID: ${cx?.substring(0, 5)}...`);

      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
          query
        )}&start=${start}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('APIエラーの詳細:', errorData);
        throw new Error(`検索APIエラー: ${errorData.error?.message || '不明なエラー'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('検索結果の取得エラー:', error);
      return {};
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box sx={{ position: 'relative', minHeight: '100vh', pb: 8 }}>
          {/* 右上のボタンエリア */}
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1100, display: 'flex', gap: 2 }}>
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              color="primary"
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: 3,
                '&:hover': { backgroundColor: 'action.hover' },
              }}
              aria-label="ダークモード切り替え"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <AuthButton />
          </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: '2vw', mb: 2 }}>
          <SearchIcon sx={{ fontSize: { md: '2.5rem', xs: '1.75rem' }, color: 'primary.main' }} />
          <Typography
            component="h1"
            variant="h2"
            textAlign={'center'}
            color="primary"
            sx={{
              fontSize: { md: '2.5rem', xs: '1.75rem' },
              fontWeight: 'bold',
            }}
          >
            Google Search Ranking Checker
          </Typography>
        </Box>

        <Typography
          textAlign={'center'}
          variant="subtitle1"
          m={1}
          mb={0.25}
          color="text.secondary"
          sx={{
            fontSize: { md: '0.875rem', xs: '0.75rem' },
          }}
        >
          Google純正のSearch
          APIを利用し、特定の検索ワードにおける検索順位結果を調べ、簡潔にレポーティングするSEO担当者向けツール
        </Typography>
        <Typography textAlign={'center'} variant="subtitle2" mx={1} color="text.secondary" mb={3}>
          現在20件(1位から10位、11位から20位)の検索結果を結合して取得しています
        </Typography>

        <Container maxWidth="xl">
          {/* APIクォータ表示 */}
          <QuotaDisplay onQuotaUpdate={() => setStats(getSearchStats())} />

          {/* 統計情報 */}
          {stats.totalSearches > 0 && (
            <AnimatedBox variant="slideUp" delay={0.1}>
              <Suspense fallback={<StatsSkeleton />}>
                <SearchStats
                  totalSearches={stats.totalSearches}
                  totalQueries={stats.totalQueries}
                  lastSearch={stats.lastSearch}
                />
              </Suspense>
            </AnimatedBox>
          )}

          {/* 検索履歴 */}
          <AnimatedBox variant="slideUp" delay={0.2}>
            <Suspense fallback={null}>
              <SearchHistory onSelectHistory={handleSelectHistory} />
            </Suspense>
          </AnimatedBox>

          {/* メイン検索フォーム */}
          <Box
            sx={{
              p: 3,
              pb: 4,
              mb: 3,
              boxShadow: 4,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              border: '2px solid',
              borderColor: 'divider',
            }}
          >
            <SearchForm onSearch={handleSearch} />
            <Box
              sx={{
                display: { md: 'flex', xs: 'block' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                mt: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                今回の利用クエリ数:
                <Typography component="span" fontWeight="bold" color="primary" ml={1}>
                  {remainingQueries > 0 ? remainingQueries : 0}
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ※ Google Search API基準: 1回の検索で2クエリ以上消費 (1クエリ/キーワード × 2ページ分) /
                1日に100クエリまで
              </Typography>
            </Box>
          </Box>

          {/* ドメイン分析 */}
          {results.length > 0 && (
            <AnimatedBox variant="slideUp" delay={0.3}>
              <Suspense fallback={null}>
                <DomainAnalysis results={results} />
              </Suspense>
            </AnimatedBox>
          )}

          {/* 検索結果 */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
              <CircularProgress size={48} />
              <Typography variant="h6" color="text.secondary">
                検索中...
              </Typography>
            </Box>
          ) : (
            <AnimatedBox variant="fadeIn" delay={0.4}>
              <Suspense fallback={<TableSkeleton />}>
                <ResultsTable results={results} searchKeyword={searchKeyword} />
              </Suspense>
            </AnimatedBox>
          )}
        </Container>

        {/* Floating Action Buttons */}
        {results.length > 0 && (
          <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Fab
              color="primary"
              aria-label="export"
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{ boxShadow: 6 }}
            >
              <FileDownloadIcon />
            </Fab>
            <Fab
              color="secondary"
              aria-label="help"
              onClick={() => setShowHelp(true)}
              size="small"
              sx={{ boxShadow: 6 }}
            >
              <HelpOutlineIcon />
            </Fab>
          </Box>
        )}

        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>PDFでエクスポート</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('excel')}>
            <ListItemIcon>
              <TableChartIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Excelでエクスポート</ListItemText>
          </MenuItem>
        </Menu>

        {/* Keyboard Shortcuts Help Dialog */}
        <Suspense fallback={null}>
          <KeyboardShortcutsHelp open={showHelp} onClose={() => setShowHelp(false)} />
        </Suspense>

        <ToastProvider />
        <Analytics />
      </Box>
    </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
