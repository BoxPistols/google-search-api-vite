// src/components/SearchHistory.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Collapse,
  Chip,
  Paper,
} from '@mui/material';
import { getSearchHistory, clearSearchHistory } from '../utils/localStorage';
import type { SearchHistory as SearchHistoryType } from '../types/search';
import theme from '../util/theme';

interface SearchHistoryProps {
  onSelectHistory: (history: SearchHistoryType) => void;
}

const SearchHistory = ({ onSelectHistory }: SearchHistoryProps) => {
  const [history, setHistory] = useState<SearchHistoryType[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getSearchHistory();
    setHistory(data);
  };

  const handleClearHistory = () => {
    if (window.confirm('検索履歴を全て削除しますか？')) {
      clearSearchHistory();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary">
            📋 検索履歴 ({history.length}件)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleClearHistory();
            }}
            size="small"
            color="error"
            title="履歴をクリア"
          >
            <Typography>🗑️</Typography>
          </IconButton>
          <Typography>{expanded ? '▲' : '▼'}</Typography>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <List sx={{ mt: 2 }}>
          {history.slice(0, 10).map((item) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                mb: 1,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 1,
              }}
            >
              <ListItemButton onClick={() => onSelectHistory(item)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {item.query}
                      </Typography>
                      <Chip
                        label={`${item.results.length}件`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.timestamp)} | クエリ消費: {item.queriesUsed}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default SearchHistory;
