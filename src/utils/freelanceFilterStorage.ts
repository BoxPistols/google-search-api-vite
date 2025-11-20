// src/utils/freelanceFilterStorage.ts
import type { FreelanceFilterSettings } from '../types/freelanceFilter';
import { DEFAULT_FILTER_SETTINGS } from '../types/freelanceFilter';

const STORAGE_KEY = 'freelance_filter_settings';

/**
 * フィルター設定をLocalStorageから取得
 */
export function getFreelanceFilterSettings(): FreelanceFilterSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load filter settings:', error);
  }
  return DEFAULT_FILTER_SETTINGS;
}

/**
 * フィルター設定をLocalStorageに保存
 */
export function saveFreelanceFilterSettings(settings: FreelanceFilterSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save filter settings:', error);
  }
}

/**
 * フィルター設定をリセット
 */
export function resetFreelanceFilterSettings(): FreelanceFilterSettings {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_FILTER_SETTINGS;
}
