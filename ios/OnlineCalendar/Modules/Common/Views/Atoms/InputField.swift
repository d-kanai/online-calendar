import SwiftUI

struct InputField: View {
    let title: String
    @Binding var text: String
    var error: String?
    var placeholder: String = ""
    var keyboardType: UIKeyboardType = .default
    var autocapitalization: UITextAutocapitalizationType = .sentences
    var isSecure: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if isSecure {
                SecureField(placeholder.isEmpty ? title : placeholder, text: $text)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .overlay(
                        RoundedRectangle(cornerRadius: 5)
                            .stroke(
                                error != nil ? Color.red : Color.clear,
                                lineWidth: 1
                            )
                    )
            } else {
                TextField(placeholder.isEmpty ? title : placeholder, text: $text)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(autocapitalization)
                    .keyboardType(keyboardType)
                    .overlay(
                        RoundedRectangle(cornerRadius: 5)
                            .stroke(
                                error != nil ? Color.red : Color.clear,
                                lineWidth: 1
                            )
                    )
            }
            
            ErrorMessage(message: error)
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        InputField(
            title: "メールアドレス",
            text: .constant("test@example.com"),
            keyboardType: .emailAddress,
            autocapitalization: .none
        )
        
        InputField(
            title: "パスワード",
            text: .constant(""),
            error: "パスワードは8文字以上必要です",
            isSecure: true
        )
    }
    .padding()
}