# 📅 Online Calendar

BDD駆動開発とFigma Make連携による現代的なカレンダーアプリケーション

## 🏗️ アーキテクチャ

```
OnlineCalendar/
├── frontend/          # Next.js + TypeScript
├── backend/           # Hono + TypeScript
└── e2e/              # Cucumber + Playwright
```

## 🔌 ポート設定

| サービス | ポート | URL |
|---------|--------|-----|
| **Frontend** | 3000 | http://localhost:3000 |
| **Backend** | 3001 | http://localhost:3001 |

## 🚀 クイックスタート

```bash
# 依存関係インストール
yarn install

# フロントエンド起動
yarn front:dev

# バックエンド起動（別ターミナル）
yarn back:dev

# E2Eテスト実行
yarn e2e
```

## 📝 利用可能なコマンド

### Frontend (Next.js)
- `yarn front:dev` - 開発サーバー起動
- `yarn front:build` - プロダクションビルド
- `yarn front:start` - プロダクションサーバー起動
- `yarn front:lint` - ESLintチェック

### Backend (Hono)
- `yarn back:dev` - 開発サーバー起動
- `yarn back:build` - TypeScriptビルド
- `yarn back:start` - プロダクションサーバー起動
- `yarn back:lint` - ESLintチェック

### E2E Tests (Cucumber + Playwright)
- `yarn e2e` - 全テスト実行（@pending除く）
- `yarn e2e:develop` - @developタグのみ実行
- `yarn e2e:playwright` - Playwrightテスト実行

## 🎯 BDD駆動開発ワークフロー

1. **📝 Gherkin仕様作成** - `e2e/features/`にビジネス要件を記述
2. **🎨 Figma MakeでUI作成** - Gherkin仕様をプロンプトとして入力
3. **📦 コード統合** - `frontend/figma-make-code/`に配置後、Next.jsに統合
4. **🧪 E2Eテスト実装** - Cucumberステップファイルでドメインロジック直接テスト

詳細は [CLAUDE.md](./CLAUDE.md) を参照。

## 🧪 テスト戦略

- **E2E (Cucumber)**: ユーザーアクション中心の統合テスト
- **Unit Tests**: ビジネスルール網羅のドメインロジックテスト
- **Step Files**: ドメインクラス直接実行（ブラウザ操作なし）

## 🛠️ 技術スタック

### Frontend
- **Next.js 15** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **React 19**

### Backend  
- **Hono v4** + **TypeScript**
- **Node.js 18+**

### Testing
- **Cucumber** - BDD仕様記述・実行
- **Playwright** - E2Eブラウザテスト
- **Jest/Vitest** - ユニットテスト

## 📚 ドキュメント

- [🎯 CLAUDE.md](./CLAUDE.md) - 開発ガイダンス
- [🔌 PORT_CONFIG.md](./PORT_CONFIG.md) - ポート設定詳細