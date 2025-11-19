// Advanced Filtering Component
import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface FilterOptions {
  searchTerm: string;
  domainFilter: string;
  rankRange: [number, number];
  sortBy: 'rank' | 'domain' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  domains: string[];
}

export const AdvancedFilters = memo(
  ({ filters, onFiltersChange, domains }: AdvancedFiltersProps) => {
    const [expanded, setExpanded] = useState(false);

    const handleFilterChange = (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => {
      onFiltersChange({ ...filters, [key]: value });
    };

    const handleReset = () => {
      onFiltersChange({
        searchTerm: '',
        domainFilter: '',
        rankRange: [1, 20],
        sortBy: 'rank',
        sortOrder: 'asc',
      });
    };

    const activeFiltersCount = [
      filters.searchTerm,
      filters.domainFilter,
      filters.sortBy !== 'rank',
    ].filter(Boolean).length;

    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
            <FilterListIcon color="primary" />
            <Typography variant="h6" color="primary">
              高度なフィルター
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip label={`${activeFiltersCount}個適用中`} size="small" color="primary" />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeFiltersCount > 0 && (
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  handleReset();
                }}
                title="フィルターをクリア"
              >
                <ClearIcon />
              </IconButton>
            )}
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {/* Search Term Filter */}
            <TextField
              label="タイトル・URLで検索"
              value={filters.searchTerm}
              onChange={e => handleFilterChange('searchTerm', e.target.value)}
              size="small"
              fullWidth
            />

            {/* Domain Filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>ドメイン</InputLabel>
              <Select
                value={filters.domainFilter}
                onChange={e => handleFilterChange('domainFilter', e.target.value)}
                label="ドメイン"
              >
                <MenuItem value="">すべて</MenuItem>
                {domains.map(domain => (
                  <MenuItem key={domain} value={domain}>
                    {domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort By */}
            <FormControl size="small" fullWidth>
              <InputLabel>並び替え</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={e => handleFilterChange('sortBy', e.target.value)}
                label="並び替え"
              >
                <MenuItem value="rank">順位</MenuItem>
                <MenuItem value="domain">ドメイン</MenuItem>
                <MenuItem value="title">タイトル</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Order */}
            <FormControl size="small" fullWidth>
              <InputLabel>順序</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={e => handleFilterChange('sortOrder', e.target.value)}
                label="順序"
              >
                <MenuItem value="asc">昇順</MenuItem>
                <MenuItem value="desc">降順</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </Paper>
    );
  }
);

AdvancedFilters.displayName = 'AdvancedFilters';
