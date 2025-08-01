import Testing
import SwiftUI
import ViewInspector
@testable import OnlineCalendar

// MARK: - SignInScreen振る舞いテスト
@Suite("SignInScreen振る舞いテスト")
struct SignInScreenSpec {
    
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
        
        let view = SignInScreen(viewModel: viewModel)
        
        // When - ViewInspectorでビューを検査してフォームを入力
        let inspection = try view.inspect()
        
        // メールアドレス入力
        let emailField = try inspection.find(ViewType.TextField.self)
        try emailField.setInput("test@example.com")
        
        // パスワード入力
        let passwordField = try inspection.find(ViewType.SecureField.self)
        try passwordField.setInput("password123")
        
        // サインインボタンをタップ
        let signInButton = try inspection.find(button: "サインイン")
        try signInButton.tap()
        
        // 非同期処理が完了するまで待機
        try await Task.sleep(nanoseconds: 100_000_000) // 0.1秒待機
        
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
        let view = SignInScreen(viewModel: viewModel)
        
        // When - ViewInspectorでビューを検査して無効なメールを入力
        let inspection = try view.inspect()
        
        // 無効なメールアドレスを入力
        let emailField = try inspection.find(ViewType.TextField.self)
        try emailField.setInput("invalid-email")
        
        // パスワードを入力
        let passwordField = try inspection.find(ViewType.SecureField.self)
        try passwordField.setInput("password123")
        
        // Then - エラーメッセージが表示されることを確認
        let errorMessage = try inspection.find(text: "有効なメールアドレスを入力してください")
        #expect(try errorMessage.string() == "有効なメールアドレスを入力してください")
    }
    
    @Test("パスワードが短すぎる場合にエラーメッセージが表示される")
    @MainActor
    func test4() async throws {
        // Given - SignInScreenを準備
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        let view = SignInScreen(viewModel: viewModel)
        
        // When - ViewInspectorでビューを検査して短いパスワードを入力
        let inspection = try view.inspect()
        
        // メールアドレスを入力
        let emailField = try inspection.find(ViewType.TextField.self)
        try emailField.setInput("test@example.com")
        
        // 短すぎるパスワードを入力
        let passwordField = try inspection.find(ViewType.SecureField.self)
        try passwordField.setInput("123")
        
        // Then - エラーメッセージが表示されることを確認
        let errorMessage = try inspection.find(text: "パスワードは8文字以上必要です")
        #expect(try errorMessage.string() == "パスワードは8文字以上必要です")
    }
    
    @Test("APIエラー時にエラーメッセージが表示される")
    @MainActor
    func test5() async throws {
        // Given - APIエラーをモック
        let mockRepository = MockAuthRepository()
        mockRepository.signInResult = .failure(APIError.networkError("ネットワークエラーが発生しました"))
        
        let viewModel = SignInViewModel(repository: mockRepository)
        let view = SignInScreen(viewModel: viewModel)
        
        // When - ViewInspectorでビューを検査して有効な入力を行い、サインインを実行
        let inspection = try view.inspect()
        
        // メールアドレスを入力
        let emailField = try inspection.find(ViewType.TextField.self)
        try emailField.setInput("test@example.com")
        
        // パスワードを入力
        let passwordField = try inspection.find(ViewType.SecureField.self)
        try passwordField.setInput("password123")
        
        // サインインボタンをタップ
        let signInButton = try inspection.find(button: "サインイン")
        try signInButton.tap()
        
        // 非同期処理が完了するまで待機
        try await Task.sleep(nanoseconds: 100_000_000) // 0.1秒待機
        
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
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        let view = SignInScreen(viewModel: viewModel)
        
        // When - ViewInspectorでビューを検査
        let inspection = try view.inspect()
        
        // Then - サインインボタンが無効状態であることを確認
        // PrimaryButtonのisEnabledがfalseになっているはず
        let signInButton = try inspection.find(button: "サインイン")
        #expect(signInButton != nil)
        
        // フォームが空の状態でボタンが無効になっていることを確認
        // （ViewModelのisValidがfalseのため、PrimaryButtonのisEnabledもfalse）
        #expect(viewModel.form.isValid == false)
        
        // 実際にボタンをタップしようとするとエラーになることを確認（ボタンが無効化されている）
        do {
            try signInButton.tap()
            #expect(Bool(false), "ボタンが無効なのにタップできてしまった")
        } catch {
            // 期待通り：ボタンが無効化されているため、タップできない
            #expect(error.localizedDescription.contains("disabled"))
        }
        
        // signInが呼ばれていないことを確認
        #expect(mockRepository.signInCalled == false)
    }
}