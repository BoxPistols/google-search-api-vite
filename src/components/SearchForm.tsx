// src/components/SearchForm.tsx
import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import { TextField, Button, Box, Typography, Chip, Alert } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { getRemainingQueries } from '../utils/apiQuotaManager';

type SearchFormProps = {
  onSearch: (apiKey: string, cx: string, query: string) => void;
};
// https://ja.vitejs.dev/guide/env-and-mode.html

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const cx = import.meta.env.VITE_GOOGLE_SEARCH_ID;

  // デバッグ用のコンソールログ

  console.log('API Key length:', typeof apiKey === 'string' ? apiKey.length : 'undefined');
  console.log('Search ID length:', typeof cx === 'string' ? cx.length : 'undefined');

  const [query, setQuery] = useState('');

  // クエリ消費量を計算（2ページ分 × キーワード数）
  const estimatedQueries = useMemo(() => {
    if (!query.trim()) return 0;
    const keywordCount = query.trim().split(/\s+/).length;
    return 2 * keywordCount; // 2ページ分（1-10位、11-20位）
  }, [query]);

  const remainingQueries = getRemainingQueries();
  const canSearch = estimatedQueries > 0 && remainingQueries >= estimatedQueries;
  const isLowQuota = remainingQueries < estimatedQueries * 2;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
      onSearch(apiKey, cx, query);
    } else {
      console.error('API KeyまたはSearch IDが設定されていません');
    }
  };

  return (
    <Box sx={{ width: '90%', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} aria-required="true">
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
                  キーワード数: {query.trim().split(/\s+/).length}個 → 消費クエリ: {estimatedQueries}
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
            {query === '' ? '入力待ち' : !canSearch ? 'クォータ不足' : `検索 (-${estimatedQueries})`}
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
            残りクォータが少なくなっています。この検索を実行すると残り{remainingQueries - estimatedQueries}クエリになります。
          </Alert>
        )}
      </form>
    </Box>
  );
};

export default SearchForm;
