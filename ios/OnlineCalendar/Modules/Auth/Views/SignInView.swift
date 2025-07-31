import SwiftUI

struct SignInView: View {
    @StateObject private var viewModel = SignInViewModel()
    @State private var signInTask: Task<Void, Error>?
    
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
private extension SignInView {
    
    var HeaderSection: some View {
        Text("オンラインカレンダー")
            .font(.largeTitle)
            .fontWeight(.bold)
    }
    
    @ViewBuilder
    var FormSection: some View {
        EmailField
        PasswordField
        ErrorMessage
        SignInButton
    }
    
    var EmailField: some View {
        VStack(alignment: .leading, spacing: 4) {
            TextField("メールアドレス", text: $viewModel.form.email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
                .overlay(
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(
                            viewModel.form.emailError != nil ? Color.red : Color.clear,
                            lineWidth: 1
                        )
                )
            
            if let error = viewModel.form.emailError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
    
    var PasswordField: some View {
        VStack(alignment: .leading, spacing: 4) {
            SecureField("パスワード", text: $viewModel.form.password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .overlay(
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(
                            viewModel.form.passwordError != nil ? Color.red : Color.clear,
                            lineWidth: 1
                        )
                )
            
            if let error = viewModel.form.passwordError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
    
    @ViewBuilder
    var ErrorMessage: some View {
        if let error = viewModel.errorMessage {
            Text(error)
                .foregroundColor(.red)
                .font(.caption)
        }
    }
    
    var SignInButton: some View {
        Button(action: {
            signInTask = Task {
                try await viewModel.signIn()
            }
        }) {
            Text("サインイン")
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(viewModel.form.isValid ? Color.blue : Color.gray)
        .foregroundColor(.white)
        .cornerRadius(10)
        .disabled(!viewModel.form.isValid || signInTask != nil)
        .animation(.easeInOut(duration: 0.2), value: viewModel.form.isValid)
    }
}

#Preview {
    SignInView()
}