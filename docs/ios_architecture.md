# iOS アーキテクチャガイド

## 📋 アーキテクチャチェックリスト

### ✅ Swift Package Manager (SPM) 構造
- [x] **SPM中心のアーキテクチャ**
  - [x] ビジネスロジックとUIは Swift Package として実装
  - [x] Xcode プロジェクトはプラットフォーム固有の設定のみ
  - [x] 各機能は独立したSPMターゲットとして分離
  - [x] 再利用可能なモジュール設計

### 🔗 モジュール依存関係ルール

#### 依存関係の階層
```
AppBridge
    ↓
Auth, Meeting, Stats (Features/*)
    ↓
Core
```

#### 依存関係ルール
1. **Core** は他のモジュールに依存しない（最下層）
2. **Features/*** モジュールはCoreにのみ依存できる
3. **Features/*** モジュール同士は相互に依存できない
4. **AppBridge** はすべてのモジュールに依存できる（アプリ全体の調整役）

#### 禁止事項
- ❌ Core → Features/* への依存
- ❌ Features/Auth → Features/Meeting への依存
- ❌ 循環依存

### ✅ モジュール構造
- [x] **モジュールベースのディレクトリ構造**
  - [x] 各機能は独立したSPMターゲットとして `Sources/Features/` 配下に配置
  - [x] モジュールは `Views/`, `Repositories/`, `ViewModels/`, `Models/` のサブディレクトリを持つ
  - [x] 共通コンポーネントは `Core` モジュールに配置
  - [x] ViewModels と Repositories でロジックを分離
  - [x] 1ファイルからしか使わないコンポーネントは分割しない

### 📁 ディレクトリ構造
```
ios/
├── 📦 Package.swift                 # Swift Packageマニフェスト
├── 📂 Sources/                     # Swift Packageソース
│   ├── 🔧 Core/                    # コアライブラリモジュール
│   │   ├── Models/                 # 共通データモデル (User)
│   │   ├── Services/               # 共通サービス (APIClient)
│   │   ├── State/                  # アプリ状態管理 (AuthState)
│   │   ├── Utils/                  # ユーティリティ
│   │   └── Views/                  # 再利用可能UIコンポーネント
│   │       └── Atoms/              # 基本コンポーネント
│   │
│   ├── 📂 Features/                # 機能モジュール
│   │   ├── 🔐 Auth/                # 認証機能
│   │   │   ├── Models/             # データモデル
│   │   │   ├── Repositories/       # API層
│   │   │   ├── ViewModels/         # プレゼンテーションロジック
│   │   │   └── Views/              # SwiftUIビュー
│   │   │       └── Components/     # 画面固有コンポーネント
│   │   │
│   │   ├── 📅 Meeting/             # 会議管理機能
│   │   │   ├── Models/             # 会議データモデル
│   │   │   ├── Repositories/       # 会議API層
│   │   │   ├── ViewModels/         # 会議プレゼンテーションロジック
│   │   │   └── Views/              # 会議UI
│   │   │       └── Components/     # 会議固有コンポーネント
│   │   │
│   │   └── 📊 Stats/               # 統計機能
│   │       ├── Models/             # 統計データモデル
│   │       ├── Repositories/       # 統計API層
│   │       ├── ViewModels/         # 統計プレゼンテーションロジック
│   │       └── Views/              # 統計UI
│   │           └── Components/     # 統計固有コンポーネント
│   │
│   └── 🌉 AppBridge/               # アプリケーション調整モジュール
│       └── Views/                  # アプリレベルビュー
│           ├── RootView.swift      # アプリルートビュー
│           └── Components/         # アプリ共通コンポーネント
│
├── 🍎 App/                         # Xcode固有ファイル
│   ├── OnlineCalendar.xcodeproj    # Xcodeプロジェクトファイル
│   └── OnlineCalendar/             # iOSアプリターゲット
│       └── OnlineCalendarApp.swift # アプリエントリーポイント
│
└── 🧪 Tests/                       # Swift Packageテスト
    ├── CoreTests/                  # Coreモジュールテスト
    └── Features/                   # 機能モジュールテスト
        ├── AuthTests/              # 認証テスト
        ├── MeetingTests/           # 会議テスト
        └── StatsTests/             # 統計テスト
```

### 🏗️ アーキテクチャ原則
- [x] **MVVM パターン**
  - [x] View: SwiftUI Views
  - [x] ViewModel: ObservableObject を使用 (AuthManager, MeetingListViewModel)
  - [x] Model: データ構造とビジネスロジック
  - [x] Repository: データアクセス層の抽象化
  - [x] モダンな非同期処理: Task + async/await パターン（React Suspense風）

- [x] **フォームバリデーション** 
  - [x] フォームクラスによるロジックの分離
  - [x] リアルタイムバリデーションフィードバック
  - [x] シンプルな実装（外部ライブラリ不使用）

- [x] **依存性注入**
  - [x] @StateObject / @ObservedObject でViewModelを注入
  - [x] @EnvironmentObject で共有状態を管理
  - [x] Singletonは最小限に抑える (APIClient, AuthManager)
  - [x] Protocolベースで依存性を注入（テスト可能性向上）

- [x] **コンポーネント設計**
  - [x] 子Viewは親ViewModelに直接依存しない（コールバックパターン）
  - [x] 表示ロジック（日付フォーマット等）はUtilに切り出す
  - [x] ViewModelには純粋なビジネスロジックのみを配置
  - [x] ViewとViewModelは1:1の関係
  - [x] ViewModelは画面固有のアクションのみを持つ
  - [x] 他ドメインのアクション（認証等）は直接EnvironmentObjectから呼ぶ
  - [x] フォームロジックは専用のFormクラスに分離（例：SignInForm）
  - [x] 必要最低限のプロパティのみ`@Published`にする（UIに影響するもののみ）
  - [x] **UIコンポーネントの組織化**
    - [x] 各モジュール内のコンポーネントは `Views/Components/` ディレクトリに配置
    - [x] 機能固有のコンポーネント（MeetingRowView等）は該当モジュールのComponents内
    - [x] 汎用コンポーネント（InputFieldやButton等）は `Common/Views/Components/` に配置
    - [x] 各コンポーネントにはSwiftUI Previewを含める（開発効率向上）

### 📡 API通信
- [x] **APIClient**
  - [x] 共通のAPIClient (`Modules/Common/Services/APIClient.swift`)
  - [x] async/await を使用した非同期処理
  - [x] エラーハンドリングの統一
  - [x] デバッグログの実装

### 🔐 認証
- [x] **AuthManager**
  - [x] 認証状態の管理 (`@Published var isAuthenticated`)
  - [x] トークン管理
  - [ ] 自動ログアウト機能

### 🧪 テスト
- [x] **E2Eテスト**
  - [x] Maestro を使用
  - [x] プロジェクトローカルインストール
  - [ ] CI/CDパイプラインでの実行

- [ ] **ユニットテスト**
  - [ ] 各モジュールにテストファイルを配置
  - [ ] XCTest フレームワークを使用

### 🎨 UI/UX
- [x] **SwiftUI**
  - [x] iOS 15.0+ 対応
  - [ ] ダークモード対応
  - [ ] アクセシビリティ対応

- [x] **デザインシステム**
  - [ ] 共通のカラーパレット
  - [ ] 統一されたスペーシング
  - [x] 再利用可能なUIコンポーネント
    - [x] Atomコンポーネント（InputField, PrimaryButton, ErrorMessage）
    - [x] 機能固有コンポーネント（MeetingRowView, MeetingErrorView等）
    - [x] SwiftUI Previewによる開発・デザイン確認の効率化
    - [ ] Moleculeコンポーネント
    - [ ] Organismコンポーネント

### 🔧 開発環境
- [ ] **ビルド設定**
  - [ ] Debug/Release 設定の分離
  - [ ] 環境変数の管理
  - [ ] Code Signing の自動化

- [ ] **コード品質**
  - [ ] SwiftLint の導入
  - [ ] コードレビューのガイドライン
  - [ ] Git フックでの自動チェック

### 📱 パフォーマンス
- [ ] **最適化**
  - [ ] 画像の遅延読み込み
  - [ ] リスト表示の仮想化
  - [ ] メモリリークの防止

### 🚀 デプロイ
- [ ] **リリース準備**
  - [ ] App Store Connect 設定
  - [ ] プライバシーポリシー
  - [ ] アプリアイコンとスクリーンショット

## 📝 コーディング規約

### Atomicデザイン
- [x] **コンポーネント階層**
  - [x] Atoms: 最小単位のUI部品（Button、InputField等）
  - [x] 機能固有コンポーネント: モジュール内の専用UI部品
  - [ ] Molecules: Atomsを組み合わせた小さなコンポーネント
  - [ ] Organisms: 複雑な機能を持つコンポーネント
  - [x] 共通コンポーネントは`Common/Views/Components/`配下に配置
  - [x] モジュール固有コンポーネントは各モジュールの`Views/Components/`配下に配置

### View設計
- [x] **内部Viewの管理**
  - [x] 1つのファイルからしか使わないViewは `private struct` として同一ファイル内に定義
  - [x] 複数箇所から使うViewは別ファイルに切り出し
  - [x] 子Viewへの依存はコールバックで解決
  - [x] View内のコンポーネントは大文字始まり（例：`HeaderSection`、`FormSection`）
  - [x] コンポーネントは純粋なUIのみ返し、レイアウト（spacing、padding）は親で制御

- [x] **コンポーネント分離の基準**
  - [x] 再利用性のあるコンポーネントは独立したファイルに分離
  - [x] ロジックを持つコンポーネント（エラー処理、ローディング状態等）は分離
  - [x] SwiftUI Previewを活用した開発効率向上のため、複雑なコンポーネントは分離
  - [x] 分離したコンポーネントには必ずPreviewを含める

- [x] **ユーティリティ関数**
  - [x] 日付フォーマット等の純粋関数はExtensionとしてUtilsに配置
  - [x] ViewModelには状態に依存する表示ロジック（computed property）は持たせる
  - [x] 状態に依存しない汎用的な表示ロジックはUtilsに配置
  - [x] DateFormatterインスタンスはstaticでキャッシュ

### 実装例

#### フォームの分離パターン
```swift
// フォームクラス：状態とバリデーション
class SignInForm: ObservableObject {
    @Published var email: String = ""
    @Published var password: String = ""
    
    var isValid: Bool {
        !email.isEmpty && email.contains("@") && password.count >= 8
    }
    
    var emailError: String? {
        guard !email.isEmpty else { return nil }
        guard email.contains("@") else { return "有効なメールアドレスを入力してください" }
        return nil
    }
    
    var passwordError: String? {
        guard !password.isEmpty else { return nil }
        guard password.count >= 8 else { return "パスワードは8文字以上必要です" }
        return nil
    }
}

// ViewModel：ビジネスロジックのみ
@MainActor
class SignInViewModel: ObservableObject {
    @Published var form = SignInForm()
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func signIn() async {
        guard form.isValid else { return }
        // API呼び出しなどのビジネスロジック
    }
}

// View：UIのみ
struct SignInView: View {
    @StateObject private var viewModel = SignInViewModel()
    
    var body: some View {
        TextField("メールアドレス", text: $viewModel.form.email)
        if let error = viewModel.form.emailError {
            Text(error).foregroundColor(.red)
        }
    }
}
```


#### @Published プロパティの使用ガイドライン
```swift
// ✅ 良い例：UIに影響するプロパティのみ@Published
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false  // UIで使用
    
    private var authToken: String?          // 内部でのみ使用
    private var currentUser: User?          // 内部でのみ使用
    
    var currentToken: String? { authToken } // 必要に応じて読み取り専用で公開
}

// ❌ 悪い例：すべてのプロパティを@Published
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var authToken: String?      // UIで使わない
    @Published var currentUser: User?      // UIで使わない
}
```

#### View コンポーネントの設計
```swift
struct SignInView: View {
    var body: some View {
        VStack(spacing: 20) {  // ✅ レイアウトは親で制御
            HeaderSection
            
            VStack(spacing: 15) {
                FormSection
            }
            .padding(.horizontal, 40)
        }
    }
}

private extension SignInView {
    var HeaderSection: some View {  // ✅ 大文字始まり
        Text("タイトル")
    }
    
    @ViewBuilder
    var FormSection: some View {  // ✅ 純粋なUIのみ
        EmailField
        PasswordField
        SubmitButton
        // spacing等のレイアウトは含まない
    }
}
```

#### モダンな非同期処理パターン
```swift
struct SignInView: View {
    @State private var signInTask: Task<Void, Error>?
    
    var body: some View {
        Button("サインイン") {
            signInTask?.cancel()  // ✅ 既存タスクをキャンセル
            signInTask = Task {
                do {
                    try await viewModel.signIn()
                    signInTask = nil  // ✅ 成功時にnilに設定
                } catch {
                    signInTask = nil  // ✅ エラー時にもnilに設定
                    // ViewModelがエラーハンドリング済み
                }
            }
        }
        .disabled(signInTask != nil)  // ✅ Task存在でローディング状態
        .overlay {
            if signInTask != nil {  // ✅ 宣言的なローディング表示
                ProgressView()
            }
        }
    }
}

// ViewModel側
func signIn() async throws {
    // isLoading = true/false が不要！
    // エラーはthrowで処理
    // @Published var errorMessage でエラー表示
}
```

#### コールバックパターン
```swift
// ✅ 良い例：コールバックパターン
struct ChildView: View {
    let item: Item
    let onTap: () -> Void
}

// ❌ 悪い例：ViewModelへの直接依存
struct ChildView: View {
    let item: Item
    let viewModel: ParentViewModel
}

// ✅ 良い例：ViewModelの状態に基づく表示ロジック
class MeetingListViewModel: ObservableObject {
    @Published var meetings: [Meeting] = []
    @Published var filter: MeetingFilter = .all
    
    // 状態に基づくcomputed property
    var filteredMeetings: [Meeting] {
        switch filter {
        case .all:
            return meetings
        case .today:
            return meetings.filter { Calendar.current.isDateInToday($0.startDate) }
        case .upcoming:
            return meetings.filter { $0.startDate > Date() }
        }
    }
    
    var emptyStateMessage: String {
        switch filter {
        case .all:
            return "会議がありません"
        case .today:
            return "今日の会議はありません"
        case .upcoming:
            return "予定されている会議はありません"
        }
    }
}

// ✅ 良い例：汎用的な表示ロジックはUtilsに
extension Date {
    var japaneseMediumDateTime: String {
        DateFormatter.japaneseMediumDateTime.string(from: self)
    }
}

// ✅ 良い例：ViewModelの責務分離
struct MeetingListView: View {
    @StateObject private var viewModel = MeetingListViewModel()  // 画面固有
    @EnvironmentObject private var authManager: AuthManager      // 共有
    
    var body: some View {
        Button("サインアウト") {
            authManager.signOut()  // 認証は直接AuthManagerから
        }
    }
}

// ❌ 悪い例：他ドメインのアクションをViewModelに持たせる
class MeetingListViewModel: ObservableObject {
    func signOut() {  // ❌ 会議とは関係ない
        authManager.signOut()
    }
}
```

### ✅ モダンな非同期処理パターン（Taskパターン）チェックリスト
- [ ] **View層でTask管理**
  - [ ] `@State private var xxxTask: Task<Void, Error>?` でタスク状態を管理
  - [ ] タスク実行前に既存タスクをキャンセル（`xxxTask?.cancel()`）
  - [ ] タスク完了後にnilに設定（成功・エラー両方）
  - [ ] `if xxxTask != nil` でローディング状態を宣言的に表現

- [ ] **ViewModel層の簡潔化**
  - [ ] `@Published var isLoading: Bool` を削除（不要）
  - [ ] `@Published var errorMessage: String?` は維持（エラー表示用）
  - [ ] 非同期メソッドは `async throws` で実装
  - [ ] isLoading = true/false の手動管理を削除

- [ ] **UIの宣言的制御**
  - [ ] `.disabled(xxxTask != nil)` でボタン無効化
  - [ ] `.overlay { if xxxTask != nil { ProgressView() } }` でローディング表示
  - [ ] エラーは`viewModel.errorMessage`で表示（Alertやメッセージ）

- [ ] **禁止事項**
  - [ ] ViewModelでの`isLoading`プロパティ使用禁止
  - [ ] 命令的なローディング状態管理禁止
  - [ ] 複数の状態フラグ（isLoading, isProcessing等）の併用禁止

## 🔄 今後の改善点
1. **状態管理の強化**
   - Redux パターンの導入検討
   - Combine フレームワークの活用

2. **オフライン対応**
   - Core Data によるローカルキャッシュ
   - 同期メカニズムの実装

3. **セキュリティ強化**
   - キーチェーンでのトークン保存
   - 生体認証の導入

4. **アナリティクス**
   - クラッシュレポート
   - ユーザー行動分析

## 📚 参考リンク
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [Swift Style Guide](https://github.com/raywenderlich/swift-style-guide)