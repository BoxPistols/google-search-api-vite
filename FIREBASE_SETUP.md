# Firebase認証の設定ガイド

このガイドでは、Google認証とクォータ管理を実現するためのFirebase設定方法を説明します。

## 概要

認証システムにより、以下の3段階のアクセスレベルが実現されます：

- **未ログイン（Guest）**: 10クエリ/日
- **Googleログイン（User）**: 50クエリ/日
- **オーナー（Owner）**: 500クエリ/日（あなたのGoogleアカウント）

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：`google-search-ranking-checker`）
4. Google Analyticsは任意（オフでも可）
5. プロジェクトを作成

## 2. Webアプリの登録

1. Firebase Consoleのプロジェクト概要で「Web」アイコン（</>）をクリック
2. アプリのニックネームを入力（例：`ranking-checker-web`）
3. 「Firebase Hostingも設定する」はチェック不要
4. 「アプリを登録」をクリック
5. 表示される設定情報をコピー：

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 3. 環境変数の設定

1. プロジェクトルートに `.env` ファイルを作成
2. `.env.example` を参考に以下を設定：

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_STORAGE_BUCKET=<storageBucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
VITE_FIREBASE_APP_ID=<appId>

# Owner Email (あなたのGoogleアカウントのメールアドレス)
VITE_OWNER_EMAIL=your-email@gmail.com
```

## 4. Google認証の有効化

1. Firebase Consoleの左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「Google」を選択し、有効にする
5. プロジェクトのサポートメールを設定
6. 「保存」をクリック

## 5. Firestore Databaseの設定（オプション）

将来的にクロスデバイス同期を実装する場合：

1. Firebase Consoleの左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（asia-northeast1推奨）
4. テストモードで開始（後でセキュリティルールを設定）

## 6. セキュリティルール（Firestore使用時）

Firestoreを使用する場合、以下のセキュリティルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のクォータデータのみ読み書き可能
    match /quotas/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 検索履歴も同様
    match /search_history/{userId}/{searchId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. 認証ドメインの設定

1. Firebase Consoleの「Authentication」→「Settings」タブ
2. 「承認済みドメイン」に以下を追加：
   - `localhost`（開発用）
   - あなたのVercelドメイン（本番用、例：`your-app.vercel.app`）

## 8. Vercelへのデプロイ

Vercel環境変数の設定：

1. Vercelプロジェクトの「Settings」→「Environment Variables」
2. `.env`ファイルの内容をすべて追加
3. 本番環境、プレビュー環境、開発環境すべてにチェック

## 9. 動作確認

1. 開発サーバーを起動：`pnpm dev`
2. ブラウザで http://localhost:5173 を開く
3. 右上の「Googleでログイン」をクリック
4. Googleアカウントでログイン
5. ログイン状態を確認：
   - オーナーアカウント：「オーナー」と表示、500クエリ/日
   - 一般アカウント：「一般ユーザー」と表示、50クエリ/日
   - 未ログイン：10クエリ/日

## トラブルシューティング

### ログインできない

- Firebase Consoleで「Authentication」が有効か確認
- 認証ドメインに`localhost`が登録されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### オーナー判定されない

- `.env`の`VITE_OWNER_EMAIL`が正しいか確認
- ログインしているGoogleアカウントのメールアドレスと一致するか確認
- 環境変数を変更した後、開発サーバーを再起動

### クォータがリセットされない

- ブラウザのlocalStorageをクリア
- 日付が変わるまで待つ（0:00にリセット）

## 費用について

Firebaseの無料枠：
- **Authentication**: 月10,000アクティブユーザーまで無料
- **Firestore**:
  - 保存: 1GB無料
  - 読み取り: 5万/日無料
  - 書き込み: 2万/日無料

Google Custom Search API：
- 無料枠: 100クエリ/日/ユーザー
- 有料プラン: $5/1000クエリ（最大10,000クエリ/日）

## 次のステップ

### オプション1: LocalStorageのまま（現在の実装）
- メリット: シンプル、追加コストなし
- デメリット: デバイス間で同期されない

### オプション2: Firestoreに移行
- メリット: クロスデバイス同期、複数ユーザー管理
- デメリット: 実装の追加作業が必要

Firestore移行ガイドは `BACKEND_DESIGN.md` を参照してください。
