// src/utils/userSettings.ts
import type { UserType, UserSettings } from '../types/user';
import { QUOTA_LIMITS } from '../types/user';

const USER_SETTINGS_KEY = 'user_settings';

// デフォルトのユーザー設定
const DEFAULT_USER_SETTINGS: UserSettings = {
  userType: 'user',
  dailyQuotaLimit: QUOTA_LIMITS.user,
};

// ユーザー設定を取得
export const getUserSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(USER_SETTINGS_KEY);
    if (data) {
      const settings: UserSettings = JSON.parse(data);
      // クォータ制限が変更されている可能性があるので、最新の値を適用
      settings.dailyQuotaLimit = QUOTA_LIMITS[settings.userType];
      return settings;
    }
  } catch (error) {
    console.error('Error loading user settings:', error);
  }

  return DEFAULT_USER_SETTINGS;
};

// ユーザー設定を保存
export const saveUserSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
};

// ユーザータイプを変更
export const setUserType = (userType: UserType): UserSettings => {
  const settings: UserSettings = {
    userType,
    dailyQuotaLimit: QUOTA_LIMITS[userType],
  };
  saveUserSettings(settings);
  return settings;
};

// 現在のユーザータイプを取得
export const getUserType = (): UserType => {
  return getUserSettings().userType;
};

// 現在のクォータ制限を取得
export const getDailyQuotaLimit = (): number => {
  return getUserSettings().dailyQuotaLimit;
};
