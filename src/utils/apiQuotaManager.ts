// src/utils/apiQuotaManager.ts
// Google Custom Search API のクエリ使用量を管理するユーティリティ

import { getDailyQuotaLimit } from './userSettings';

const STORAGE_KEY = 'google_api_quota';

export interface QuotaData {
  date: string; // YYYY-MM-DD形式
  queriesUsed: number;
  lastUpdated: number; // タイムスタンプ
  searches: Array<{
    timestamp: number;
    query: string;
    queriesConsumed: number;
  }>;
}

// 今日の日付を取得（YYYY-MM-DD形式）
const getTodayString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// クォータデータを取得
export const getQuotaData = (): QuotaData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: QuotaData = JSON.parse(data);

      // 日付が変わっていたらリセット
      const today = getTodayString();
      if (parsed.date !== today) {
        return resetQuota();
      }

      return parsed;
    }
  } catch (error) {
    console.error('Error loading quota data:', error);
  }

  return resetQuota();
};

// クォータをリセット
export const resetQuota = (): QuotaData => {
  const newData: QuotaData = {
    date: getTodayString(),
    queriesUsed: 0,
    lastUpdated: Date.now(),
    searches: [],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error('Error resetting quota:', error);
  }

  return newData;
};

// クエリ使用量を記録
export const recordQueryUsage = (query: string, queriesConsumed: number): QuotaData => {
  const currentData = getQuotaData();

  const updatedData: QuotaData = {
    ...currentData,
    queriesUsed: currentData.queriesUsed + queriesConsumed,
    lastUpdated: Date.now(),
    searches: [
      ...currentData.searches,
      {
        timestamp: Date.now(),
        query,
        queriesConsumed,
      },
    ],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error recording query usage:', error);
  }

  return updatedData;
};

// 残りのクエリ数を取得
export const getRemainingQueries = (): number => {
  const data = getQuotaData();
  const limit = getDailyQuotaLimit();
  return Math.max(0, limit - data.queriesUsed);
};

// クエリ使用率を取得（0-100%）
export const getQuotaUsagePercentage = (): number => {
  const data = getQuotaData();
  const limit = getDailyQuotaLimit();
  return Math.min(100, (data.queriesUsed / limit) * 100);
};

// リセットまでの時間を取得（ミリ秒）
export const getTimeUntilReset = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return tomorrow.getTime() - now.getTime();
};

// リセットまでの時間を人間が読める形式で取得
export const getTimeUntilResetFormatted = (): string => {
  const ms = getTimeUntilReset();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}時間${minutes}分`;
};

// クエリ実行可能かチェック
export const canExecuteQuery = (queriesNeeded: number = 1): boolean => {
  return getRemainingQueries() >= queriesNeeded;
};

// 現在のユーザーの日次制限を取得
export const getQuotaLimit = (): number => {
  return getDailyQuotaLimit();
};
