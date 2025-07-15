# Online Calendar Backend

Hono TypeScript APIサーバー

## 🚀 セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 📡 API エンドポイント

- `GET /health` - ヘルスチェック
- `GET /api/v1` - API情報

## 🛠️ 開発

- **Port**: 3001
- **Frontend URL**: http://localhost:3000
- **CORS**: フロントエンドからのリクエストに対応済み

## 📝 コマンド

- `npm run dev` - 開発モード（ホットリロード）
- `npm run build` - TypeScriptビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLintチェック
- `npm run type-check` - 型チェック