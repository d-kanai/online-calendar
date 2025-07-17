# 🧹 Dead Code Detection

このプロジェクトでは、未使用コード、未使用import、未使用dependenciesを検出するために[knip](https://knip.dev/)を使用します。

## 🚀 使用方法

### 📊 全体スキャン
```bash
yarn dead-code
```
全ワークスペース（backend, frontend, e2e）の未使用コードを検出

### 📦 ワークスペース別スキャン
```bash
# Backendのみ
yarn dead-code:backend

# Frontendのみ
yarn dead-code:frontend

# E2E関連のみ
yarn dead-code:e2e
```

### 🔧 自動修正（実験的）
```bash
yarn dead-code:fix
```
**⚠️ 注意**: 自動修正は慎重に使用してください。必ず事前にgit commitしてから実行してください。

## 🔍 検出項目

### 📂 Unused Files
- プロジェクト内で参照されていないファイル
- エントリーポイントから到達できないファイル

### 📤 Unused Exports
- エクスポートされているが、どこからもimportされていない関数・クラス・変数
- 公開APIとして必要な場合は除外設定に追加

### 📝 Unused Types
- TypeScript型定義で未使用のinterface、type、enum

### 📦 Unused Dependencies
- package.jsonに記載されているが実際に使用されていない依存関係
- devDependenciesも含む

### 🔗 Unlisted Dependencies
- コード内で使用されているがpackage.jsonに記載されていない依存関係

## ⚙️ 設定

設定は`knip.json`で管理されています：

```json
{
  "workspaces": {
    "backend": {
      "entry": ["src/**/*.spec.ts", "tests/**/*.ts"],
      "project": ["src/**/*.ts", "tests/**/*.ts"]
    },
    "frontend": {
      "entry": ["src/app/layout.tsx", "src/app/page.tsx"],
      "project": ["src/**/*.{ts,tsx}"]
    }
  }
}
```

### 🚫 除外設定

以下のファイル・パターンは自動的に除外されます：
- `**/*.d.ts` - TypeScript型定義ファイル
- `**/dist/**` - ビルド成果物
- `**/.next/**` - Next.js生成ファイル
- `**/src/lib/ui/.disabled/**` - 無効化されたUIコンポーネント

## 🛠️ ワークフロー

### 1. 定期実行
```bash
# 開発中に定期的に実行
yarn dead-code
```

### 2. クリーンアップ
```bash
# 実際のファイル削除前にgitコミット
git add .
git commit -m "checkpoint before dead code cleanup"

# 未使用ファイルを確認・削除
yarn dead-code
# 手動でファイル削除

# 未使用exportを確認・削除
# エディタで該当箇所を編集
```

### 3. CI/CD統合
プルリクエスト時に自動チェックを行うことを推奨：
```yaml
# .github/workflows/dead-code.yml
- name: Check for dead code
  run: yarn dead-code
```

## 💡 ベストプラクティス

### ✅ 推奨
- **定期実行**: 週1回程度の定期チェック
- **漸進的削除**: 一度に大量削除せず、段階的にクリーンアップ
- **レビュー必須**: 自動修正は必ずレビューしてからマージ
- **テスト実行**: 削除後は必ずテストを実行

### ⚠️ 注意事項
- **公開API**: ライブラリとして使用される場合、外部から参照される可能性があるexportは除外
- **動的import**: `import()`や`require()`の動的読み込みは検出されない場合あり
- **型のみ使用**: TypeScript型のみで使用されている場合の誤検出に注意

## 📋 よくある誤検出と対処

### 1. テスト用ファクトリ
```typescript
// テスト専用で使用されているが検出される場合
export class UserFactory {
  // knip設定でテストファイルをentryに含める
}
```

### 2. Next.js特有のファイル
```typescript
// app/layout.tsx, app/page.tsx等
// knip設定でエントリーポイントに明示的に指定
```

### 3. 型定義のみのexport
```typescript
// 他のプロジェクトで使用される型定義
export interface ApiResponse<T> {
  // 必要に応じて除外設定に追加
}
```

このツールを活用して、クリーンで保守しやすいコードベースを維持しましょう！ 🚀