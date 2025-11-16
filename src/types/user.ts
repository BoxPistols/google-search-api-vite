// src/types/user.ts

export type UserType = 'guest' | 'user' | 'owner';

export interface UserSettings {
  userType: UserType;
  dailyQuotaLimit: number;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType: UserType;
}

export const QUOTA_LIMITS: Record<UserType, number> = {
  guest: 10,   // 未ログインは10クエリ/日
  user: 50,    // 一般ユーザーは50クエリ/日
  owner: 500,  // オーナーは500クエリ/日
};

// オーナーのメールアドレス（環境変数から読み込み）
export const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || '';
