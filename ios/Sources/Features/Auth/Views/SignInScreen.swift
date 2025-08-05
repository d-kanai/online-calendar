import SwiftUI
import Core

public struct SignInScreen: View {
    @ObservedObject var viewModel: SignInViewModel
    @State private var signInTask: Task<Void, Error>?
    
    public init(viewModel: SignInViewModel? = nil) {
        self.viewModel = viewModel ?? SignInViewModel()
    }
    
    public var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            SignInHeaderView()
            
            SignInFormView(
                form: viewModel.form,
                onSignIn: {
                    signInTask = Task {
                        try await viewModel.signIn()
                    }
                },
                isLoading: signInTask != nil
            )
            .padding(.horizontal, 40)
            
            ErrorMessage(message: viewModel.errorMessage)
                .padding(.horizontal, 40)
            
            Spacer()
        }
        .overlay {
            SignInLoadingOverlay(isLoading: signInTask != nil)
        }
        .signInErrorAlert(
            errorMessage: viewModel.errorMessage,
            clearError: viewModel.clearError
        )
    }
}

#Preview {
    SignInScreen()
}