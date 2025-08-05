import SwiftUI
import Core

struct SignInFormView: View {
    @ObservedObject var form: SignInForm
    let onSignIn: () -> Void
    let isLoading: Bool
    
    var body: some View {
        VStack(spacing: 15) {
            InputField(
                title: "メールアドレス",
                text: $form.email,
                error: form.emailError,
                isEmail: true
            )
            
            InputField(
                title: "パスワード",
                text: $form.password,
                error: form.passwordError,
                isSecure: true
            )
            
            PrimaryButton(
                title: "サインイン",
                action: onSignIn,
                isEnabled: form.isValid,
                isLoading: isLoading
            )
        }
    }
}