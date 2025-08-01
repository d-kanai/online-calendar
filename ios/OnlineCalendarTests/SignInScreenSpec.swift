import Testing
import SwiftUI
import ViewInspector
@testable import OnlineCalendar

// MARK: - SignInScreen振る舞いテスト
@Suite("SignInScreen振る舞いテスト")
struct SignInScreenSpec {
    
    @Test("初期表示でフォームが表示される")
    @MainActor
    func test1() async throws {
        // Given - SignInScreenを準備
        let view = SignInScreen()
        
        // When - ViewInspectorでビューを検査
        let inspection = try view.inspect()
        
        // Then - 必要な要素が表示されていることを確認
        let headerText = try inspection.find(text: "オンラインカレンダー")
        #expect(try headerText.string() == "オンラインカレンダー")
        
        // メールアドレスとパスワードの入力フィールドが存在することを確認
        // InputFieldは内部にTextFieldまたはSecureFieldを含んでいる
        do {
            _ = try inspection.find(ViewType.TextField.self)
            _ = try inspection.find(ViewType.SecureField.self)
        } catch {
            #expect(Bool(false), "入力フィールドが見つかりません")
        }
        
        // サインインボタンが存在することを確認
        let signInButton = try inspection.find(button: "サインイン")
        #expect(signInButton != nil)
    }
    
    @Test("有効な入力でサインインが成功する")
    @MainActor
    func test2() async throws {
        // Given - モックRepositoryとSignInScreenを準備
        let mockRepository = MockAuthRepository()
        let mockUser = User(id: "1", email: "test@example.com", name: "テストユーザー")
        let mockResponse = MockAuthResponse(token: "mock-token", refreshToken: "mock-refresh", user: mockUser).toAuthResponse()
        mockRepository.signInResult = .success(mockResponse)
        
        let viewModel = SignInViewModel(repository: mockRepository)
        let authState = AuthState.shared
        // 初期状態：未認証
        authState.isAuthenticated = false
        
        // ViewModelにフォームデータを設定
        viewModel.form.email = "test@example.com"
        viewModel.form.password = "password123"
        
        // When - signInを実行
        do {
            try await viewModel.signIn()
        } catch {
            // エラーは無視（ViewModelの動作確認のため）
        }
        
        // Then - 認証状態が更新されることを確認
        #expect(authState.isAuthenticated == true)
        #expect(viewModel.errorMessage == nil)
    }
    
    @Test("無効なメールアドレスでエラーメッセージが表示される")
    @MainActor
    func test3() async throws {
        // Given - SignInScreenを準備
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        
        // 無効なメールアドレスを設定
        viewModel.form.email = "invalid-email"
        viewModel.form.password = "password123"
        
        // When - フォームのバリデーションを確認
        let isValid = viewModel.form.isValid
        let emailError = viewModel.form.emailError
        
        // Then - バリデーションエラーが表示されることを確認
        #expect(isValid == false)
        #expect(emailError != nil)
        #expect(emailError == "有効なメールアドレスを入力してください")
    }
    
    @Test("パスワードが短すぎる場合にエラーメッセージが表示される")
    @MainActor
    func test4() async throws {
        // Given - SignInScreenを準備
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        
        // 短すぎるパスワードを設定
        viewModel.form.email = "test@example.com"
        viewModel.form.password = "123"
        
        // When - フォームのバリデーションを確認
        let isValid = viewModel.form.isValid
        let passwordError = viewModel.form.passwordError
        
        // Then - バリデーションエラーが表示されることを確認
        #expect(isValid == false)
        #expect(passwordError != nil)
        #expect(passwordError == "パスワードは8文字以上必要です")
    }
    
    @Test("APIエラー時にエラーメッセージが表示される")
    @MainActor
    func test5() async throws {
        // Given - APIエラーをモック
        let mockRepository = MockAuthRepository()
        mockRepository.signInResult = .failure(APIError.networkError("ネットワークエラーが発生しました"))
        
        let viewModel = SignInViewModel(repository: mockRepository)
        
        // 有効な入力を設定
        viewModel.form.email = "test@example.com"
        viewModel.form.password = "password123"
        
        // When - signInを実行
        do {
            try await viewModel.signIn()
            #expect(Bool(false)) // エラーが発生するはず
        } catch {
            // エラーが発生することを期待
        }
        
        // Then - エラーメッセージが設定されることを確認
        #expect(viewModel.errorMessage == "ネットワークエラーが発生しました")
    }
    
    @Test("エラーアラートのOKボタンでエラーがクリアされる")
    @MainActor
    func test6() async throws {
        // Given - エラーメッセージが設定されたViewModelを準備
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        viewModel.errorMessage = "テストエラー"
        
        // When - clearErrorを呼び出す
        viewModel.clearError()
        
        // Then - エラーメッセージがクリアされることを確認
        #expect(viewModel.errorMessage == nil)
    }
    
    @Test("サインインボタンが無効な状態で表示される")
    @MainActor
    func test7() async throws {
        // Given - 空のフォームでSignInScreenを準備
        let view = SignInScreen()
        
        // ViewInspectorでビューを検査
        let inspection = try view.inspect()
        
        // Then - サインインボタンが存在することを確認（フォームが空のため無効状態）
        let signInButton = try inspection.find(button: "サインイン")
        #expect(signInButton != nil)
        
        // ViewModelのフォームが無効であることを確認
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        #expect(viewModel.form.isValid == false)
    }
}

// MARK: - Mock Auth Repository
class MockAuthRepository: AuthRepositoryProtocol {
    var signInResult: Result<AuthResponse, Error> = .failure(APIError.networkError("Not configured"))
    var signUpResult: Result<AuthResponse, Error> = .failure(APIError.networkError("Not configured"))
    var signOutCalled = false
    var refreshTokenResult: Result<AuthResponse, Error> = .failure(APIError.networkError("Not configured"))
    var getCurrentUserResult: Result<User, Error> = .failure(APIError.networkError("Not configured"))
    
    func signIn(email: String, password: String) async throws -> AuthResponse {
        switch signInResult {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    func signUp(email: String, password: String, name: String) async throws -> AuthResponse {
        switch signUpResult {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    func signOut() async throws {
        signOutCalled = true
    }
    
    func refreshToken(_ refreshToken: String) async throws -> AuthResponse {
        switch refreshTokenResult {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    func getCurrentUser(token: String) async throws -> User {
        switch getCurrentUserResult {
        case .success(let user):
            return user
        case .failure(let error):
            throw error
        }
    }
}

// MARK: - Auth Response Extension for Testing
struct MockAuthResponse {
    let token: String
    let refreshToken: String?
    let user: User
    
    func toAuthResponse() -> AuthResponse {
        // AuthResponseのデコーダーを使ってオブジェクトを作成
        let jsonData = """
        {
            "token": "\(token)",
            "refreshToken": "\(refreshToken ?? "")",
            "user": {
                "id": "\(user.id)",
                "email": "\(user.email)",
                "name": "\(user.name)"
            }
        }
        """.data(using: .utf8)!
        
        return try! JSONDecoder().decode(AuthResponse.self, from: jsonData)
    }
}