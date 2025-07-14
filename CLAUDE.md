# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## プロジェクト概要

これはOnlineCalendarアプリケーションのBDD仕様リポジトリです。オンラインカレンダーシステムの動作と要件を定義する日本語のGherkinフィーチャーファイルが含まれています。

## アーキテクチャ

このプロジェクトは日本語のGherkin構文で書かれたフィーチャーファイルを使用したBDD（振る舞い駆動開発）手法を採用しています。主な機能は以下の通りです：

- **会議作成**: オーナー、開始/終了時刻、タイトルを含む基本的な会議作成機能
- **参加者管理**: 50名の参加者上限の実装
- **会議リスケジュール**: 未来の会議の時間変更と自動通知機能
- **リマインダーシステム**: インテリジェントなリマインダー生成（通常会議は15分前、重要会議は60分前）
- **通知配信**: メールをサポートするマルチチャネル通知システム

## フィーチャーファイル構成

すべてのフィーチャーファイルは `features/` ディレクトリに配置されています：
- `meeting_creation.feature` - 会議作成のコア機能
- `participant_limit.feature` - 参加者数の検証（最大50名）
- `reschedule_meeting.feature` - 通知付きの会議時間変更
- `reminder_generation.feature` - 会議の重要度に基づくスマートリマインダー
- `notification_sending.feature` - 通知配信メカニズム

## 主要なビジネスルール

- 会議あたりの参加者上限は50名
- 通常会議：15分前リマインダー
- 重要会議：60分前リマインダー
- リスケジュールは全参加者に「MeetingRescheduled」通知をトリガー
- 未来の会議のみリスケジュール可能

## 開発ノート

このリポジトリにはBDD仕様のみが含まれています。フィーチャーファイルはCucumber-JVMなどのBDDツールで実行するように設計されています。実際のシステムを実装する際は、これらのシナリオがカレンダーアプリケーションのコア機能の開発を駆動する必要があります。

## 実装ルール

- Featureファイルのキーワードは英語を使用すること（Feature, Scenario, Given, When, Then, And, Rule）
- 説明文や手順は日本語で記述すること

## Git運用ルール

- Commitコメントは日本語で箇条書きスタイルで記述すること
- 変更の理由（why）をできる限り含めること
- git pushは自動実行（確認なし）で行うこと

## 文書化ルール

- CLAUDE.mdファイルは日本語で記述すること

## Figma Make Code統合ルール

### プロジェクト構造
Figma Make Codeから出力されたコードをNext.jsプロジェクトに統合する際は以下の構造を使用すること：

```
frontend/src/
├── types/              # 型定義ファイル（meeting.ts等）
├── lib/ui/            # UIコンポーネントライブラリ（shadcn/ui互換）
├── components/        # 機能コンポーネント（CalendarView等）
└── app/
    ├── globals.css    # Tailwind設定とCSS変数
    └── page.tsx       # メインページ
```

### 統合手順

#### 1. ファイル配置
- 型定義: `figma-make-code/types/` → `src/types/`
- UIライブラリ: `figma-make-code/components/ui/` → `src/lib/ui/`
- 機能コンポーネント: `figma-make-code/components/` → `src/components/`
- メインアプリ: `App.tsx` → `src/app/page.tsx`

#### 2. importパス修正
- `./ui/` → `../lib/ui/`
- `../types/` → `../types/`
- バージョン指定削除: `@radix-ui/react-dialog@1.1.6` → `@radix-ui/react-dialog`

#### 3. Next.js対応
- `'use client';`ディレクティブ追加（Client Componentの場合）
- App Router形式への変換
- React Server Components対応

#### 4. 依存関係管理
必須パッケージのインストール:
```bash
# 基本パッケージ
npm install lucide-react sonner

# Radix UI基盤
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 必要なRadix UIコンポーネント
npm install @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-separator
```

#### 5. Tailwind CSS設定
`globals.css`にshadcn/ui互換のCSS変数を追加:
- カラーパレット変数（primary, secondary, muted等）
- ライト/ダークテーマ対応
- Tailwind CSS v4の@theme構文使用

#### 6. 自動修正コマンド
```bash
# バージョン指定削除
find src/lib/ui -name "*.tsx" -exec sed -i '' 's/@[0-9][^"]*//g' {} \;
```

### 検証手順
1. `npm run dev`で開発サーバー起動確認
2. 依存関係エラーの解決
3. CSSスタイル適用確認
4. 全機能の動作テスト

### トラブルシューティング
- **CSSが当たらない**: CSS変数の不足、@theme構文エラー
- **import文エラー**: パス間違い、バージョン指定残存
- **依存関係エラー**: 必須パッケージの未インストール

この手順に従うことで、Figma Make Codeから出力されたコードを効率的にNext.jsプロジェクトに統合できる。