import SwiftUI

struct SignInScreen: View {
    @ObservedObject var viewModel: SignInViewModel
    @State private var signInTask: Task<Void, Error>?
    
    init(viewModel: SignInViewModel? = nil) {
        self.viewModel = viewModel ?? SignInViewModel()
    }
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            HeaderSection
            
            VStack(spacing: 15) {
                FormSection
            }
            .padding(.horizontal, 40)
            
            Spacer()
        }
        .overlay {
            if signInTask != nil {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                    .overlay {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                    }
            }
        }
        .alert("エラー", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.clearError()
            }
        } message: {
            if let error = viewModel.errorMessage {
                Text(error)
            }
        }
    }
}

// MARK: - View Components
private extension SignInScreen {
    
    var HeaderSection: some View {
        Text("オンラインカレンダー")
            .font(.largeTitle)
            .fontWeight(.bold)
    }
    
    @ViewBuilder
    var FormSection: some View {
        EmailField
        PasswordField
        ErrorMessageView
        SignInButton
    }
    
    var EmailField: some View {
        InputField(
            title: "メールアドレス",
            text: $viewModel.form.email,
            error: viewModel.form.emailError,
            keyboardType: .emailAddress,
            autocapitalization: .none
        )
    }
    
    var PasswordField: some View {
        InputField(
            title: "パスワード",
            text: $viewModel.form.password,
            error: viewModel.form.passwordError,
            isSecure: true
        )
    }
    
    var ErrorMessageView: some View {
        ErrorMessage(message: viewModel.errorMessage)
    }
    
    var SignInButton: some View {
        PrimaryButton(
            title: "サインイン",
            action: {
                signInTask = Task {
                    try await viewModel.signIn()
                }
            },
            isEnabled: viewModel.form.isValid,
            isLoading: signInTask != nil
        )
    }
}

#Preview {
    SignInScreen()
}