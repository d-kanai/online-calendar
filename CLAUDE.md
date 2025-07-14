# 🎯 CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します 🤖✨

# 🚀 開発ワークフロー

## 🎪 BDD駆動開発とFigma Make連携ワークフロー

このプロジェクトでは、ビジネス要件をGherkin仕様で定義し、Figma Makeを活用してUIを作成、Next.jsに統合する開発手法を採用している 🌟

### 🎬 ワークフローの4段階

**1. 📝 ガーキンで仕様を表現**
- 📂 ビジネス要件をGherkin構文で`features/`ディレクトリに記述
- 🎯 `Feature` → `Rule` → `Scenario`の階層で整理
- 💼 ビジネスルールのみを記載し、UIの詳細は含めない
- 🔍 実装前に仕様レビューを実施してビジネス価値を確認

**2. 🎨 Figma MakeにGherkinを入力してUIを作成**
- 📋 作成したGherkin仕様をFigma Makeにプロンプトとして入力
- 💬 「このGherkin仕様に基づいてUIを作成してください」として依頼
- 🤖 Figma Makeが仕様を理解してUI設計とコンポーネントを自動生成
- ⚙️ 必要に応じてUI調整や追加要件を指示

**3. 📦 Figma Makeで作成されたCodeをコピーして設置**
- 📤 Figma Makeの「Export Code」機能でReactコンポーネントを出力
- 📁 出力されたコードを`frontend/figma-make-code/`ディレクトリに保存
- 🔗 生成されたファイル構造と依存関係を確認
- 🧩 UIコンポーネントとビジネスロジックの分離を検証

**4. ⚡ Figma Make CodeをNext.jsに組み込み**
- 🔄 `frontend/figma-make-code/`のコードをNext.jsプロジェクトに統合
- 📐 「Figma Make Code統合ルール」に従って以下を実行：
  - 📂 ファイル配置（types → src/types、ui → src/lib/ui、components → src/components）
  - 🔗 importパス修正（相対パス調整、バージョン指定削除）
  - ⚛️ Next.js対応（'use client'追加、App Router形式変換）
  - 📦 依存関係インストール（必須パッケージ追加）
  - 🎨 CSS設定更新（shadcn/ui互換変数追加）

### ⚠️ ワークフロー実行時の注意点

**📝 仕様作成フェーズ：**
- 🎯 ビジネスルールとUIルールを明確に分離
- 💡 実装詳細ではなく、ビジネス価値に焦点を当てる
- 🤝 ステークホルダーとの合意形成を重視

**🎨 UI作成フェーズ：**
- 📋 Gherkin仕様をそのままFigma Makeに入力
- ✅ 生成されたUIがビジネス要件を満たしているか検証
- 🔧 必要に応じてUIの微調整を依頼

**⚙️ コード統合フェーズ：**
- 📏 既存のコード規約とアーキテクチャに準拠
- 🛡️ バリデーション・エラーハンドリングの実装確認
- 🧪 テスト実行とビルド確認

**🔍 品質保証：**
- ✅ 実装後にGherkin仕様との整合性を確認
- 🎯 UIルールとビジネスルールの適切な分離を維持
- 🔗 統合テストでエンドツーエンドの動作を検証

このワークフローにより、ビジネス要件の明確化からUI実装まで一貫性のある開発プロセスを実現できる 🎉

## 🌿 Git運用ルール

- 💬 Commitコメントは日本語で箇条書きスタイルで記述すること
- 🤔 変更の理由（why）をできる限り含めること
- 🚀 git pushは自動実行（確認なし）で行うこと

## 🎨 Figma Make Code統合ルール

### 🏗️ プロジェクト構造
Figma Make Codeから出力されたコードをNext.jsプロジェクトに統合する際は以下の構造を使用すること：

```
frontend/src/
├── types/              # 📝 型定義ファイル（meeting.ts等）
├── lib/ui/            # 🧩 UIコンポーネントライブラリ（shadcn/ui互換）
├── components/        # ⚛️ 機能コンポーネント（CalendarView等）
└── app/
    ├── globals.css    # 🎨 Tailwind設定とCSS変数
    └── page.tsx       # 📄 メインページ
```

### 🔧 統合手順

#### 1. 📂 ファイル配置
- 📝 型定義: `figma-make-code/types/` → `src/types/`
- 🧩 UIライブラリ: `figma-make-code/components/ui/` → `src/lib/ui/`
- ⚛️ 機能コンポーネント: `figma-make-code/components/` → `src/components/`
- 📄 メインアプリ: `App.tsx` → `src/app/page.tsx`

#### 2. 🔗 importパス修正
- 📂 `./ui/` → `../lib/ui/`
- 📂 `../types/` → `../types/`
- ❌ バージョン指定削除: `@radix-ui/react-dialog@1.1.6` → `@radix-ui/react-dialog`

#### 3. ⚛️ Next.js対応
- 📝 `'use client';`ディレクティブ追加（Client Componentの場合）
- 🔄 App Router形式への変換
- 🖥️ React Server Components対応

#### 4. 📦 依存関係管理
必須パッケージのインストール:
```bash
# 🔧 基本パッケージ
npm install lucide-react sonner

# ⚛️ Radix UI基盤
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 🧩 必要なRadix UIコンポーネント
npm install @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-separator
```

#### 5. 🎨 Tailwind CSS設定
`globals.css`にshadcn/ui互換のCSS変数を追加:
- 🌈 カラーパレット変数（primary, secondary, muted等）
- 🌙 ライト/ダークテーマ対応
- ⚡ Tailwind CSS v4の@theme構文使用

#### 6. 🤖 自動修正コマンド
```bash
# ❌ バージョン指定削除
find src/lib/ui -name "*.tsx" -exec sed -i '' 's/@[0-9][^"]*//g' {} \;
```

### 🧪 検証手順
1. 🚀 `npm run dev`で開発サーバー起動確認
2. 🔧 依存関係エラーの解決
3. 🎨 CSSスタイル適用確認
4. ✅ 全機能の動作テスト

### 🚨 トラブルシューティング
- **🎨 CSSが当たらない**: CSS変数の不足、@theme構文エラー
- **🔗 import文エラー**: パス間違い、バージョン指定残存
- **📦 依存関係エラー**: 必須パッケージの未インストール

この手順に従うことで、Figma Make Codeから出力されたコードを効率的にNext.jsプロジェクトに統合できる 🎉

# 🏗️ アーキテクチャ

## 📏 実装ルール

- 🔤 Featureファイルのキーワードは英語を使用すること（Feature, Scenario, Given, When, Then, And, Rule）
- FeatureファイルにUIのルールは含めない。ビジネスルールのみ
- 🇯🇵 説明文や手順は日本語で記述すること

## 📚 文書化ルール

- 🇯🇵 ドキュメントファイルは日本語で記述すること
