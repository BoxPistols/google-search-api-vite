# 📚 Documentation Index

Google Search Ranking Checker の包括的なドキュメント集です。

## 🎯 クイックスタート

| ドキュメント | 説明 | 対象者 |
|----------|------|--------|
| [GOOGLE_API_GUIDE.md](./GOOGLE_API_GUIDE.md) | Google Custom Search API の完全ガイド | すべて |
| [QUOTA_MANAGEMENT.md](./QUOTA_MANAGEMENT.md) | クォータ管理のベストプラクティス | 開発者・運用担当者 |
| [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) | MCP統合ガイド | 開発者 |

---

## 📖 ドキュメント詳細

### 1. Google API Guide

**[GOOGLE_API_GUIDE.md](./GOOGLE_API_GUIDE.md)**

Google Custom Search JSON APIの完全マニュアル。

**内容:**
- ✅ API概要と基本概念
- ✅ クエリ消費の仕組み（計算式・例）
- ✅ 価格体系（無料・有料プラン）
- ✅ 無料枠と制限（100クエリ/日）
- ✅ 有料プランの設定方法
- ✅ セットアップ手順（詳細）
- ✅ クォータ管理
- ✅ ベストプラクティス
- ✅ トラブルシューティング

**こんな時に読む:**
- APIの基本を理解したい
- 価格を知りたい
- 有料プランへの移行を検討している
- クエリ数の計算方法を知りたい

**重要ポイント:**
```
無料プラン: 100クエリ/日（完全無料）
有料プラン: $5 per 1,000クエリ（100クエリ超過分）

例: 1日500クエリ使用
= 無料100 + 有料400
= $0 + $2.00
= $2.00/日 × 30日 = $60/月
```

---

### 2. Quota Management

**[QUOTA_MANAGEMENT.md](./QUOTA_MANAGEMENT.md)**

クォータ管理の実践的ガイド。

**内容:**
- ✅ 実装済みの管理機能
- ✅ Firestore/Redisを使った高度な管理
- ✅ マルチユーザー対応
- ✅ サブスクリプションプラン設計
- ✅ コスト最適化戦略
- ✅ キャッシング戦略
- ✅ バッチ処理
- ✅ 監視とアラート
- ✅ Slack/メール通知

**こんな時に読む:**
- クォータを効率的に管理したい
- コストを最適化したい
- アラート機能を実装したい
- マルチユーザー対応したい

**実装例:**
```typescript
// Firestoreでのクォータ管理
class FirestoreQuotaManager {
  async recordQueryUsage(userId, query, queries) {
    const today = new Date().toISOString().split('T')[0];
    const quotaRef = doc(db, 'quotas', `${userId}_${today}`);

    await setDoc(quotaRef, {
      userId,
      date: today,
      queriesUsed: increment(queries),
      searches: arrayUnion({ query, timestamp, queries }),
    }, { merge: true });
  }
}
```

---

### 3. MCP Integration

**[MCP_INTEGRATION.md](./MCP_INTEGRATION.md)**

Model Context Protocol（MCP）統合ガイド。

**内容:**
- ✅ MCPとは
- ✅ セットアップ手順
- ✅ 利用可能なツール
  - search_ranking
  - get_quota
  - analyze_domains
  - estimate_cost
- ✅ 使用例
- ✅ Firestoreとの連携
- ✅ トラブルシューティング
- ✅ セキュリティのベストプラクティス

**こんな時に読む:**
- Claude Desktopでツールを使いたい
- MCPサーバーをセットアップしたい
- カスタムツールを追加したい

**セットアップ:**
```bash
# 1. MCPサーバーのインストール
cd mcp-server
npm install

# 2. Claude Desktop 設定
code ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 3. 設定内容
{
  "mcpServers": {
    "google-search-ranking": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your_key",
        "GOOGLE_SEARCH_ID": "your_id"
      }
    }
  }
}
```

---

## 🛠️ SKILLS

### SEO Analysis Skill

**[.claude/skills/seo-analysis.md](../.claude/skills/seo-analysis.md)**

包括的なSEO分析を実行するスキル。

**使用方法:**
```bash
# 基本的な使い方
/seo-analysis "React TypeScript"

# 詳細分析
/seo-analysis "SEO tools" --depth=detailed --export=pdf
```

**機能:**
- 検索実行とランキング取得
- ドメイン分析
- タイトル/スニペット分析
- レポート生成
- PDF/Excel/JSONエクスポート

---

### Quota Monitor Skill

**[.claude/skills/quota-monitor.md](../.claude/skills/quota-monitor.md)**

