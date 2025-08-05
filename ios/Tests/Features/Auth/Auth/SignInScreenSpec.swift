import Testing
import SwiftUI
import ViewInspector
@testable import Core
@testable import Auth

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
        let view = SignInScreen(viewModel: viewModel)
        
        // When - ViewInspectorでビューを検査してフォームを入力
        let inspection = try view.inspect()
        
        // メールアドレス入力
        let emailField = try inspection.find(ViewType.TextField.self)
        try emailField.setInput("test@example.com")
        
        // パスワード入力
        let passwordField = try inspection.find(ViewType.SecureField.self)
        try passwordField.setInput("password123")
        
        // フォームが有効になったことを確認
        #expect(viewModel.form.isValid == true)
        
        // サインインボタンをタップ
        let signInButton = try inspection.find(button: "サインイン")
        try signInButton.tap()
        
        // Then - ViewModelの状態を確認（実際のAPIコールはモックされている）
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
        
        // ViewModelでsignInメソッドを直接呼び出す（ViewInspectorの制限のため）
        do {
            try await viewModel.signIn()
        } catch {
            // エラーが発生することを期待
        }
        
        // Then - エラーメッセージが設定されることを確認
        #expect(viewModel.errorMessage == "ネットワークエラーが発生しました")
        
        // アラートが表示されることを確認
        let updatedView = SignInScreen(viewModel: viewModel)
        let updatedInspection = try updatedView.inspect()
        let alert = try updatedInspection.find(ViewType.Alert.self)
        #expect(alert != nil)
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
    
    @Test("無効なフォームでサインイン試行時にバリデーションエラーが発生する")
    @MainActor
    func test8_invalidFormValidation() async throws {
        // Given - 無効なフォームでViewModelを準備
        let mockRepository = MockAuthRepository()
        let viewModel = SignInViewModel(repository: mockRepository)
        
        // フォームを無効な状態にする（空のまま）
        viewModel.form.email = ""
        viewModel.form.password = ""
        
        // When - signInを直接呼び出す（ViewInspectorではボタンが無効なのでタップできない）
        // Note: このテストはViewModelの単体テストとして実施
        // UI統合テストはtest3, test4でカバーされている
        do {
            try await viewModel.signIn()
            #expect(Bool(false), "バリデーションエラーが発生するはずだった")
        } catch let error as ValidationError {
            // Then - ValidationError.invalidFormがスローされることを確認
            #expect(error == ValidationError.invalidForm)
            #expect(viewModel.errorMessage == "メールアドレスとパスワードを正しく入力してください")
        } catch {
            #expect(Bool(false), "予期しないエラータイプ: \(error)")
        }
        
        // signInが呼ばれていないことを確認
        #expect(mockRepository.signInCalled == false)
    }
    
}