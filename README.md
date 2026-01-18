# GIZ LINE Bot お問い合わせフォーム (LINEミニアプリ)

LINE ミニアプリとして動作するお問い合わせフォームです。

## 技術スタック

- Next.js 16
- LIFF SDK 2.27.2
- TypeScript
- Tailwind CSS

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# LIFF ID (LINE Developers Consoleで作成)
NEXT_PUBLIC_LIFF_ID=your-liff-id-here

# Contact API URL
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## LINE Developers Console での設定

### LINEミニアプリの作成

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. プロバイダーを選択または作成
3. 「新規チャネル作成」→「LINEミニアプリ」を選択
4. 必要な情報を入力してチャネルを作成
5. LIFF タブで LIFF アプリを追加
   - エンドポイントURL: デプロイ後のURL
   - Scope: `profile`, `openid`
   - ボットリンク機能: On (Aggressive)

### LIFF ID の取得

作成した LIFF アプリの LIFF ID を `.env.local` に設定してください。

## デプロイ (Railway)

1. Railway にプロジェクトを作成
2. GitHub リポジトリを接続
3. 環境変数を設定:
   - `NEXT_PUBLIC_LIFF_ID`
   - `NEXT_PUBLIC_API_URL`
4. デプロイ

## 機能

- LINEプロフィールからの名前自動入力
- お問い合わせカテゴリ選択（一般/サポート/不具合/提案）
- IDトークンによるLINEユーザー認証
- 送信完了後のLIFFウィンドウ自動クローズ

## API連携

このフロントエンドは `giz_line_bot_contact_api` と連携して動作します。
APIエンドポイント: `POST /api/inquiry`
