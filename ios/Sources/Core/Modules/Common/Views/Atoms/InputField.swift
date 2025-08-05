import SwiftUI

public struct InputField: View {
    public let title: String
    @Binding var text: String
    public var error: String?
    public var placeholder: String = ""
    public var isEmail: Bool = false
    public var isSecure: Bool = false
    
    public init(
        title: String,
        text: Binding<String>,
        error: String? = nil,
        placeholder: String = "",
        isEmail: Bool = false,
        isSecure: Bool = false
    ) {
        self.title = title
        self._text = text
        self.error = error
        self.placeholder = placeholder
        self.isEmail = isEmail
        self.isSecure = isSecure
    }
    
    public var body: some View {
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
                    #if os(iOS)
                    .autocapitalization(isEmail ? .none : .sentences)
                    .keyboardType(isEmail ? .emailAddress : .default)
                    #endif
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
            isEmail: true
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