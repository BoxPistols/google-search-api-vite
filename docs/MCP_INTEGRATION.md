# MCP (Model Context Protocol) 統合ガイド

## 📋 目次

1. [MCPとは](#mcpとは)
2. [セットアップ手順](#セットアップ手順)
3. [利用可能なツール](#利用可能なツール)
4. [使用例](#使用例)
5. [トラブルシューティング](#トラブルシューティング)

---

## MCPとは

### Model Context Protocol

MCPは、LLM（Large Language Model）がアプリケーション、データソース、ツールと対話するための標準プロトコルです。

**主な特徴:**
- 🔌 プラグイン可能なツールシステム
- 🔄 双方向通信
- 📊 構造化データの交換
- 🛠️ 拡張可能なアーキテクチャ

**公式ドキュメント:**
- https://modelcontextprotocol.io/

---

## セットアップ手順

### 1. MCPサーバーのインストール

```bash
# MCPサーバーディレクトリに移動
cd mcp-server

# 依存関係のインストール
npm install

# または pnpm
pnpm install
```

### 2. 環境変数の設定

```bash
# .env ファイルを作成
cp .env.example .env

# 必要な環境変数を設定
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ID=your_search_engine_id
```

### 3. Claude Desktop での設定

#### macOS

```bash
# Claude Desktop の設定ファイルを編集
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### Windows

```bash
# Claude Desktop の設定ファイルを編集
code %APPDATA%\Claude\claude_desktop_config.json
```

#### 設定内容

```json
{
  "mcpServers": {
    "google-search-ranking": {
      "command": "node",
      "args": ["/path/to/google-search-api-vite/mcp-server/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your_api_key",
        "GOOGLE_SEARCH_ID": "your_search_id"
      }
    }
  }
}
```

### 4. Claude Desktopの再起動

設定ファイルを保存後、Claude Desktopを再起動してください。

---

## 利用可能なツール

### 1. search_ranking

Google検索を実行し、ランキング結果を取得します。

**パラメータ:**
```typescript
{
  query: string; // 検索キーワード
}
```

**レスポンス:**
```typescript
{
  query: string;
  totalResults: number;
  queriesUsed: number;
  remainingQuota: number;
  results: Array<{
    rank: number;
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
  }>;
}
```

**使用例:**
```
Claude: search_ranking を使って "React TypeScript" で検索してください

結果:
{
  "query": "React TypeScript",
  "totalResults": 20,
  "queriesUsed": 2,
  "remainingQuota": 98,
  "results": [
    {
      "rank": 1,
      "title": "React TypeScript Documentation",
      "link": "https://react.dev/learn/typescript",
      "snippet": "...",
      "displayLink": "react.dev"
    },
    ...
  ]
}
```

---

### 2. get_quota

現在のAPIクォータ使用状況を取得します。

**パラメータ:** なし

**レスポンス:**
```typescript
{
  date: string;
  queriesUsed: number;
  remainingQueries: number;
  totalSearches: number;
  searches: Array<{
    query: string;
    timestamp: string;
    queries: number;
    resultCount: number;
  }>;
}
```

**使用例:**
```
Claude: 今日のクォータ使用状況を教えてください

結果:
{
  "date": "2025-11-18",
  "queriesUsed": 12,
  "remainingQueries": 88,
  "totalSearches": 6,
  "searches": [...]
}
```

---

### 3. analyze_domains

検索結果のドメイン分布を分析します。

**パラメータ:**
```typescript
{
  query: string; // 分析する検索キーワード
}
```

**レスポンス:**
```typescript
{
  query: string;
  totalResults: number;
  domains: Array<{
    domain: string;
    count: number;
    percentage: string;
  }>;
}
```

**使用例:**
```
Claude: "SEO ツール" のドメイン分析をしてください

結果:
{
  "query": "SEO ツール",
  "totalResults": 20,
  "domains": [
    {
      "domain": "example.com",
      "count": 5,
      "percentage": "25.0%"
    },
    ...
  ]
}
```

---

### 4. estimate_cost

指定したクエリ数のコストを見積もります。

**パラメータ:**
```typescript
{
  queries: number; // 見積もりたいクエリ数
}
```

**レスポンス:**
```typescript
{
  totalQueries: number;
  freeQueries: number;
  paidQueries: number;
  estimatedCost: string;
  monthlyCost: string;
}
```

**使用例:**
```
Claude: 1日500クエリ使う場合のコストを教えてください

結果:
{
  "totalQueries": 500,
  "freeQueries": 100,
  "paidQueries": 400,
  "estimatedCost": "$2.00",
  "monthlyCost": "$60.00"
}
```

---

## 使用例

### 基本的な使い方

#### 例1: キーワードランキング調査

```
User: "Next.js" の検索順位を調べてください

Claude: search_ranking ツールを使用します...

結果:
トップ5のランキング:
1. Next.js by Vercel (nextjs.org)
2. Getting Started with Next.js (nextjs.org/docs)
3. Next.js Tutorial (youtube.com)
4. Next.js vs React (dev.to)
5. Next.js Examples (github.com)

合計20件の結果を取得しました。
クエリ消費: 2
残りクォータ: 98
```

#### 例2: 複数キーワードの比較

```
User: "React", "Vue", "Angular" の3つのフレームワークでそれぞれトップ3を調べてください

Claude: 3つの検索を実行します...

React:
1. React Documentation (react.dev)
2. React Tutorial (reactjs.org)
3. React GitHub (github.com/facebook/react)

Vue:
1. Vue.js Official Guide (vuejs.org)
2. Vue 3 Documentation (v3.vuejs.org)
3. Vue GitHub (github.com/vuejs/vue)

Angular:
1. Angular Official Site (angular.io)
2. Angular Documentation (angular.io/docs)
3. Angular GitHub (github.com/angular/angular)

クエリ消費: 6 (各2クエリ × 3検索)
残りクォータ: 94
```

#### 例3: ドメイン占有率の分析

```
User: "JavaScript フレームワーク" でどのドメインが強いか分析してください

Claude: analyze_domains ツールを使用します...

ドメイン分析結果:
1. developer.mozilla.org - 4件 (20%)
2. javascript.com - 3件 (15%)
3. medium.com - 3件 (15%)
4. dev.to - 2件 (10%)
5. github.com - 2件 (10%)

その他 - 6件 (30%)

MDN が最も多く表示されています。
```

---

### 高度な使い方

#### ワークフロー1: SEO競合分析

```typescript
// 1. ターゲットキーワードで検索
const results1 = await search_ranking({ query: "SEO ツール 無料" });

// 2. ドメイン分析
const domainAnalysis = await analyze_domains({ query: "SEO ツール 無料" });

// 3. 上位競合サイトを特定
const topCompetitors = domainAnalysis.domains.slice(0, 5);

// 4. レポート生成
console.log(`
競合分析レポート
================
キーワード: SEO ツール 無料
上位競合:
${topCompetitors.map(d => `- ${d.domain}: ${d.count}件 (${d.percentage})`).join('\n')}

推奨施策:
1. ${topCompetitors[0].domain} の戦略を分析
2. コンテンツの質を向上
3. 被リンク獲得戦略の見直し
`);
```

#### ワークフロー2: 定期監視

```typescript
// 毎週月曜日に実行
const keywords = [
  "Next.js チュートリアル",
  "React 入門",
  "TypeScript 基礎"
];

for (const keyword of keywords) {
  const result = await search_ranking({ query: keyword });

  // 前週との比較
  const previousRank = getPreviousRank(keyword);
  const currentRank = getCurrentRank(result, "yoursite.com");

  if (currentRank > previousRank) {
    console.log(`⬇️ ${keyword}: ${previousRank}位 → ${currentRank}位`);
  } else if (currentRank < previousRank) {
    console.log(`⬆️ ${keyword}: ${previousRank}位 → ${currentRank}位`);
  } else {
    console.log(`➡️ ${keyword}: ${currentRank}位 (変化なし)`);
  }
}
```

---

## Firestoreとの連携

### Firestore MCP Server

Firestoreと連携することで、クォータデータを永続化できます。

#### セットアップ

```json
{
  "mcpServers": {
    "firestore": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firestore"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json",
        "FIRESTORE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

#### 使用例

```typescript
// Firestoreにクォータデータを保存
async function saveQuotaToFirestore(quotaData) {
  await firestore_write({
    collection: "quotas",
    documentId: quotaData.date,
    data: quotaData
  });
}

// Firestoreからクォータデータを読み込み
async function loadQuotaFromFirestore(date) {
  const result = await firestore_read({
    collection: "quotas",
    documentId: date
  });

  return result.data;
}
```

---

## トラブルシューティング

### よくある問題

#### 1. MCPサーバーが起動しない

**症状:**
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**解決方法:**
```bash
cd mcp-server
npm install @modelcontextprotocol/sdk
```

#### 2. 環境変数が読み込まれない

**症状:**
```
Error: GOOGLE_API_KEY is not defined
```

**解決方法:**
```json
// claude_desktop_config.json で環境変数を明示的に設定
{
  "mcpServers": {
    "google-search-ranking": {
      "env": {
        "GOOGLE_API_KEY": "AIzaSy...",
        "GOOGLE_SEARCH_ID": "012345..."
      }
    }
  }
}
```

#### 3. Daily Limit Exceeded

**症状:**
```
Error: Daily Limit Exceeded. The quota will be reset at midnight Pacific Time (PT).
```

**解決方法:**
- クォータがリセットされるまで待つ（翌日0:00 UTC）
- または有料プランに移行

---

## セキュリティのベストプラクティス

### 1. APIキーの保護

```bash
# 環境変数ファイルを.gitignoreに追加
echo ".env" >> .gitignore
echo "claude_desktop_config.json" >> .gitignore
```

### 2. レート制限の実装

```typescript
class RateLimiter {
  private requests = [];
  private maxRequests = 10; // 1秒間に10リクエスト
  private timeWindow = 1000; // 1秒

  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    this.requests.push(now);
  }
}
```

### 3. クォータアラート

```typescript
// クォータが90%を超えたら通知
if (quotaUsagePercent > 90) {
  console.warn(`⚠️ Warning: Quota usage at ${quotaUsagePercent}%`);
  sendSlackNotification('Quota Alert', `Usage: ${quotaUsagePercent}%`);
}
```

---

## まとめ

### MCPの利点

- ✅ **統一されたインターフェース**: すべてのツールが同じ方法で呼び出せる
- ✅ **拡張性**: 新しいツールを簡単に追加できる
- ✅ **再利用性**: 他のプロジェクトでも使用可能
- ✅ **型安全**: TypeScriptによる型チェック

### 次のステップ

1. [ ] MCPサーバーのセットアップ
2. [ ] Claude Desktopでツールをテスト
3. [ ] 独自のツールを追加
4. [ ] Firestoreとの連携
5. [ ] 本番環境へのデプロイ
