// src/components/SearchHistory.tsx
import { useState, useEffect, memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getSearchHistory, clearSearchHistory } from '../utils/localStorage';
import type { SearchHistory as SearchHistoryType } from '../types/search';

interface SearchHistoryProps {
  onSelectHistory: (history: SearchHistoryType) => void;
}

const SearchHistory = memo(({ onSelectHistory }: SearchHistoryProps) => {
  const [history, setHistory] = useState<SearchHistoryType[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(() => {
    const data = getSearchHistory();
    setHistory(data);
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('検索履歴を全て削除しますか？')) {
      clearSearchHistory();
      setHistory([]);
    }
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        p: 2,
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
          <HistoryIcon color="primary" />
          <Typography variant="h6" color="primary">
            検索履歴 ({history.length}件)
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
            <DeleteIcon />
          </IconButton>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
                borderColor: 'divider',
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
});

SearchHistory.displayName = 'SearchHistory';

export default SearchHistory;
