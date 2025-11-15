// src/types/user.ts

export type UserType = 'owner' | 'user';

export interface UserSettings {
  userType: UserType;
  dailyQuotaLimit: number;
}

export const QUOTA_LIMITS: Record<UserType, number> = {
  owner: 500, // オーナーは500クエリ/日
  user: 50,   // 一般ユーザーは50クエリ/日
};
