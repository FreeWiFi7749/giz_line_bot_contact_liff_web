# GIZ LINE Bot お問い合わせフォーム (LIFF)

LINE LIFF（LINE Front-end Framework）として動作するお問い合わせフォームです。LINEアプリ内でのみ利用可能で、スパム対策としてLINE外からのアクセスをブロックします。

## 主な機能

- **LINEプロフィール連携**: 名前の自動入力
- **カテゴリ選択**: 一般/サポート/不具合報告/ご提案
- **LINE認証**: IDトークンによるユーザー認証
- **Cloudflare Turnstile**: ボット対策（人間確認）
- **送信確認ダイアログ**: 誤送信防止
- **自動クローズ**: 送信完了後にLIFFウィンドウを閉じる
- **LINE外アクセスブロック**: スパム対策

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16.1.3 |
| UI | React 19.2.3 |
| LINE SDK | LIFF SDK 2.27.3 |
| スタイリング | Tailwind CSS 4 |
| 言語 | TypeScript 5 |
| ボット対策 | Cloudflare Turnstile |
| デプロイ | Railway |

## 必要要件

- Node.js 20.9.0以上
- npm
- LINE Developers Console アカウント
- Cloudflare アカウント（Turnstile用）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

| 環境変数 | 説明 |
|---------|------|
| `NEXT_PUBLIC_LIFF_ID` | LIFF ID（LINE Developers Consoleで取得） |
| `NEXT_PUBLIC_API_URL` | Contact API のURL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile サイトキー |

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## プロジェクト構造

```
giz_line_bot_contact_liff_web/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # ルートレイアウト
│   │   ├── page.tsx      # メインページ
│   │   └── globals.css   # グローバルスタイル
│   ├── components/
│   │   └── InquiryForm.tsx  # お問い合わせフォーム
│   └── lib/
│       ├── liff.ts       # LIFF SDK ラッパー
│       └── api.ts        # API クライアント
├── public/               # 静的ファイル
├── next.config.ts        # Next.js 設定
├── railway.toml          # Railway デプロイ設定
└── tsconfig.json         # TypeScript 設定
```

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番環境用にビルド |
| `npm run start` | 本番サーバーを起動 |
| `npm run lint` | ESLint を実行 |

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

### 2026年1月8日以降の重要な変更点

2026年1月8日以降に作成される日本向けの新規LINEミニアプリチャネルでは、「チャネル同意の簡略化」機能の利用が必須となりました。

この変更により:
- ユーザーは `openid` スコープのみ自動で同意されます
- `profile` スコープは別途同意が必要になる場合があります
- 本アプリはプロフィール取得に失敗した場合でも正常に動作するよう設計されています（名前の自動入力がスキップされるだけ）

詳細: [LINE Developers News](https://developers.line.biz/ja/news/)

## デプロイ (Railway)

1. Railway にプロジェクトを作成
2. GitHub リポジトリを接続
3. 環境変数を設定:
   - `NEXT_PUBLIC_LIFF_ID`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. デプロイ

## API連携

このフロントエンドは [giz_line_bot_contact_api](https://github.com/FreeWiFi7749/giz_line_bot_contact_api) と連携して動作します。

| エンドポイント | 説明 |
|---------------|------|
| `POST /api/inquiry` | お問い合わせ送信 |

リクエストには以下が含まれます:
- `name`: お名前
- `email`: メールアドレス
- `category`: カテゴリ（general/support/bug/suggestion）
- `message`: お問い合わせ内容
- `idToken`: LINE IDトークン（オプション）
- `turnstileToken`: Turnstile トークン

## 関連リポジトリ

| リポジトリ | 説明 |
|-----------|------|
| [giz_line_bot_contact_api](https://github.com/FreeWiFi7749/giz_line_bot_contact_api) | お問い合わせAPI（FastAPI + Railway） |
| [giz_line_bot](https://github.com/frwi-tech/giz_line_bot) | LINE Bot バックエンド（FastAPI + Railway） |
| [giz_line_analytics_web](https://github.com/FreeWiFi7749/giz_line_analytics_web) | LINE Analytics ダッシュボード（Qwik + Cloudflare Pages） |
| [giz_line_delivery_app](https://github.com/FreeWiFi7749/giz_line_delivery_app) | 手動配信アプリ（Qwik + Cloudflare Pages） |

## ライセンス

MIT
