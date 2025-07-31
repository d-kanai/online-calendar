import SwiftUI

struct SignInView: View {
    @StateObject private var viewModel = SignInViewModel()
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Text("オンラインカレンダー")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 15) {
                // Email入力
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
                
                // Password入力
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
                
                // 一般的なエラーメッセージ
                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
                
                // サインインボタン
                Button(action: {
                    Task {
                        await viewModel.signIn()
                    }
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text(viewModel.signInButtonTitle)
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(viewModel.form.isValid ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(!viewModel.form.isValid || viewModel.isLoading)
                .animation(.easeInOut(duration: 0.2), value: viewModel.form.isValid)
            }
            .padding(.horizontal, 40)
        }
    }
}

#Preview {
    SignInView()
}