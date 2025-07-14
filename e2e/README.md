# 🧪 E2Eテスト

このディレクトリには、PlaywrightとCucumberを使用したE2Eテストが含まれています。

## 📁 ディレクトリ構成

```
e2e/
├── features/           # 🥒 Cucumberフィーチャーファイル
├── steps/             # 📝 ステップ定義ファイル
├── support/           # 🛠️ サポートファイル（world, hooks等）
├── tests/             # 🎭 Playwrightテストファイル
└── reports/           # 📊 テストレポート出力先
```

## 🚀 テスト実行方法

### Playwrightテストの実行

```bash
# 全てのテストを実行
npm run e2e:playwright

# UIモードでテストを実行（対話的）
npm run e2e:ui

# 特定のテストファイルを実行
npx playwright test e2e/tests/toppage.spec.ts
```

### Cucumberテストの実行

```bash
# Cucumberテストを実行
npm run e2e:cucumber

# 特定のフィーチャーファイルを実行
npx cucumber-js e2e/features/toppage.feature --require e2e/steps --require e2e/support
```

## 📋 前提条件

1. **開発サーバーの起動**: テスト実行前にNext.jsアプリが `http://localhost:3000` で動作している必要があります
   ```bash
   npm run front:dev
   ```

2. **ブラウザのインストール**: 初回実行前にPlaywrightブラウザをインストール
   ```bash
   npm run e2e:install
   ```

## 🎯 テスト作成のガイドライン

### Playwrightテスト
- `e2e/tests/` ディレクトリに `.spec.ts` ファイルを作成
- `test.describe()` でテストグループを整理
- `data-testid` 属性を使用してUI要素を特定

### Cucumberテスト  
- `e2e/features/` にフィーチャーファイル（`.feature`）を作成
- `e2e/steps/` にステップ定義ファイル（`.js`）を作成
- 日本語でシナリオを記述し、英語でキーワードを使用

## 🔧 設定ファイル

- `playwright.config.ts`: Playwrightの設定
- `e2e/cucumber.config.js`: Cucumberの設定
- `e2e/support/world.js`: テスト環境の初期化

## 📊 レポート

- Playwrightレポート: `npx playwright show-report`
- Cucumberレポート: `e2e/reports/cucumber-report.html`