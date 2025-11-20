// src/types/freelanceFilter.ts

/**
 * フリーランスフィルター設定
 */
export interface FreelanceFilterSettings {
  maxWorkingDays: number; // 最大稼働日数（週）
  minHourlyRate: number; // 最低時給（円）
  remoteType: 'full' | 'partial' | 'any'; // リモートタイプ
  customBlocklist: string[]; // カスタムブロックリスト
}

/**
 * フィルタープリセット
 */
export interface FilterPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  settings: FreelanceFilterSettings;
}

/**
 * デフォルトプリセット
 */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'premium',
    name: 'プレミアム案件',
    icon: '🏆',
    description: '週2以下・時給7000円以上・フルリモートの超厳選案件',
    settings: {
      maxWorkingDays: 2,
      minHourlyRate: 7000,
      remoteType: 'full',
      customBlocklist: [],
    },
  },
  {
    id: 'strict',
    name: '厳選案件',
    icon: '⭐',
    description: '週3以下・時給5000円以上・フルリモートの厳選案件',
    settings: {
      maxWorkingDays: 3,
      minHourlyRate: 5000,
      remoteType: 'full',
      customBlocklist: [],
    },
  },
  {
    id: 'standard',
    name: 'スタンダード',
    icon: '💼',
    description: '週4以下・時給4000円以上・リモート可の標準案件',
    settings: {
      maxWorkingDays: 4,
      minHourlyRate: 4000,
      remoteType: 'partial',
      customBlocklist: [],
    },
  },
  {
    id: 'casual',
    name: 'カジュアル',
    icon: '🌟',
    description: '稼働日数不問・時給3000円以上・リモート条件不問',
    settings: {
      maxWorkingDays: 5,
      minHourlyRate: 3000,
      remoteType: 'any',
      customBlocklist: [],
    },
  },
];

/**
 * デフォルト設定（厳選案件）
 */
export const DEFAULT_FILTER_SETTINGS: FreelanceFilterSettings = FILTER_PRESETS[1].settings;
