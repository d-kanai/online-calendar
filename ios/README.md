# 📱 iOSプロジェクト構成

このiOSプロジェクトは **Swift Package Manager (SPM) 中心のアーキテクチャ** を採用し、再利用可能なSwift PackageとXcode固有のアプリプロジェクトを明確に分離しています。

## 🏗️ ディレクトリ構造

```
ios/
├── 📦 Package.swift                 # Swift Packageマニフェスト
├── 📄 Package.resolved             # 解決済みパッケージ依存関係
│
├── 📂 Sources/                     # Swift Packageソース
│   ├── 🔧 Core/                    # コアライブラリモジュール
│   │   ├── Models/                 # 共通データモデル (User, APIResponse)
│   │   ├── Services/               # 共通サービス (APIClient)
│   │   ├── State/                  # アプリ状態管理 (AuthState)
│   │   ├── Utils/                  # ユーティリティ (DateFormatter+Extensions)
│   │   └── Views/                  # 再利用可能UIコンポーネント
│   │       └── Atoms/              # 基本コンポーネント (PrimaryButton, InputField, ErrorMessage)
│   │
│   ├── 📂 Features/                # 機能モジュール
│   │   ├── 🔐 Auth/                # 認証機能
│   │   │   ├── Models/             # データモデル (SignInForm)
│   │   │   ├── Repositories/       # API層 (AuthRepository)
│   │   │   ├── ViewModels/         # プレゼンテーションロジック (SignInViewModel)
│   │   │   └── Views/              # SwiftUIビュー (SignInScreen)
│   │   │       └── Components/     # 画面固有コンポーネント
│   │   │
│   │   ├── 📅 Meeting/             # 会議管理機能
│   │   │   ├── Models/             # 会議データモデル (Meeting, Organizer, Participant)
│   │   │   ├── Repositories/       # 会議API層 (MeetingRepository)
│   │   │   ├── ViewModels/         # 会議プレゼンテーションロジック
│   │   │   └── Views/              # 会議UI (MeetingListScreen)
│   │   │       └── Components/     # 会議固有コンポーネント
│   │   │
│   │   └── 📊 Stats/               # 統計機能
│   │       ├── Models/             # 統計データモデル (MeetingStats)
│   │       ├── Repositories/       # 統計API層 (MeetingStatsRepository)
│   │       ├── ViewModels/         # 統計プレゼンテーションロジック
│   │       └── Views/              # 統計UI (MeetingStatsScreen)
│   │           └── Components/     # 統計固有コンポーネント
│   │
│   └── 🌉 AppBridge/               # アプリケーション調整モジュール
│       └── Views/                  # アプリレベルビュー
│           ├── RootView.swift      # アプリルートビュー
│           ├── Components/         # アプリ共通コンポーネント (AppHeader)
│           └── PreviewCatalogScreen.swift # プレビューカタログ
│
├── 🧪 Tests/                       # Swift Packageテスト
│   ├── CoreTests/                  # Coreモジュールテスト
│   └── Features/                   # 機能モジュールテスト
│       ├── Auth/                   # 認証テスト
│       ├── Meeting/                # 会議テスト
│       └── Stats/                  # 統計テスト
│
├── 🍎 App/                         # Xcode固有ファイル
│   ├── 📱 OnlineCalendar.xcodeproj # Xcodeプロジェクトファイル
│   └── 📂 OnlineCalendar/          # iOSアプリターゲット
│       ├── OnlineCalendarApp.swift # アプリエントリーポイント
│       ├── Assets.xcassets/        # アプリアセット
│       └── Preview Content/        # SwiftUIプレビューアセット
│
├── 🛠️ build/                       # ビルド成果物
├── 📊 coverage/                    # テストカバレッジレポート
└── 🧹 .gitignore                  # Git無視ルール
```

## 🎯 アーキテクチャ概要

### 📦 Swift Package (`Sources/`)
- **プラットフォーム非依存** のビジネスロジックとUIコンポーネント
- 他のSwiftプロジェクトにインポート可能
- 標準的なSPMディレクトリ構造に準拠
- アプリのコア機能をすべて含む

### 🍎 Xcode App (`App/`)
- プラットフォーム固有の設定
- アプリライフサイクル管理
- アセットカタログとリソース
- Xcodeプロジェクト設定

## 🔗 モジュール依存関係ルール

### 依存関係の階層
```
AppBridge
    ↓
Auth, Meeting, Stats (Features/*)
    ↓
Core
```

### 依存関係ルール
1. **Core** は他のモジュールに依存しない
2. **Features/*** モジュールはCoreにのみ依存できる
3. **Features/*** モジュール同士は相互に依存できない
4. **AppBridge** はすべてのモジュールに依存できる（アプリ全体の調整役）

### 禁止事項
- ❌ Core → Features/* への依存
- ❌ Features/Auth → Features/Meeting への依存
- ❌ 循環依存

## 🔧 主要コマンド

```bash
# Swift Packageテストを実行
swift test

# Swift Packageをビルド
swift build

# カバレッジ付きでテストを実行
swift test --enable-code-coverage

# Xcodeプロジェクトを開く
open App/OnlineCalendar.xcodeproj

# または、SPM統合のためPackage.swift経由で開く
open Package.swift
```

## 🏛️ モジュールアーキテクチャ

各機能モジュールは一貫した構造に従います：

- **📁 Models/** - データ構造とDTO
- **📁 Repositories/** - API通信層
- **📁 ViewModels/** - プレゼンテーションロジック (MVVMパターン)
- **📁 Views/** - SwiftUIビューとコンポーネント
  - **📁 Components/** - 画面固有のコンポーネント

## 🧪 テスト

- ユニットテストはAppleのネイティブTestingフレームワークを使用
- UIテストはSwiftUIビューテスト用のViewInspectorを使用
- E2EテストはMaestroを使用（`/ios_e2e`ディレクトリ参照）

## 📚 依存関係

- **ViewInspector** - SwiftUIビューテストフレームワーク
- すべての依存関係はSwift Package Manager経由で管理

## 🚀 開発ワークフロー

1. **機能開発**: 適切なFeatures/*モジュールに実装
2. **共通コンポーネント**: Core/Views/Atomsに配置
3. **画面固有コンポーネント**: Features/*/Views/Componentsに配置
4. **テスト**: Tests/Features/*に対応するテストを作成
5. **ビルド確認**: `swift test`と`xcodebuild`の両方で確認