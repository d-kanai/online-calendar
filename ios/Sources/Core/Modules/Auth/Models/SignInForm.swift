import Foundation
import Combine

// MARK: - SignInForm
// フォームの状態とバリデーションロジックを管理
public class SignInForm: ObservableObject {
    
    // MARK: - Form Fields
    @Published public var email: String = ""
    @Published public var password: String = ""
    
    // MARK: - Computed Properties
    public var isValid: Bool {
        !email.isEmpty && email.contains("@") && password.count >= 8
    }
    
    public var emailError: String? {
        guard !email.isEmpty else { return nil }
        guard email.contains("@") else { return "有効なメールアドレスを入力してください" }
        return nil
    }
    
    public var passwordError: String? {
        guard !password.isEmpty else { return nil }
        guard password.count >= 8 else { return "パスワードは8文字以上必要です" }
        return nil
    }
    
    // MARK: - Actions
    public func reset() {
        email = ""
        password = ""
    }
    
    // MARK: - Form Data
    public var formData: (email: String, password: String) {
        (email: email, password: password)
    }
}