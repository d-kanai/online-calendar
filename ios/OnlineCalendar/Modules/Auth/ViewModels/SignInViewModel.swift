import Foundation
import SwiftUI

@MainActor
class SignInViewModel: ObservableObject {
    // MARK: - Form
    @Published var form = SignInForm()
    
    // MARK: - UI State
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // MARK: - Computed Properties
    var signInButtonTitle: String {
        isLoading ? "サインイン中..." : "サインイン"
    }
    
    // MARK: - Dependencies
    private let repository: AuthRepositoryProtocol
    private let authManager = AuthManager.shared
    
    // MARK: - Initialization
    init(repository: AuthRepositoryProtocol = AuthRepository()) {
        self.repository = repository
    }
    
    // MARK: - Actions
    func signIn() async {
        guard form.isValid else {
            errorMessage = "メールアドレスとパスワードを正しく入力してください"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let (email, password) = form.formData
            let response = try await repository.signIn(email: email, password: password)
            authManager.setSession(token: response.token, user: response.user)
            print("✅ [SignInViewModel] Sign in successful")
        } catch {
            errorMessage = error.localizedDescription
            print("❌ [SignInViewModel] Sign in failed: \(error)")
        }
        
        isLoading = false
    }
    
    // MARK: - Helper Methods
    func clearError() {
        errorMessage = nil
    }
}