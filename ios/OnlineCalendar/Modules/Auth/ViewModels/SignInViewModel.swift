import Foundation
import SwiftUI

@MainActor
class SignInViewModel: ObservableObject {
    // MARK: - Form
    @Published var form = SignInForm()
    
    // MARK: - UI State
    @Published var errorMessage: String?
    
    // MARK: - Dependencies
    private let repository: AuthRepositoryProtocol
    private let authState = AuthState.shared
    
    // MARK: - Initialization
    init(repository: AuthRepositoryProtocol = AuthRepository()) {
        self.repository = repository
    }
    
    // MARK: - Actions
    func signIn() async throws {
        guard form.isValid else {
            errorMessage = "メールアドレスとパスワードを正しく入力してください"
            throw ValidationError.invalidForm
        }
        
        errorMessage = nil
        
        do {
            let (email, password) = form.formData
            let response = try await repository.signIn(email: email, password: password)
            authState.setSession(token: response.token, user: response.user)
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    // MARK: - Helper Methods
    func clearError() {
        errorMessage = nil
    }
}

// MARK: - Validation Error
enum ValidationError: LocalizedError {
    case invalidForm
    
    var errorDescription: String? {
        switch self {
        case .invalidForm:
            return "入力内容を確認してください"
        }
    }
}