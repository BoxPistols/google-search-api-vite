# Google Custom Search JSON API 完全ガイド

## 📋 目次

1. [API概要](#api概要)
2. [クエリ消費の仕組み](#クエリ消費の仕組み)
3. [価格体系](#価格体系)
4. [無料枠と制限](#無料枠と制限)
5. [有料プランと上限設定](#有料プランと上限設定)
6. [セットアップ手順](#セットアップ手順)
7. [クォータ管理](#クォータ管理)
8. [ベストプラクティス](#ベストプラクティス)

---

## API概要

### Google Custom Search JSON APIとは

Google Custom Search JSON API（旧称: Custom Search API）は、Googleの検索エンジンをプログラムから利用できるRESTful APIです。

**主な特徴:**
- ✅ JSON形式でレスポンス取得
- ✅ 検索結果のカスタマイズ
- ✅ フィルタリングとソート
- ✅ 画像、動画、ニュースなど多様な検索タイプ
- ✅ セーフサーチ設定
- ✅ 地域・言語指定

**公式ドキュメント:**
- API Reference: https://developers.google.com/custom-search/v1/reference/rest
- Developer Guide: https://developers.google.com/custom-search/docs/overview

---

## クエリ消費の仕組み

### 1クエリとは？

**1クエリ = 1回のAPI呼び出し**

```typescript
// これが1クエリ
fetch('https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_CX&q=keyword&start=1')
```

### クエリ消費の計算方法

#### 例1: 単一キーワード検索（上位10件）
```
キーワード: "React"
API呼び出し: 1回
消費クエリ: 1
```

#### 例2: 単一キーワード検索（上位20件）
```
キーワード: "React"
API呼び出し: 2回（1-10位、11-20位）
消費クエリ: 2
```

#### 例3: 複数キーワード検索（上位20件）
```
キーワード: "React TypeScript"
単語数: 2
1単語あたり: 2クエリ（1-10位、11-20位）
合計消費クエリ: 2 × 2 = 4
```

#### 例4: 本アプリでの検索
```typescript
// このアプリの検索仕様
const keywordCount = query.trim().split(/\s+/).length;
const queriesPerKeyword = 2; // 1-10位、11-20位
const totalQueries = keywordCount * queriesPerKeyword;

// 例: "SEO 対策 ツール" の検索
// キーワード数: 3
// 消費クエリ: 3 × 2 = 6クエリ
```

---

## 価格体系

### 無料プラン（Free Tier）

| 項目 | 制限 |
|------|------|
| **日次制限** | 100クエリ/日 |
| **料金** | $0（完全無料） |
| **上限変更** | 不可 |
| **リセット** | 毎日0:00（UTC） |
| **超過時** | 403 Forbidden エラー |

**無料プランの特徴:**
- ✅ クレジットカード不要
- ✅ アカウント作成のみで利用可能
- ✅ 開発・テスト用に最適
- ⚠️ 商用利用には制限あり

---

### 有料プラン（Paid Plan）

#### 基本料金体系

| クエリ数 | 料金 | 単価 |
|---------|------|------|
| **1〜100クエリ/日** | $0 | 無料 |
| **101〜10,000クエリ/日** | $5 per 1,000クエリ | $0.005/クエリ |
| **10,001クエリ以上/日** | カスタム価格 | 要問い合わせ |

#### 料金計算例

**例1: 1日200クエリ使用**
```
無料枠: 100クエリ = $0
有料分: 100クエリ = 100 ÷ 1,000 × $5 = $0.50
合計: $0.50/日 × 30日 = $15/月
```

**例2: 1日500クエリ使用**
```
無料枠: 100クエリ = $0
有料分: 400クエリ = 400 ÷ 1,000 × $5 = $2.00
合計: $2.00/日 × 30日 = $60/月
```

**例3: 1日1,000クエリ使用**
```
無料枠: 100クエリ = $0
有料分: 900クエリ = 900 ÷ 1,000 × $5 = $4.50
合計: $4.50/日 × 30日 = $135/月
```

**例4: 1日5,000クエリ使用**
```
無料枠: 100クエリ = $0
有料分: 4,900クエリ = 4,900 ÷ 1,000 × $5 = $24.50
合計: $24.50/日 × 30日 = $735/月
```

#### 請求サイクル

- **月次請求**: 毎月1日に前月分を請求
- **支払い方法**: クレジットカード（自動引き落とし）
- **通貨**: USD（米ドル）
- **税金**: 地域により消費税・付加価値税が加算される場合あり

---

## 無料枠と制限

### 無料プランの詳細

#### 日次制限
```
最大クエリ数: 100クエリ/日
リセット時刻: 0:00 UTC（日本時間 9:00）
カウント方法: API呼び出し回数ベース
```

#### 制限に達した場合のエラー

**HTTPステータス: 403 Forbidden**
```json
{
  "error": {
    "code": 403,
    "message": "Daily Limit Exceeded. The quota will be reset at midnight Pacific Time (PT).",
    "errors": [
      {
        "domain": "usageLimits",
        "reason": "dailyLimitExceeded",
        "message": "Daily Limit Exceeded"
      }
    ]
  }
}
```

#### 無料枠での実運用例

**1日100クエリでできること:**

1. **シンプルな検索（上位10件のみ）**
   - 100回の検索実行可能
   - 適用例: 個人ブログのSEOチェック

2. **上位20件取得の検索**
   - 50回の検索実行可能（1検索 = 2クエリ）
   - 適用例: 競合分析ツール（日50回まで）

3. **複数キーワード検索（3語 × 20件）**
   - 約16回の検索実行可能（1検索 = 6クエリ）
   - 適用例: SEO分析レポート作成

4. **本アプリでの利用想定**
   ```typescript
   // 平均的な検索（2キーワード × 20件）
   const averageQueries = 4; // クエリ/検索
   const dailySearches = 100 / 4 = 25; // 1日25回の検索可能
   ```

---

## 有料プランと上限設定

### 有料プランへの移行

#### 1. Google Cloud Platformでの設定

```bash
# ステップ1: Google Cloud Consoleにログイン
https://console.cloud.google.com/

# ステップ2: プロジェクト選択
# 既存プロジェクトまたは新規作成

# ステップ3: 請求先アカウントの設定
1. "お支払い" メニューを選択
2. 請求先アカウントを作成
3. クレジットカード情報を登録

# ステップ4: Custom Search APIの有効化
1. APIライブラリを開く
2. "Custom Search API" を検索
3. 有効化をクリック
```

#### 2. クォータの上限設定

**Google Cloud Console > APIs & Services > Quotas**

```
設定可能な上限:
- デフォルト: 10,000クエリ/日
- カスタム: 1〜100,000クエリ/日（リクエストにより調整可能）
- 最大: 無制限（Googleとの個別契約が必要）
```

#### クォータ上限のリクエスト方法

1. **Google Cloud Console でクォータページを開く**
   ```
   APIs & Services > Quotas
   ```

2. **Custom Search APIを検索**
   ```
   フィルター: "Custom Search"
   ```

3. **上限引き上げをリクエスト**
   ```
   - 目的: ビジネス利用、開発テストなど
   - 必要なクエリ数: 具体的な数値を記載
   - 利用計画: 詳細を説明
   ```

4. **審査**
   ```
   通常: 1-3営業日
   大規模: 1週間以上
   ```

---

### 上限設定のパターン

#### パターン1: 小規模ビジネス
```yaml
日次上限: 500クエリ/日
月次想定: 15,000クエリ/月
月額コスト: 約$60
用途: 中小企業のSEOツール、競合分析
```

#### パターン2: 中規模ビジネス
```yaml
日次上限: 2,000クエリ/日
月次想定: 60,000クエリ/月
月額コスト: 約$240
用途: マーケティング代理店、SEOサービス
```

#### パターン3: 大規模ビジネス
```yaml
日次上限: 10,000クエリ/日
月次想定: 300,000クエリ/月
月額コスト: 約$1,200
用途: エンタープライズSaaSプラットフォーム
```

#### パターン4: カスタムエンタープライズ
```yaml
日次上限: 50,000+クエリ/日
月次想定: 1,500,000+クエリ/月
月額コスト: カスタム価格（要交渉）
用途: 大規模検索プラットフォーム、データ分析サービス
```

---

### コスト最適化のための上限設定

#### 予算ベースの上限設定

**1日の予算を$10に設定する場合:**

```typescript
// 計算式
const freeQueries = 100;           // 無料枠
const paidBudget = 10;             // $10/日
const pricePerQuery = 0.005;       // $0.005/クエリ

const maxPaidQueries = paidBudget / pricePerQuery;
// = 10 / 0.005 = 2,000クエリ

const totalDailyLimit = freeQueries + maxPaidQueries;
// = 100 + 2,000 = 2,100クエリ/日
```

**設定方法:**
```yaml
Google Cloud Console:
  - Quotas > Custom Search API
  - Daily Limit: 2,100
  - Budget Alert: $10/日
```

---

## セットアップ手順

### 1. Google Cloud Projectの作成

```bash
# 1. Google Cloud Consoleにアクセス
https://console.cloud.google.com/

# 2. 新規プロジェクト作成
プロジェクト名: "my-search-ranking-app"
組織: 個人 or 会社
場所: 任意

# 3. プロジェクトIDをメモ
例: my-search-ranking-app-123456
```

### 2. Custom Search APIの有効化

```bash
# 1. APIライブラリを開く
https://console.cloud.google.com/apis/library

# 2. "Custom Search API" を検索

# 3. "有効にする" をクリック
```

### 3. APIキーの作成

```bash
# 1. 認証情報ページを開く
https://console.cloud.google.com/apis/credentials

# 2. "+ 認証情報を作成" をクリック

# 3. "APIキー" を選択

# 4. APIキーをコピー
例: AIzaSyD1234567890abcdefghijklmnopqrstuvw

# 5. APIキーを制限（推奨）
- アプリケーションの制限: HTTPリファラー
- 許可するリファラー: https://yourdomain.com/*
- API制限: Custom Search APIのみ
```

### 4. Programmable Search Engineの作成

```bash
# 1. Programmable Search Engineにアクセス
https://programmablesearchengine.google.com/

# 2. "追加" をクリック

# 3. 検索エンジンを設定
検索対象: ウェブ全体を検索
検索エンジン名: "My Search Engine"
言語: 日本語

# 4. 作成して、検索エンジンIDをコピー
例: 0123456789abcdefg:hijklmnop
```

### 5. 環境変数の設定

```bash
# .env ファイルに追加
VITE_GOOGLE_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvw
VITE_GOOGLE_SEARCH_ID=0123456789abcdefg:hijklmnop
```

---

## クォータ管理

### クォータの監視

#### Google Cloud Consoleでの確認

```bash
# 1. Quotasページを開く
https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas

# 2. 使用状況を確認
- Current Usage: 現在の使用量
- Quota Limit: 上限
- Usage %: 使用率
```

#### APIレスポンスヘッダーでの確認

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1640995200
```

### アラート設定

#### 予算アラートの設定

```yaml
Google Cloud Console > 請求 > 予算とアラート:
  予算名: "Custom Search API Budget"
  予算額: $100/月
  アラート閾値:
    - 50%使用時: メール通知
    - 90%使用時: メール通知 + Slack通知
    - 100%使用時: API自動停止
```

#### Pub/Subを使用したリアルタイム監視

```typescript
// Cloud Pub/Sub トピックの購読
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();
const subscription = pubsub.subscription('quota-alerts');

subscription.on('message', (message) => {
  const alert = JSON.parse(message.data.toString());

  if (alert.quotaUsagePercent > 90) {
    // Slack通知
    sendSlackNotification(`⚠️ API Quota Alert: ${alert.quotaUsagePercent}% used`);
  }

  message.ack();
});
```

---

## ベストプラクティス

### 1. クエリの最適化

#### キャッシュの活用

```typescript
// 同じ検索を繰り返さない
const searchCache = new Map<string, SearchResult[]>();

async function searchWithCache(query: string) {
  const cacheKey = `${query}-${new Date().toDateString()}`;

  if (searchCache.has(cacheKey)) {
    console.log('Cache hit!');
    return searchCache.get(cacheKey);
  }

  const results = await performSearch(query);
  searchCache.set(cacheKey, results);

  return results;
}
```

#### バッチ処理

```typescript
// 複数検索をバッチで処理
async function batchSearch(queries: string[]) {
  const results = [];

  // レート制限を守る
  for (let i = 0; i < queries.length; i++) {
    results.push(await performSearch(queries[i]));

    // 100ms待機（1秒間に10クエリまで）
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

### 2. エラーハンドリング

```typescript
async function performSearchWithRetry(query: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await performSearch(query);
    } catch (error) {
      if (error.status === 403) {
        // クォータ超過
        throw new Error('Daily quota exceeded. Please try again tomorrow.');
      } else if (error.status === 429) {
        // レート制限
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 3. コスト管理

#### 日次予算の実装

```typescript
class QuotaManager {
  private dailyBudget = 100; // $100/日
  private pricePerQuery = 0.005;
  private maxQueries = this.dailyBudget / this.pricePerQuery; // 20,000クエリ

  canExecuteQuery(estimatedQueries: number): boolean {
    const used = this.getUsedQueries();
    return used + estimatedQueries <= this.maxQueries;
  }

  estimateCost(queries: number): number {
    const freeQueries = 100;
    const paidQueries = Math.max(0, queries - freeQueries);
    return paidQueries * this.pricePerQuery;
  }
}
```

### 4. ユーザー別クォータ

```typescript
// ユーザータイプ別の制限
const QUOTA_LIMITS = {
  guest: 10,      // 未ログイン: 10クエリ/日
  user: 50,       // 一般ユーザー: 50クエリ/日
  premium: 200,   // プレミアム: 200クエリ/日
  enterprise: -1, // 無制限
};

function getUserQuota(userType: UserType): number {
  return QUOTA_LIMITS[userType];
}
```

---

## トラブルシューティング

### よくあるエラーと対処法

#### 1. Daily Limit Exceeded (403)

**原因**: 1日のクォータ（100クエリ）を超過

**対処法**:
```typescript
// 翌日まで待つ、または有料プランに移行
if (error.status === 403 && error.message.includes('Daily Limit')) {
  const resetTime = new Date();
  resetTime.setUTCHours(24, 0, 0, 0);

  console.log(`Quota will reset at: ${resetTime.toLocaleString()}`);
}
```

#### 2. Rate Limit Exceeded (429)

**原因**: 1秒間のリクエスト数超過

**対処法**:
```typescript
// リトライとバックオフ
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function searchWithRateLimit(query: string) {
  try {
    return await performSearch(query);
  } catch (error) {
    if (error.status === 429) {
      await wait(1000); // 1秒待機
      return await performSearch(query);
    }
    throw error;
  }
}
```

---

## まとめ

### コスト試算ツール

```typescript
class CostCalculator {
  calculateMonthlyCost(dailyQueries: number): number {
    const freeQueries = 100;
    const paidQueries = Math.max(0, dailyQueries - freeQueries);
    const dailyCost = paidQueries * 0.005;
    return dailyCost * 30;
  }

  printCostTable() {
    console.log('Daily Queries | Monthly Cost');
    console.log('-------------|-------------');
    [100, 200, 500, 1000, 2000, 5000, 10000].forEach(queries => {
      const cost = this.calculateMonthlyCost(queries);
      console.log(`${queries.toString().padEnd(12)} | $${cost.toFixed(2)}`);
    });
  }
}

// 出力:
// Daily Queries | Monthly Cost
// -------------|-------------
// 100          | $0.00
// 200          | $15.00
// 500          | $60.00
// 1000         | $135.00
// 2000         | $285.00
// 5000         | $735.00
// 10000        | $1,485.00
```

### 推奨構成

| ユースケース | 日次クエリ | 月額コスト | 推奨プラン |
|------------|----------|----------|----------|
| **個人開発** | 100 | $0 | 無料プラン |
| **小規模ツール** | 500 | $60 | 有料プラン（基本） |
| **中規模SaaS** | 2,000 | $285 | 有料プラン（標準） |
| **大規模サービス** | 10,000+ | $1,485+ | エンタープライズ |