クォータの監視と管理を行うスキル。

**使用方法:**
```bash
# 現在のクォータ確認
/quota-status

# コスト見積もり
/quota-estimate --queries=500

# アラート設定
/quota-alert --threshold=90
```

**機能:**
- リアルタイム監視
- 使用履歴
- コスト見積もり
- アラート設定
- Slack/メール通知

---

## 🔧 MCP Server

### ファイル構成

```
mcp-server/
├── index.js           # MCPサーバー本体
├── package.json       # 依存関係
└── README.md          # サーバー固有のドキュメント
```

### 利用可能なツール

| ツール | 説明 | クエリ消費 |
|-------|------|----------|
| `search_ranking` | 検索順位取得 | 2 |
| `get_quota` | クォータ状況確認 | 0 |
| `analyze_domains` | ドメイン分析 | 2 |
| `estimate_cost` | コスト見積もり | 0 |

---

## 💰 価格早見表

### 日次クエリ別の月額コスト

| 日次クエリ | 無料枠 | 有料分 | 日額 | 月額 |
|----------|-------|-------|------|------|
| 100 | 100 | 0 | $0.00 | $0.00 |
| 200 | 100 | 100 | $0.50 | $15.00 |
| 500 | 100 | 400 | $2.00 | $60.00 |
| 1,000 | 100 | 900 | $4.50 | $135.00 |
| 2,000 | 100 | 1,900 | $9.50 | $285.00 |
| 5,000 | 100 | 4,900 | $24.50 | $735.00 |
| 10,000 | 100 | 9,900 | $49.50 | $1,485.00 |

### ユースケース別推奨プラン

| ユースケース | 日次クエリ | 月額 | プラン |
|------------|----------|------|--------|
| 個人開発・テスト | 100 | $0 | 無料 |
| 小規模ツール | 200-500 | $15-60 | ベーシック |
| 中規模SaaS | 1,000-2,000 | $135-285 | プロフェッショナル |
| 大規模サービス | 5,000+ | $735+ | エンタープライズ |

---

## 📊 クエリ消費の計算

### 本アプリでの計算式

```typescript
// 計算式
const keywordCount = query.trim().split(/\s+/).length;
const pagesPerKeyword = 2; // 1-10位、11-20位
const totalQueries = keywordCount * pagesPerKeyword;

// 例
"React" → 1キーワード × 2ページ = 2クエリ
"React TypeScript" → 2キーワード × 2ページ = 4クエリ
"Next.js SSR tutorial" → 3キーワード × 2ページ = 6クエリ
```

### クエリ節約のヒント

1. **キャッシングを活用**
   - 同じ検索を繰り返さない
   - 1日1回のバッチ処理

2. **プログレッシブ検索**
   - 必要に応じて10件→20件と段階的に

3. **バッチ処理**
   - トラフィックの少ない時間帯に実行

4. **ユーザー別クォータ**
   - guest: 10クエリ/日
   - user: 50クエリ/日
   - premium: 200クエリ/日

---

## 🔐 セキュリティ

### APIキーの保護

```bash
# .env.example をコピー
cp .env.example .env

# .gitignore に追加
echo ".env" >> .gitignore
echo "claude_desktop_config.json" >> .gitignore
```

### レート制限

```typescript
// 1秒間に10リクエストまで
class RateLimiter {
  private requests = [];
  private maxRequests = 10;
  private timeWindow = 1000;

  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    this.requests.push(now);
  }
}
```

---

## 🆘 トラブルシューティング

### よくある問題

1. **Daily Limit Exceeded (403)**
   - 原因: 1日100クエリ超過
   - 対処: 翌日まで待つ、または有料プラン移行

2. **Rate Limit Exceeded (429)**
   - 原因: 1秒間のリクエスト数超過
   - 対処: リトライとバックオフ実装

3. **Invalid API Key (400)**
   - 原因: APIキーが無効
   - 対処: Google Cloud Consoleで確認

4. **MCP Server Not Starting**
   - 原因: 依存関係未インストール
   - 対処: `npm install` 実行

---

## 📚 関連リソース

### 公式ドキュメント

- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Programmable Search Engine](https://programmablesearchengine.google.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### コミュニティ

- [Stack Overflow - Google Custom Search](https://stackoverflow.com/questions/tagged/google-custom-search)
- [Google Groups](https://groups.google.com/g/google-custom-search)

---

## 📝 ライセンス

MIT License

---

## 👥 貢献

Issue や Pull Request を歓迎します！

---

**最終更新**: 2025-11-18
