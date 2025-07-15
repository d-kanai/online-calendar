# Online Calendar Backend

Hono TypeScript API with Prisma & SQLite

## 🚀 セットアップ

```bash
# 依存関係のインストール
npm install

# データベースセットアップ
./scripts/setup-db.sh

# 開発サーバー起動
npm run dev
```

## 🗄️ Database

- **SQLite** - 開発用データベース
- **Prisma** - ORM
- **Location**: `prisma/dev.db`

## 📡 API エンドポイント

### Meeting CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings` | 全会議取得 |
| GET | `/api/v1/meetings/:id` | 会議詳細取得 |
| POST | `/api/v1/meetings` | 会議作成 |
| PUT | `/api/v1/meetings/:id` | 会議更新 |
| DELETE | `/api/v1/meetings/:id` | 会議削除 |
| GET | `/api/v1/meetings/owner/:ownerId` | オーナー別会議取得 |

### Request/Response Examples

**POST /api/v1/meetings**
```json
{
  "title": "定例MTG",
  "startTime": "2025-01-15T10:00:00Z",
  "endTime": "2025-01-15T11:00:00Z",
  "isImportant": false,
  "ownerId": "user123"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "cm123abc",
    "title": "定例MTG",
    "startTime": "2025-01-15T10:00:00.000Z",
    "endTime": "2025-01-15T11:00:00.000Z",
    "isImportant": false,
    "ownerId": "user123",
    "createdAt": "2025-01-14T09:00:00.000Z",
    "updatedAt": "2025-01-14T09:00:00.000Z"
  },
  "message": "Meeting created successfully"
}
```

## 🏗️ プロジェクト構成 (Modular Monolith)

```
src/
├── modules/
│   └── meeting/
│       ├── models/          # データ型定義
│       ├── services/        # ビジネスロジック
│       ├── controllers/     # HTTPハンドラー
│       └── meeting.routes.ts # ルート定義
├── shared/
│   ├── database/           # Prisma設定
│   └── types/              # 共通型定義
└── index.ts               # アプリエントリーポイント
```

## 📝 コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - TypeScriptビルド
- `npm run db:generate` - Prismaクライアント生成
- `npm run db:push` - スキーマをDBにプッシュ
- `npm run db:studio` - Prisma Studio起動