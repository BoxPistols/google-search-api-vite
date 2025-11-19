# 👨‍💻 開発者ガイド - Google Search Ranking Checker

このガイドは、**開発者**向けのセットアップと開発手順を説明します。

## 📖 目次

1. [クイックスタート](#クイックスタート)
2. [環境セットアップ](#環境セットアップ)
3. [開発ワークフロー](#開発ワークフロー)
4. [デプロイ](#デプロイ)
5. [トラブルシューティング](#トラブルシューティング)

---

## クイックスタート

### 最速セットアップ（5分）

```bash
# 1. クローン
git clone https://github.com/BoxPistols/google-search-api-vite.git
cd google-search-api-vite

# 2. インストール
pnpm install

# 3. 環境変数（最小構成）
cp .env.example .env
# .envを編集してGoogle APIキーを設定

# 4. 起動
pnpm dev
```

http://localhost:5173 を開く

### 必要な環境変数（最小）

```bash
# .env
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_SEARCH_ID=your_search_engine_id_here
```

**これだけで動作します！** Firebase認証は後から追加できます。

---

## 環境セットアップ

### 必要な環境

| 項目 | バージョン | チェック方法 |
|-----|-----------|------------|
| Node.js | 18.x以上 | `node -v` |
| pnpm | 8.x以上 | `pnpm -v` |
| Git | 最新 | `git --version` |

#### pnpmのインストール

```bash
npm install -g pnpm
```

### Google Custom Search API設定

#### ステップ1: Google Cloud プロジェクト作成

1. https://console.cloud.google.com/ にアクセス
2. 「プロジェクトを作成」
3. プロジェクト名を入力（例: `seo-ranking-checker`）

#### ステップ2: Custom Search API有効化

```
Google Cloud Console
→ APIとサービス
→ ライブラリ
→ 「Custom Search API」を検索
→ 有効にする
```

#### ステップ3: APIキー取得

```
→ APIとサービス
→ 認証情報
→ 「認証情報を作成」
→ APIキー
→ コピー
```

**セキュリティ**:
```
APIキー → 編集
→ アプリケーションの制限: HTTPリファラー
→ ウェブサイトの制限:
  - http://localhost:5173/*
  - https://your-app.vercel.app/*
```

#### ステップ4: 検索エンジンID取得

1. https://programmablesearchengine.google.com/ にアクセス
2. 「新しい検索エンジン」
3. 設定:
   ```
   検索するサイト: ウェブ全体を検索
   検索エンジンの名前: SEO Ranking Checker
   ```
4. 「作成」→ 検索エンジンIDをコピー

#### ステップ5: .envに設定

```bash
echo "VITE_GOOGLE_API_KEY=your_api_key_here" >> .env
echo "VITE_GOOGLE_SEARCH_ID=your_search_id_here" >> .env
```

### Firebase設定（オプション）

認証機能を追加する場合のみ必要です。

#### クイックセットアップ

```bash
# 1. Firebaseプロジェクト作成
# https://console.firebase.google.com/

# 2. Authentication有効化
# Firebase Console → Authentication → 始める → Google有効化

# 3. Webアプリ追加
# プロジェクト設定 → アプリを追加 → Web

# 4. 設定を.envに追加
cat << EOF >> .env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OWNER_EMAIL=your-email@gmail.com
EOF
```

詳細: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

## 開発ワークフロー

### 開発コマンド

```bash
# 開発サーバー起動（ホットリロード）
pnpm dev

# ビルド
pnpm build

# ビルドのプレビュー
pnpm preview

# Lint（エラーチェック）
pnpm lint

# フォーマット（自動修正）
pnpm fix
```

### プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── AuthButton.tsx   # 認証ボタン
│   ├── SearchForm.tsx   # 検索フォーム（クエリ計算付き）
│   ├── QuotaDisplay.tsx # クォータ表示（警告付き）
│   └── ...
├── contexts/            # React Context
│   └── AuthContext.tsx  # 認証状態管理
├── services/            # 外部サービス
│   └── firebase.ts      # Firebase初期化
├── utils/               # ユーティリティ
│   ├── apiQuotaManager.ts  # クォータ管理ロジック
│   └── userSettings.ts     # ユーザー設定
├── types/               # TypeScript型定義
│   ├── user.ts          # ユーザー型（Guest/User/Owner）
│   └── search.ts        # 検索結果型
└── App.tsx              # メインアプリ
```

### 主要なコンポーネント

#### SearchForm.tsx - クエリ計算

```typescript
// リアルタイムでクエリ消費量を計算
const estimatedQueries = useMemo(() => {
  if (!query.trim()) return 0;
  const keywordCount = query.trim().split(/\s+/).length;
  return 2 * keywordCount; // 2ページ × キーワード数
}, [query]);
```

#### QuotaDisplay.tsx - クォータ管理

```typescript
// ユーザータイプに応じた制限を取得
const quotaLimit = getQuotaLimit(); // Guest: 10, User: 50, Owner: 500

// 警告の閾値
const isLowQuota = remaining < quotaLimit * 0.1;    // 10%未満
const isCriticalQuota = remaining < quotaLimit * 0.05; // 5%未満
```

#### AuthContext.tsx - 認証管理

```typescript
// オーナー判定
const determineUserType = (firebaseUser: User | null): UserType => {
  if (!firebaseUser) return 'guest';
  if (firebaseUser.email === OWNER_EMAIL) return 'owner';
  return 'user';
};
```

### 開発のヒント

#### デバッグ

```typescript
// ブラウザのコンソールで確認
localStorage.getItem('google_api_quota')    // クォータ状態
localStorage.getItem('darkMode')            // ダークモード設定
```

#### ホットリロード

Viteは自動的にホットリロードしますが、以下の場合は手動リロードが必要：
- `.env`ファイルの変更 → 開発サーバーを再起動
- `public/`ディレクトリのファイル変更

#### TypeScript

```bash
# 型チェックのみ（ビルドなし）
pnpm tsc --noEmit

# 監視モード
pnpm tsc --noEmit --watch
```

---

## デプロイ

### Vercelへのデプロイ（推奨）

#### 初回セットアップ

```bash
# Vercel CLIインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel
```

対話形式で設定されます：
```
? Set up and deploy "~/google-search-api-vite"? [Y/n] y
? Which scope? Your Account
? Link to existing project? [y/N] n
? What's your project's name? google-search-api
? In which directory is your code located? ./
```

#### 環境変数の設定

```bash
# Vercel CLIで設定
vercel env add VITE_GOOGLE_API_KEY
vercel env add VITE_GOOGLE_SEARCH_ID
vercel env add VITE_FIREBASE_API_KEY
# ... 他の環境変数も同様に
```

または、Vercelダッシュボード：
```
プロジェクト → Settings → Environment Variables
→ すべての環境変数を追加
→ Production, Preview, Development にチェック
```

#### 再デプロイ

```bash
# 本番環境
vercel --prod

# プレビュー環境
vercel
```

### 他のプラットフォーム

#### Netlify

```bash
# Netlify CLIインストール
npm i -g netlify-cli

# ログイン
netlify login

# デプロイ
netlify deploy --prod
```

#### GitHub Pages

```bash
# ビルド
pnpm build

# distディレクトリをデプロイ
# 詳細: https://vitejs.dev/guide/static-deploy.html
```

---

## トラブルシューティング

### ビルドエラー

#### TypeScriptエラー

```bash
# 型チェック
pnpm tsc --noEmit

# よくあるエラー
# → .envファイルの型定義を確認
# → src/vite-env.d.tsを確認
```

#### 依存関係エラー

```bash
# クリーンインストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### キャッシュエラー

```bash
# Viteキャッシュをクリア
rm -rf node_modules/.vite
pnpm dev
```

### 開発サーバーエラー

#### ポート競合

```bash
# ポートを変更
pnpm dev --port 3000
```

#### HMR（ホットリロード）が動作しない

```bash
# 開発サーバーを再起動
Ctrl+C
pnpm dev
```

### Firebase関連

#### 初期化エラー

```
❌ Firebase initialization failed
```

**解決方法**:
1. `.env`の全Firebase変数を確認
2. Firebase Consoleで設定値を確認
3. 開発サーバーを再起動

#### 認証エラー

```
Error: Firebase: Error (auth/unauthorized-domain)
```

**解決方法**:
```
Firebase Console
→ Authentication
→ Settings
→ 承認済みドメイン
→ localhost を追加
```

### API関連

#### 検索結果が0件

```
Error: API returned empty results
```

**チェックリスト**:
- [ ] APIキーは正しいか
- [ ] Search IDは正しいか
- [ ] Custom Search APIは有効か
- [ ] 検索エンジンは「ウェブ全体」に設定されているか
- [ ] Google側のクォータ（100クエリ/日）を確認

#### CORSエラー

```
Access to fetch at '...' from origin '...' has been blocked by CORS
```

**解決方法**:
- 開発環境では発生しないはず
- 本番環境: ドメインをAPIキーの制限に追加

---

## テスト

### 手動テスト

[TEST_CHECKLIST.md](./TEST_CHECKLIST.md) を参照

### テスト項目（クイック版）

```bash
# 1. Firebase未設定でテスト
# .envからFirebase変数をコメントアウト
pnpm dev
# → ゲストユーザーとして動作するか確認

# 2. Firebase設定後のテスト
# .envにFirebase変数を追加
pnpm dev
# → ログイン機能が動作するか確認

# 3. ビルドテスト
pnpm build
pnpm preview
# → 本番ビルドが正常か確認
```

---

## パフォーマンス最適化

### バンドルサイズの確認

```bash
pnpm build
# → dist/assets/index-*.jsのサイズを確認

# 大きすぎる場合（>500KB）:
# → コード分割を検討
# → 未使用のライブラリを削除
```

### 最適化のヒント

1. **動的インポート**
   ```typescript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

2. **Material-UI最適化**
   ```typescript
   // ❌ 全体インポート
   import { Button } from '@mui/material';

   // ✅ 個別インポート
   import Button from '@mui/material/Button';
   ```

3. **画像最適化**
   ```
   public/images/ → WebP形式を使用
   ```

---

## 貢献ガイド

### ブランチ戦略

```
main          # 本番環境
├── develop   # 開発環境
└── feature/* # 機能ブランチ
```

### プルリクエスト

1. Forkして新しいブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. 変更をコミット
   ```bash
   git commit -m 'Add amazing feature'
   ```

3. プッシュ
   ```bash
   git push origin feature/amazing-feature
   ```

4. プルリクエストを作成

### コーディング規約

- **TypeScript**: 厳密な型チェック
- **Prettier**: 自動フォーマット（`pnpm fix`）
- **ESLint**: Lintルールに従う

---

## リソース

### ドキュメント

| ファイル | 内容 |
|---------|------|
| [README.md](./README.md) | 総合ガイド |
| [USER_GUIDE.md](./USER_GUIDE.md) | ユーザー向けガイド |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firebase詳細設定 |
| [BACKEND_DESIGN.md](./BACKEND_DESIGN.md) | バックエンド設計 |
| [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) | テストチェックリスト |

### 公式ドキュメント

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Firebase](https://firebase.google.com/docs)
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)

---

<p align="center">
  <b>Happy Coding! 💻</b>
</p>
