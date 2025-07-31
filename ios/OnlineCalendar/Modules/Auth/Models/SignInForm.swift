import Foundation
import Combine

// MARK: - SignInForm
// フォームの状態とバリデーションロジックを管理
class SignInForm: ObservableObject {
    
    // MARK: - Form Fields
    @Published var email: String = ""
    @Published var password: String = ""
    
    // MARK: - Computed Properties
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
    
    // MARK: - Actions
    func reset() {
        email = ""
        password = ""
    }
    
    // MARK: - Form Data
    var formData: (email: String, password: String) {
        (email: email, password: password)
    }
}