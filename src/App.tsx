// src/App.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import SearchForm from './components/SearchForm';
import QuotaDisplay from './components/QuotaDisplay';
import AuthButton from './components/AuthButton';

// Lazy load heavy components
const ResultsTable = lazy(() => import('./components/ResultsTable'));
const SearchHistory = lazy(() => import('./components/SearchHistory'));
const SearchStats = lazy(() => import('./components/SearchStats'));
const DomainAnalysis = lazy(() => import('./components/DomainAnalysis'));
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { Analytics } from '@vercel/analytics/react';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
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
  const [results, setResults] = useState<SearchResult[]>([]); // 検索結果を格納する状態
  // 検索中にローディングスピナーを表示するための状態 (後述)
  const [loading, setLoading] = useState(false);
  // クエリ消費数を格納する状態
  const [queriesUsed, setQueriesUsed] = useState(0);
  // 検索キーワードを保存する状態を追加
  const [searchKeyword, setSearchKeyword] = useState('');
  // 統計情報の状態
  const [stats, setStats] = useState(getSearchStats());
  // ダークモードの状態（localStorageから読み込み）
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // テーマの設定
  const currentTheme = createCustomTheme(darkMode ? 'dark' : 'light');

  // ダークモードの変更をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // ページロード時に統計を更新
    setStats(getSearchStats());
  }, [results]);

  const handleSearch = async (apiKey: string, cx: string, query: string) => {
    // クエリ消費数を計算
    const keywordCount = query.trim().split(/\s+/).length;
    const newQueries = 2 * keywordCount; // 2ページ分取得するため

    // APIクォータのチェック
    if (!canExecuteQuery(newQueries)) {
      const remaining = getRemainingQueries();
      alert(
        `APIクォータが不足しています。\n` +
        `必要なクエリ数: ${newQueries}\n` +
        `残りクエリ数: ${remaining}\n\n` +
        `クォータは翌日0:00にリセットされます。`
      );
      return;
    }

    setLoading(true);
    setResults([]);
    setSearchKeyword(query);

    try {
      const firstPageResponse = await fetchResults(apiKey, cx, query, 1);
      console.log('firstPageResponse:', firstPageResponse);
      const firstPageResults = firstPageResponse.items || [];

      const secondPageResponse = await fetchResults(apiKey, cx, query, 11);
      console.log('secondPageResponse:', secondPageResponse);
      const secondPageResults = secondPageResponse.items || [];

      const allResults: SearchResult[] = [...firstPageResults, ...secondPageResults];

      setResults(allResults);

      // APIクォータを記録
      recordQueryUsage(query, newQueries);

      // クエリ消費数を更新
      setQueriesUsed(prev => prev + newQueries);

      // 検索履歴に保存
      saveSearchToHistory({
        id: `${Date.now()}-${query}`,
        query,
        timestamp: Date.now(),
        results: allResults,
        queriesUsed: newQueries,
      });

      // 統計を更新
      setStats(getSearchStats());
    } catch (error) {
      console.error('検索エラー:', error);
      alert('検索中にエラーが発生しました。APIキーとSearch IDを確認してください。');
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
            <Suspense fallback={<CircularProgress />}>
              <SearchStats
                totalSearches={stats.totalSearches}
                totalQueries={stats.totalQueries}
                lastSearch={stats.lastSearch}
              />
            </Suspense>
          )}

          {/* 検索履歴 */}
          <Suspense fallback={<CircularProgress />}>
            <SearchHistory onSelectHistory={handleSelectHistory} />
          </Suspense>

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
            <Suspense fallback={<CircularProgress />}>
              <DomainAnalysis results={results} />
            </Suspense>
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
            <Suspense fallback={<CircularProgress />}>
              <ResultsTable results={results} searchKeyword={searchKeyword} />
            </Suspense>
          )}
        </Container>
        <Analytics />
      </Box>
    </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
