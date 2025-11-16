// src/utils/userSettings.ts
import type { UserType } from '../types/user';
import { QUOTA_LIMITS } from '../types/user';

// 認証コンテキストから取得する場合のユーザータイプ（グローバル変数）
let currentUserType: UserType = 'guest';

// 現在のユーザータイプを設定（AuthContextから呼び出される）
export const setCurrentUserType = (userType: UserType): void => {
  currentUserType = userType;
};

// 現在のユーザータイプを取得
export const getUserType = (): UserType => {
  return currentUserType;
};

// 現在のクォータ制限を取得
export const getDailyQuotaLimit = (): number => {
  return QUOTA_LIMITS[currentUserType];
};
