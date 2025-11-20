// src/components/FreelanceFilterSettings.tsx
import { useState, memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TuneIcon from '@mui/icons-material/Tune';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FreelanceFilterSettings as FilterSettings } from '../types/freelanceFilter';
import { FILTER_PRESETS } from '../types/freelanceFilter';

interface FreelanceFilterSettingsProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
  onReset: () => void;
}

export const FreelanceFilterSettings = memo(
  ({ settings, onSettingsChange, onReset }: FreelanceFilterSettingsProps) => {
    const [expanded, setExpanded] = useState(false);
    const [newDomain, setNewDomain] = useState('');

    const handlePresetChange = (presetId: string) => {
      const preset = FILTER_PRESETS.find(p => p.id === presetId);
      if (preset) {
        onSettingsChange({
          ...preset.settings,
          customBlocklist: settings.customBlocklist, // カスタムブロックリストは保持
        });
      }
    };

    const handleAddDomain = () => {
      if (newDomain.trim() && !settings.customBlocklist.includes(newDomain.trim())) {
        onSettingsChange({
          ...settings,
          customBlocklist: [...settings.customBlocklist, newDomain.trim()],
        });
        setNewDomain('');
      }
    };

    const handleRemoveDomain = (domain: string) => {
      onSettingsChange({
        ...settings,
        customBlocklist: settings.customBlocklist.filter(d => d !== domain),
      });
    };

    return (
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: 'success.50' }}>
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
            <TuneIcon color="success" />
            <Typography variant="h6" color="success.dark" fontWeight="bold">
              フィルター詳細設定
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                onReset();
              }}
              title="設定をリセット"
            >
              <RestoreIcon />
            </IconButton>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 3 }}>
            {/* プリセット選択 */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              プリセット
            </Typography>
            <ButtonGroup variant="outlined" fullWidth sx={{ mb: 3 }}>
              {FILTER_PRESETS.map(preset => (
                <Button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  sx={{
                    flexDirection: 'column',
                    py: 1.5,
                    textTransform: 'none',
                  }}
                >
                  <Typography variant="body2" fontSize="1.2rem">
                    {preset.icon}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {preset.name}
                  </Typography>
                </Button>
              ))}
            </ButtonGroup>

            <Divider sx={{ my: 3 }} />

            {/* 週の稼働日数 */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              最大稼働日数: 週{settings.maxWorkingDays}日以下
            </Typography>
            <Slider
              value={settings.maxWorkingDays}
              onChange={(_, value) =>
                onSettingsChange({ ...settings, maxWorkingDays: value as number })
              }
              min={1}
              max={5}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            {/* 最低時給 */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              最低時給: {settings.minHourlyRate.toLocaleString()}円以上
            </Typography>
            <Slider
              value={settings.minHourlyRate}
              onChange={(_, value) =>
                onSettingsChange({ ...settings, minHourlyRate: value as number })
              }
              min={3000}
              max={10000}
              step={500}
              marks={[
                { value: 3000, label: '3000円' },
                { value: 5000, label: '5000円' },
                { value: 7000, label: '7000円' },
                { value: 10000, label: '10000円' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${value.toLocaleString()}円`}
              sx={{ mb: 3 }}
            />

            {/* リモートタイプ */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>リモート条件</InputLabel>
              <Select
                value={settings.remoteType}
                onChange={e =>
                  onSettingsChange({
                    ...settings,
                    remoteType: e.target.value as 'full' | 'partial' | 'any',
                  })
                }
                label="リモート条件"
              >
                <MenuItem value="full">フルリモートのみ</MenuItem>
                <MenuItem value="partial">リモート可（一部リモートも含む）</MenuItem>
                <MenuItem value="any">リモート条件不問</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* カスタムブロックリスト */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              カスタム除外ドメイン
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="example.com"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddDomain()}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddDomain}
                disabled={!newDomain.trim()}
              >
                追加
              </Button>
            </Box>

            {settings.customBlocklist.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {settings.customBlocklist.map(domain => (
                  <Chip
                    key={domain}
                    label={domain}
                    onDelete={() => handleRemoveDomain(domain)}
                    deleteIcon={<DeleteIcon />}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  }
);

FreelanceFilterSettings.displayName = 'FreelanceFilterSettings';
