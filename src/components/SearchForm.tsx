// src/components/SearchForm.tsx
import { useState, useMemo, memo, useCallback } from 'react';
import type { FormEvent } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import ComputerIcon from '@mui/icons-material/Computer';
import CalculateIcon from '@mui/icons-material/Calculate';
import { getRemainingQueries } from '../utils/apiQuotaManager';

export type SearchMode = 'normal' | 'job' | 'freelance';

type SearchFormProps = {
  onSearch: (apiKey: string, cx: string, query: string, mode: SearchMode) => void;
};
// https://ja.vitejs.dev/guide/env-and-mode.html

const SearchForm = memo(({ onSearch }: SearchFormProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const cx = import.meta.env.VITE_GOOGLE_SEARCH_ID;

  // デバッグ用のコンソールログ

  console.log('API Key length:', typeof apiKey === 'string' ? apiKey.length : 'undefined');
  console.log('Search ID length:', typeof cx === 'string' ? cx.length : 'undefined');

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('normal');

  // クエリ消費量を計算（2ページ分 × キーワード数）
  const estimatedQueries = useMemo(() => {
    if (!query.trim()) return 0;
    const keywordCount = query.trim().split(/\s+/).length;
    return 2 * keywordCount; // 2ページ分（1-10位、11-20位）
  }, [query]);

  const remainingQueries = getRemainingQueries();
  const canSearch = estimatedQueries > 0 && remainingQueries >= estimatedQueries;
  const isLowQuota = remainingQueries < estimatedQueries * 2;

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!canSearch) {
        alert(
          `クォータが不足しています。\n` +
            `必要なクエリ数: ${estimatedQueries}\n` +
            `残りクエリ数: ${remainingQueries}`
        );
        return;
      }

      // apiKeyとcxが文字列であることを確認してから渡す
      if (typeof apiKey === 'string' && typeof cx === 'string') {
        onSearch(apiKey, cx, query, searchMode);
      } else {
        console.error('API KeyまたはSearch IDが設定されていません');
      }
    },
    [canSearch, estimatedQueries, remainingQueries, apiKey, cx, query, searchMode, onSearch]
  );

  return (
    <Box sx={{ width: '90%', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} aria-required="true">
        {/* 検索モード切り替え */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={(_, newMode) => newMode && setSearchMode(newMode)}
            aria-label="検索モード"
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiToggleButton-root': {
                py: 1,
                px: 3,
                border: '2px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="normal" aria-label="通常検索">
              <SearchIcon sx={{ mr: 1 }} />
              通常検索
            </ToggleButton>
            <ToggleButton value="job" aria-label="求人検索">
              <WorkIcon sx={{ mr: 1 }} />
              求人検索
            </ToggleButton>
            <ToggleButton value="freelance" aria-label="フリーランス検索">
              <ComputerIcon sx={{ mr: 1 }} />
              フリーランス
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 求人検索モードの説明 */}
        {searchMode === 'job' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              求人検索モード
            </Typography>
            <Typography variant="caption" component="div">
              • 企業の直接採用ページのみを表示
              <br />
              • Indeed、リクナビ、マイナビなどの求人サイトを除外
              <br />
              • ブログやまとめ記事を除外
              <br />• JSON-LD構造化データで求人情報を検出
            </Typography>
          </Alert>
        )}

        {/* フリーランス検索モードの説明 */}
        {searchMode === 'freelance' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              フリーランス検索モード（厳選条件）
            </Typography>
            <Typography variant="caption" component="div">
              • <strong>週3以下の業務委託案件</strong>のみを表示
              <br />
              • <strong>時給5000円以上</strong>の案件に限定
              <br />
              • <strong>フルリモート</strong>案件のみ
              <br />
              • ProSheet、レバテック等のエージェントを除外
              <br />• 企業の直接募集案件を優先
            </Typography>
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: '1fr auto',
            alignItems: 'start',
            '@media (max-width: 960px)': {
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <TextField
            label="Google 検索キーワード"
            placeholder="キーワードA キーワードB"
            variant="outlined"
            value={query}
            fullWidth
            onChange={e => setQuery(e.target.value)}
            helperText={
              query.trim() ? (
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalculateIcon sx={{ fontSize: '0.875rem' }} />
                  キーワード数: {query.trim().split(/\s+/).length}個 → 消費クエリ:{' '}
                  {estimatedQueries}
                </Box>
              ) : (
                'スペース区切りで複数キーワードを入力'
              )
            }
            sx={{
              '.MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            aria-label="検索開始"
            variant="contained"
            color={!canSearch && query !== '' ? 'error' : 'primary'}
            type="submit"
            disabled={query === '' || !canSearch}
            sx={{
              height: '56px',
              minWidth: '140px',
              '@media (max-width: 960px)': {
                width: '100%',
              },
            }}
          >
            {query === ''
              ? '入力待ち'
              : !canSearch
                ? 'クォータ不足'
                : `検索 (-${estimatedQueries})`}
          </Button>
        </Box>

        {/* クエリ消費量の詳細表示 */}
        {estimatedQueries > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              icon={<CalculateIcon />}
              label={`消費予定: ${estimatedQueries}クエリ`}
              color={canSearch ? 'primary' : 'error'}
              variant="outlined"
            />
            <Chip
              label={`残り: ${remainingQueries}クエリ`}
              color={isLowQuota ? 'warning' : 'success'}
              variant="outlined"
            />
            {!canSearch && (
              <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                ※ クォータが不足しています
              </Typography>
            )}
          </Box>
        )}

        {/* 警告メッセージ */}
        {isLowQuota && canSearch && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            残りクォータが少なくなっています。この検索を実行すると残り
            {remainingQueries - estimatedQueries}クエリになります。
          </Alert>
        )}
      </form>
    </Box>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
