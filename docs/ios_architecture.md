# iOS アーキテクチャガイド

## 📋 アーキテクチャチェックリスト

### ✅ モジュール構造
- [x] **モジュールベースのディレクトリ構造**
  - [x] 各機能は独立したモジュールとして `Modules/` 配下に配置
  - [x] モジュールは `Views/`, `Services/`, `Models/` のサブディレクトリを持つ
  - [x] 共通コンポーネントは `Modules/Common/` に配置
  - [x] ViewModels と Repositories でロジックを分離
  - [x] 1ファイルからしか使わないコンポーネントは分割しない

### 📁 ディレクトリ構造
```
ios/OnlineCalendar/
├── Modules/
│   ├── Auth/                    # 認証関連
│   │   ├── Views/              # 認証画面
│   │   ├── Services/           # 認証ロジック
│   │   └── Models/             # 認証モデル
│   ├── Meeting/                 # 会議関連
│   │   ├── Views/              # 会議画面
│   │   ├── Services/           # 会議ロジック
│   │   └── Models/             # 会議モデル
│   └── Common/                  # 共通コンポーネント
│       ├── Views/              # 共通View
│       ├── Services/           # 共通サービス
│       └── Models/             # 共通モデル
├── ContentView.swift            # アプリのエントリーポイント
├── OnlineCalendarApp.swift      # アプリ設定
└── Assets.xcassets/            # アセット
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
  - [ ] Molecules: Atomsを組み合わせた小さなコンポーネント
  - [ ] Organisms: 複雑な機能を持つコンポーネント
  - [x] 共通コンポーネントは`Modules/Common/Views/`配下に配置

### View設計
- [x] **内部Viewの管理**
  - [x] 1つのファイルからしか使わないViewは `private struct` として同一ファイル内に定義
  - [x] 複数箇所から使うViewは別ファイルに切り出し
  - [x] 子Viewへの依存はコールバックで解決
  - [x] View内のコンポーネントは大文字始まり（例：`HeaderSection`、`FormSection`）
  - [x] コンポーネントは純粋なUIのみ返し、レイアウト（spacing、padding）は親で制御

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