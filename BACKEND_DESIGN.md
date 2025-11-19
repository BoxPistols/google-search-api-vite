# バックエンドAPI設計書

## 概要
クロスデバイスでのクエリ追跡と、個人利用/ユーザー利用でのAPI制限分配を実現するためのバックエンドAPI設計

## 要件

### 1. クロスデバイスでのクエリ追跡
- 複数のブラウザ/デバイス間でクエリ使用量を同期
- リアルタイムまたは準リアルタイムでの使用状況の取得

### 2. ユーザータイプ別のAPI制限管理
- **個人利用（オーナー）**: 制限なし、または高い上限（例：500クエリ/日）
- **一般ユーザー**: 制限あり（例：50クエリ/日）
- ユーザーごとの使用量追跡

## 推奨技術スタック

### オプション1: Vercel + Supabase (推奨)
- **フロントエンド**: Vercel（現在のホスティング環境）
- **バックエンド**: Vercel Serverless Functions
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth

**メリット**:
- Vercelとのシームレスな統合
- 無料枠が充実
- リアルタイム機能
- TypeScript対応

### オプション2: Firebase
- **バックエンド**: Firebase Functions
- **データベース**: Firestore
- **認証**: Firebase Auth

**メリット**:
- オールインワンソリューション
- リアルタイムデータベース
- 簡単な認証

### オプション3: 独自バックエンド (Node.js + Express)
- **フレームワーク**: Express.js / Fastify
- **データベース**: PostgreSQL / MongoDB
- **認証**: JWT + bcrypt

## データベーススキーマ

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('owner', 'user')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- クォータテーブル（日次）
CREATE TABLE daily_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  queries_used INTEGER DEFAULT 0,
  quota_limit INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 検索履歴テーブル
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  queries_consumed INTEGER NOT NULL,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_daily_quotas_user_date ON daily_quotas(user_id, date);
CREATE INDEX idx_search_history_user ON search_history(user_id);
```

## API エンドポイント

### 認証
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### クォータ管理
```
GET  /api/quota/current       - 現在のクォータ状況を取得
POST /api/quota/record        - クエリ使用を記録
GET  /api/quota/reset-time    - リセットまでの時間を取得
```

### 検索履歴
```
GET  /api/history             - 検索履歴を取得
POST /api/history             - 検索履歴を保存
DELETE /api/history           - 検索履歴をクリア
```

## フロントエンド変更点

### 1. 認証機能の追加
- ログイン/サインアップUI
- セッション管理
- 認証トークンの保存

### 2. API統合
- localStorageからバックエンドAPIへの移行
- リアルタイムクォータ更新

### 3. ユーザータイプ表示
- 現在のユーザータイプの表示
- クォータ制限の明示

## 実装ステップ

### Phase 1: バックエンドセットアップ
1. Supabaseプロジェクトの作成
2. データベーススキーマの作成
3. 認証の設定

### Phase 2: API実装
1. Vercel Serverless Functionsの作成
2. データベース接続の設定
3. クォータ管理APIの実装
4. 検索履歴APIの実装

### Phase 3: フロントエンド統合
1. 認証UIの実装
2. API呼び出しの統合
3. リアルタイム更新の実装
4. エラーハンドリング

### Phase 4: テストとデプロイ
1. 単体テスト
2. 統合テスト
3. 本番環境へのデプロイ

## セキュリティ考慮事項

1. **APIキーの保護**:
   - フロントエンドからAPIキーを削除
   - バックエンドで管理

2. **認証**:
   - JWTトークンの使用
   - HTTPSの強制

3. **レート制限**:
   - APIエンドポイントへのレート制限
   - DDoS対策

4. **データ検証**:
   - 入力値のサニタイゼーション
   - SQLインジェクション対策

## 簡易版（バックエンドなし）

バックエンドの実装が難しい場合の代替案：

### 1. ユーザータイプのローカル管理
```typescript
// ユーザータイプを設定するUI
type UserType = 'owner' | 'user';
const userType = localStorage.getItem('userType') || 'user';

// クォータ制限
const QUOTA_LIMITS = {
  owner: 500,
  user: 50,
};
```

### 2. ブラウザストレージ同期
- Chrome Storage Sync API（Chrome拡張機能が必要）
- または、手動でのエクスポート/インポート機能

### 制限事項
- クロスデバイス同期は不可
- 異なるブラウザ間での同期は不可
- データの永続性が保証されない

## 推奨アプローチ

完全な機能を実現するには、**Vercel + Supabase** の組み合わせを推奨します。

次のステップとして、以下のいずれかを選択してください：

1. **完全実装**: バックエンドAPIの実装を開始
2. **簡易実装**: ローカルストレージベースのユーザータイプ管理のみ実装
3. **段階的実装**: まず簡易版を実装し、後でバックエンドに移行
