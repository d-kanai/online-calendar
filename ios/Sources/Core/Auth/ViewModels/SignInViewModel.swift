import Foundation
import SwiftUI

@MainActor
public class SignInViewModel: ObservableObject {
    // MARK: - Form
    @Published public var form = SignInForm()
    
    // MARK: - UI State
    @Published public var errorMessage: String?
    
    // MARK: - Dependencies
    private let repository: AuthRepositoryProtocol
    private let authState = AuthState.shared
    
    // MARK: - Initialization
    public init(repository: AuthRepositoryProtocol = AuthRepository()) {
        self.repository = repository
    }
    
    // MARK: - Actions
    @available(iOS 15.0, macOS 12.0, *)
    public func signIn() async throws {
        guard form.isValid else {
            let error = ValidationError.invalidForm
            errorMessage = error.localizedDescription
            throw error
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
    public func clearError() {
        errorMessage = nil
    }
}

// MARK: - Validation Error
enum ValidationError: LocalizedError, Equatable {
    case invalidForm
    
    var errorDescription: String? {
        switch self {
        case .invalidForm:
            return "メールアドレスとパスワードを正しく入力してください"
        }
    }
}