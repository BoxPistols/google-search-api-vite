# クォータ管理ベストプラクティス

## 📋 目次

1. [クォータ管理の重要性](#クォータ管理の重要性)
2. [実装済みの管理機能](#実装済みの管理機能)
3. [高度なクォータ管理](#高度なクォータ管理)
4. [マルチユーザー対応](#マルチユーザー対応)
5. [コスト最適化戦略](#コスト最適化戦略)
6. [監視とアラート](#監視とアラート)

---

## クォータ管理の重要性

### なぜクォータ管理が必要か？

1. **コスト管理**
   - 予期しない高額請求を防ぐ
   - 予算内での運用を保証

2. **サービス品質**
   - すべてのユーザーに公平なアクセス
   - 特定ユーザーによる独占を防止

3. **API制限の遵守**
   - Googleの利用規約を守る
   - アカウント停止のリスク回避

---

## 実装済みの管理機能

### 現在の実装 (`src/utils/apiQuotaManager.ts`)

```typescript
// 基本的なクォータ管理
export interface QuotaData {
  date: string;           // 日付キー（YYYY-MM-DD）
  queriesUsed: number;    // 使用クエリ数
  searches: SearchRecord[]; // 検索履歴
}

export interface SearchRecord {
  query: string;      // 検索キーワード
  timestamp: number;  // タイムスタンプ
  queries: number;    // 消費クエリ数
}
```

### 主要な機能

#### 1. クォータ追跡

```typescript
// 使用状況の記録
export function recordQueryUsage(query: string, queries: number) {
  const today = new Date().toISOString().split('T')[0];
  const quotaData = getQuotaData();

  // 新しい日付の場合はリセット
  if (quotaData.date !== today) {
    quotaData.date = today;
    quotaData.queriesUsed = 0;
    quotaData.searches = [];
  }

  // クエリ数を加算
  quotaData.queriesUsed += queries;

  // 検索履歴に追加
  quotaData.searches.push({
    query,
    timestamp: Date.now(),
    queries,
  });

  saveQuotaData(quotaData);
}
```

#### 2. クォータチェック

```typescript
// 実行可能かチェック
export function canExecuteQuery(requiredQueries: number): boolean {
  const remaining = getRemainingQueries();
  return remaining >= requiredQueries;
}

// 残りクエリ数を取得
export function getRemainingQueries(): number {
  const limit = getQuotaLimit();
  const used = getQuotaData().queriesUsed;
  return Math.max(0, limit - used);
}
```

#### 3. ユーザータイプ別制限

```typescript
// src/types/user.ts
export const QUOTA_LIMITS: Record<UserType, number> = {
  guest: 10,   // 未ログイン: 10クエリ/日
  user: 50,    // 一般ユーザー: 50クエリ/日
  owner: 500,  // オーナー: 500クエリ/日
};

export function getQuotaLimit(): number {
  const { userType } = useAuth();
  return QUOTA_LIMITS[userType];
}
```

---

## 高度なクォータ管理

### 1. Firestoreを使用したサーバーサイド管理

#### データベース構造

```typescript
// Firestore Collection: quotas
interface FirestoreQuota {
  userId: string;
  date: string;           // YYYY-MM-DD
  queriesUsed: number;
  searches: {
    query: string;
    timestamp: Timestamp;
    queries: number;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore Collection: users
interface FirestoreUser {
  uid: string;
  email: string;
  userType: 'guest' | 'user' | 'premium' | 'owner';
  quotaLimit: number;
  subscriptionTier: string;
  createdAt: Timestamp;
}
```

#### 実装例

```typescript
import { getFirestore, doc, getDoc, setDoc, increment } from 'firebase/firestore';

class FirestoreQuotaManager {
  private db = getFirestore();

  async recordQueryUsage(userId: string, query: string, queries: number) {
    const today = new Date().toISOString().split('T')[0];
    const quotaRef = doc(this.db, 'quotas', `${userId}_${today}`);

    await setDoc(
      quotaRef,
      {
        userId,
        date: today,
        queriesUsed: increment(queries),
        searches: arrayUnion({
          query,
          timestamp: serverTimestamp(),
          queries,
        }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async getRemainingQueries(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    const today = new Date().toISOString().split('T')[0];
    const quotaRef = doc(this.db, 'quotas', `${userId}_${today}`);
    const quotaSnap = await getDoc(quotaRef);

    const used = quotaSnap.exists() ? quotaSnap.data().queriesUsed : 0;
    return Math.max(0, user.quotaLimit - used);
  }

  async canExecuteQuery(userId: string, required: number): Promise<boolean> {
    const remaining = await this.getRemainingQueries(userId);
    return remaining >= required;
  }

  private async getUser(userId: string) {
    const userRef = doc(this.db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    return userSnap.data();
  }
}
```

### 2. Redis を使用したリアルタイムクォータ管理

```typescript
import { createClient } from 'redis';

class RedisQuotaManager {
  private client = createClient();

  async recordQueryUsage(userId: string, queries: number) {
    const today = new Date().toISOString().split('T')[0];
    const key = `quota:${userId}:${today}`;

    await this.client.incrBy(key, queries);

    // 翌日0:00に自動削除
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const ttl = Math.floor((tomorrow.getTime() - Date.now()) / 1000);

    await this.client.expire(key, ttl);
  }

  async getRemainingQueries(userId: string, limit: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `quota:${userId}:${today}`;

    const used = await this.client.get(key);
    return Math.max(0, limit - (parseInt(used || '0', 10)));
  }

  async canExecuteQuery(userId: string, limit: number, required: number): Promise<boolean> {
    const remaining = await this.getRemainingQueries(userId, limit);
    return remaining >= required;
  }

  // レート制限（1秒間に10リクエストまで）
  async checkRateLimit(userId: string): Promise<boolean> {
    const key = `ratelimit:${userId}`;
    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, 1); // 1秒後に削除
    }

    return count <= 10; // 1秒間に10リクエストまで
  }
}
```

---

## マルチユーザー対応

### サブスクリプションプラン設計

```typescript
// サブスクリプションプラン定義
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;           // 月額料金（円）
  dailyQueries: number;    // 日次クエリ数
  features: string[];      // 利用可能機能
  priority: number;        // 優先度
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    dailyQueries: 10,
    features: ['基本検索', '履歴保存（10件）'],
    priority: 0,
  },
  {
    id: 'basic',
    name: 'ベーシック',
    price: 980,
    dailyQueries: 100,
    features: ['基本検索', '履歴保存（100件）', 'CSV/JSONエクスポート'],
    priority: 1,
  },
  {
    id: 'pro',
    name: 'プロフェッショナル',
    price: 2,980,
    dailyQueries: 500,
    features: [
      '基本検索',
      '履歴保存（無制限）',
      'すべてのエクスポート形式',
      '順位推移チャート',
      '比較分析',
    ],
    priority: 2,
  },
  {
    id: 'enterprise',
    name: 'エンタープライズ',
    price: 9,800,
    dailyQueries: 2000,
    features: [
      'すべてのProプラン機能',
      'API アクセス',
      '優先サポート',
      'カスタムレポート',
      'チーム機能',
    ],
    priority: 3,
  },
];
```

### プラン別機能制御

```typescript
class FeatureGate {
  private userPlan: SubscriptionPlan;

  constructor(userId: string) {
    this.userPlan = this.getUserPlan(userId);
  }

  canUseFeature(feature: string): boolean {
    return this.userPlan.features.includes(feature);
  }

  canExportPDF(): boolean {
    return this.canUseFeature('すべてのエクスポート形式');
  }

  canViewTrendChart(): boolean {
    return this.canUseFeature('順位推移チャート');
  }

  canUseComparisonView(): boolean {
    return this.canUseFeature('比較分析');
  }

  getDailyQuotaLimit(): number {
    return this.userPlan.dailyQueries;
  }

  private getUserPlan(userId: string): SubscriptionPlan {
    // Firestoreからユーザーのプラン情報を取得
    // 実装は省略
    return SUBSCRIPTION_PLANS[0];
  }
}
```

---

## コスト最適化戦略

### 1. キャッシング戦略

#### メモリキャッシュ

```typescript
import NodeCache from 'node-cache';

class SearchCache {
  private cache = new NodeCache({
    stdTTL: 3600,      // 1時間キャッシュ
    checkperiod: 120,  // 2分ごとにチェック
  });

  getCacheKey(query: string): string {
    return `search:${query}:${new Date().toISOString().split('T')[0]}`;
  }

  async getOrSearch(query: string, searchFn: () => Promise<any>) {
    const key = this.getCacheKey(query);
    const cached = this.cache.get(key);

    if (cached) {
      console.log('Cache hit:', query);
      return cached;
    }

    console.log('Cache miss:', query);
    const result = await searchFn();
    this.cache.set(key, result);

    return result;
  }

  clear() {
    this.cache.flushAll();
  }
}

// 使用例
const cache = new SearchCache();

async function search(query: string) {
  return cache.getOrSearch(query, async () => {
    // 実際のAPI呼び出し
    return await performGoogleSearch(query);
  });
}
```

#### Redisキャッシュ

```typescript
class RedisSearchCache {
  private client = createClient();

  async getOrSearch(query: string, searchFn: () => Promise<any>) {
    const key = `search:${query}:${new Date().toISOString().split('T')[0]}`;
    const cached = await this.client.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await searchFn();
    await this.client.setEx(key, 3600, JSON.stringify(result));

    return result;
  }
}
```

### 2. バッチ処理とスケジューリング

```typescript
import cron from 'node-cron';

class BatchSearchScheduler {
  // 毎日午前2時に実行（トラフィックが少ない時間帯）
  scheduleNightlyBatch() {
    cron.schedule('0 2 * * *', async () => {
      console.log('Starting nightly batch search...');

      const queries = await this.getPendingQueries();

      for (const query of queries) {
        await this.processQuery(query);

        // レート制限を守るため100ms待機
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('Nightly batch search completed');
    });
  }

  // クエリを優先順位付きキューに追加
  async queueQuery(query: string, priority: number = 0) {
    await db.collection('queryQueue').add({
      query,
      priority,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  private async getPendingQueries() {
    const snapshot = await db
      .collection('queryQueue')
      .where('status', '==', 'pending')
      .orderBy('priority', 'desc')
      .limit(100)
      .get();

    return snapshot.docs.map(doc => doc.data());
  }

  private async processQuery(query: any) {
    try {
      const result = await performSearch(query.query);

      await db.collection('queryQueue').doc(query.id).update({
        status: 'completed',
        result,
        completedAt: new Date(),
      });
    } catch (error) {
      await db.collection('queryQueue').doc(query.id).update({
        status: 'failed',
        error: error.message,
        failedAt: new Date(),
      });
    }
  }
}
```

### 3. プログレッシブな検索

```typescript
// 段階的に検索を実行（必要に応じて詳細を取得）
class ProgressiveSearch {
  async search(query: string, depth: 'basic' | 'standard' | 'detailed' = 'basic') {
    // Step 1: Basic (1クエリ) - 上位10件のみ
    if (depth === 'basic') {
      return await this.searchBasic(query);
    }

    // Step 2: Standard (2クエリ) - 上位20件
    if (depth === 'standard') {
      return await this.searchStandard(query);
    }

    // Step 3: Detailed (4クエリ) - 上位40件 + メタデータ
    return await this.searchDetailed(query);
  }

  private async searchBasic(query: string) {
    // 1クエリのみ消費
    return await performSearch(query, { start: 1, num: 10 });
  }

  private async searchStandard(query: string) {
    // 2クエリ消費
    const [page1, page2] = await Promise.all([
      performSearch(query, { start: 1, num: 10 }),
      performSearch(query, { start: 11, num: 10 }),
    ]);

    return [...page1, ...page2];
  }

  private async searchDetailed(query: string) {
    // 4クエリ消費
    const results = await Promise.all([
      performSearch(query, { start: 1, num: 10 }),
      performSearch(query, { start: 11, num: 10 }),
      performSearch(query, { start: 21, num: 10 }),
      performSearch(query, { start: 31, num: 10 }),
    ]);

    return results.flat();
  }
}
```

---

## 監視とアラート

### 1. リアルタイム監視ダッシュボード

```typescript
// サーバーサイドイベント(SSE)を使用したリアルタイム監視
import express from 'express';

const app = express();

app.get('/api/quota/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // 10秒ごとにクォータ情報を送信
  const intervalId = setInterval(async () => {
    const quotaInfo = await getQuotaInfo();

    res.write(`data: ${JSON.stringify(quotaInfo)}\n\n`);
  }, 10000);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

async function getQuotaInfo() {
  const today = new Date().toISOString().split('T')[0];

  const quotas = await db
    .collection('quotas')
    .where('date', '==', today)
    .get();

  const totalUsed = quotas.docs.reduce((sum, doc) => sum + doc.data().queriesUsed, 0);

  return {
    date: today,
    totalUsed,
    userCount: quotas.size,
    timestamp: new Date().toISOString(),
  };
}
```

### 2. Slack通知

```typescript
import { WebClient } from '@slack/web-api';

class SlackNotifier {
  private client = new WebClient(process.env.SLACK_TOKEN);
  private channel = process.env.SLACK_CHANNEL!;

  async sendQuotaAlert(message: string, severity: 'info' | 'warning' | 'critical') {
    const color = {
      info: '#36a64f',
      warning: '#ff9900',
      critical: '#ff0000',
    }[severity];

    await this.client.chat.postMessage({
      channel: this.channel,
      attachments: [
        {
          color,
          title: 'API Quota Alert',
          text: message,
          footer: 'Google Search API Monitor',
          ts: Math.floor(Date.now() / 1000).toString(),
        },
      ],
    });
  }

  async notifyHighUsage(usagePercent: number) {
    if (usagePercent >= 90) {
      await this.sendQuotaAlert(
        `⚠️ Critical: API quota at ${usagePercent}%`,
        'critical'
      );
    } else if (usagePercent >= 70) {
      await this.sendQuotaAlert(
        `⚠️ Warning: API quota at ${usagePercent}%`,
        'warning'
      );
    }
  }
}
```

### 3. メトリクス収集

```typescript
import { Registry, Counter, Gauge, Histogram } from 'prom-client';

class MetricsCollector {
  private registry = new Registry();

  private queriesTotal = new Counter({
    name: 'api_queries_total',
    help: 'Total number of API queries',
    labelNames: ['user_type', 'status'],
    registers: [this.registry],
  });

  private queriesRemaining = new Gauge({
    name: 'api_queries_remaining',
    help: 'Remaining API queries',
    labelNames: ['user_id'],
    registers: [this.registry],
  });

  private queryDuration = new Histogram({
    name: 'api_query_duration_seconds',
    help: 'API query duration in seconds',
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [this.registry],
  });

  recordQuery(userType: string, duration: number, status: 'success' | 'error') {
    this.queriesTotal.inc({ user_type: userType, status });
    this.queryDuration.observe(duration);
  }

  updateRemainingQueries(userId: string, remaining: number) {
    this.queriesRemaining.set({ user_id: userId }, remaining);
  }

  getMetrics() {
    return this.registry.metrics();
  }
}
```

---

## まとめ

### クォータ管理のチェックリスト

- ✅ **基本機能**
  - [ ] 日次クォータ追跡
  - [ ] ユーザータイプ別制限
  - [ ] クォータ超過時のエラーハンドリング

- ✅ **高度な機能**
  - [ ] サーバーサイド管理（Firestore/Redis）
  - [ ] キャッシング戦略
  - [ ] バッチ処理
  - [ ] レート制限

- ✅ **監視とアラート**
  - [ ] リアルタイム監視
  - [ ] Slack/メール通知
  - [ ] メトリクス収集
  - [ ] ダッシュボード

- ✅ **コスト最適化**
  - [ ] プログレッシブ検索
  - [ ] スケジューリング
  - [ ] クエリの統合
  - [ ] 予算アラート
