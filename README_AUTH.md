# Google Search Ranking Checker - 認証機能ガイド

## 新機能

### 1. クエリ消費量の明確な表示

検索フォームで以下が表示されるようになりました：

- **キーワード数のカウント**: 入力したキーワードの数をリアルタイムで表示
- **消費クエリ数の計算**: 検索実行前に消費するクエリ数を表示（2ページ分 × キーワード数）
- **残りクエリ数**: 現在の残りクエリ数を表示
- **検索ボタンの状態**: クォータ不足の場合は「クォータ不足」と表示され、ボタンが無効化
- **警告メッセージ**: 残りクエリが少ない場合に警告を表示

**例：**
- 入力: `React Next.js TypeScript`（3キーワード）
- 消費クエリ: `6クエリ`（2ページ × 3キーワード）
- ボタン表示: `検索 (-6)`

### 2. Google認証による3段階アクセス制限

ログイン状態に応じて、異なるクエリ制限が適用されます：

| ユーザータイプ | 制限 | 説明 |
|--------------|------|------|
| **未ログイン（Guest）** | 10クエリ/日 | オープンソースユーザー向け |
| **Googleログイン（User）** | 50クエリ/日 | 認証済みユーザー |
| **オーナー（Owner）** | 500クエリ/日 | アプリ所有者（あなた） |

### 3. オーナー判定

環境変数 `VITE_OWNER_EMAIL` に設定されたメールアドレスでログインすると、自動的にオーナーとして認識されます。

## セットアップ

### 必要な環境変数

`.env`ファイルに以下を追加：

```bash
# Google Custom Search API（既存）
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_SEARCH_ID=your_search_engine_id

# Firebase Configuration（新規）
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Owner Email（新規）
VITE_OWNER_EMAIL=your-email@gmail.com
```

### Firebase設定

詳細な設定手順は `FIREBASE_SETUP.md` を参照してください。

## 使い方

### 未ログインユーザー（10クエリ/日）

1. アプリにアクセス
2. そのまま検索を実行
3. 10クエリまで利用可能

### ログインユーザー（50クエリ/日）

1. 右上の「Googleでログイン」をクリック
2. Googleアカウントでログイン
3. 50クエリまで利用可能

### オーナー（500クエリ/日）

1. `VITE_OWNER_EMAIL` に設定したGoogleアカウントでログイン
2. ユーザー名の下に「オーナー」と表示される
3. 500クエリまで利用可能

## 技術詳細

### アーキテクチャ

```
┌─────────────────┐
│  Firebase Auth  │ ← Google認証
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AuthContext    │ ← ユーザー状態管理
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ userSettings.ts │ ← クォータ制限取得
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ localStorage    │ ← クエリ使用量保存
└─────────────────┘
```

### ファイル構成

```
src/
├── services/
│   └── firebase.ts          # Firebase初期化
├── contexts/
│   └── AuthContext.tsx      # 認証コンテキスト
├── components/
│   ├── AuthButton.tsx       # ログインボタン
│   ├── SearchForm.tsx       # 改善された検索フォーム
│   └── QuotaDisplay.tsx     # クォータ表示
├── utils/
│   ├── userSettings.ts      # ユーザータイプ管理
│   └── apiQuotaManager.ts   # クォータ管理
└── types/
    └── user.ts              # ユーザー型定義
```

### クォータ管理の仕組み

1. **ユーザータイプの判定**:
   - AuthContextでログイン状態を監視
   - オーナーメールと照合してユーザータイプを決定

2. **クォータ制限の適用**:
   - `QUOTA_LIMITS`でユーザータイプ別の制限を定義
   - `getDailyQuotaLimit()`で現在の制限を取得

3. **使用量の記録**:
   - localStorageに日次でクエリ使用量を保存
   - 日付が変わると自動的にリセット

## よくある質問

### Q: 未ログインでも使えますか？

はい、10クエリ/日まで使用できます。

### Q: 複数のブラウザで同じアカウントを使えますか？

現在はlocalStorageベースのため、ブラウザ間で同期されません。Firestoreに移行すると可能になります（`BACKEND_DESIGN.md`参照）。

### Q: オーナーアカウントを複数設定できますか？

現在は1つのメールアドレスのみ対応しています。複数設定する場合は、カンマ区切りで設定し、コードを修正してください。

### Q: クォータはいつリセットされますか？

毎日0:00（ローカル時刻）にリセットされます。

### Q: Firebaseの費用は？

Firebase Authenticationは月10,000アクティブユーザーまで無料です。詳細は `FIREBASE_SETUP.md` を参照してください。

## トラブルシューティング

### ログインできない

1. Firebase Consoleで認証が有効か確認
2. ブラウザのコンソールでエラーを確認
3. `.env`ファイルの設定を確認

### オーナーとして認識されない

1. `.env`の`VITE_OWNER_EMAIL`を確認
2. ログインしているアカウントのメールアドレスを確認
3. 開発サーバーを再起動

### クエリが消費されない

1. ブラウザのlocalStorageを確認
2. ブラウザのコンソールでエラーを確認

## 次のステップ

### Firestoreへの移行（推奨）

クロスデバイス同期を実現するには、localStorageからFirestoreに移行してください。

詳細は `BACKEND_DESIGN.md` を参照してください。

メリット：
- デバイス間でクエリ使用量を同期
- 複数ユーザーの使用状況を一元管理
- リアルタイムで使用量を更新

## ライセンス

このプロジェクトはオープンソースです。自由に使用・改変してください。
