# 🔌 ポート設定

## デフォルトポート

| サービス | ポート | URL |
|---------|--------|-----|
| **Frontend** | 3000 | http://localhost:3000 |
| **Backend** | 3001 | http://localhost:3001 |

## 🚀 開発サーバー起動

```bash
# フロントエンド (Next.js)
yarn front:dev    # http://localhost:3000

# バックエンド (Hono)
yarn back:dev     # http://localhost:3001
```

## ⚙️ ポート変更方法

### Frontend
```bash
# 一時的に変更
yarn workspace frontend dev -p 3002

# または環境変数で設定
PORT=3002 yarn front:dev
```

### Backend
```bash
# 環境変数で設定
PORT=3003 yarn back:dev

# または .env ファイルで設定
echo "PORT=3003" > backend/.env
```

## 🔗 CORS設定

BackendのCORS設定はフロントエンドURL（http://localhost:3000）を許可済み。

ポートを変更する場合は `backend/src/index.ts` の CORS 設定も更新してください。