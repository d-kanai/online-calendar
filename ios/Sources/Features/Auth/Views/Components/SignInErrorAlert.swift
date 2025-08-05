import SwiftUI

struct SignInErrorAlert: ViewModifier {
    let errorMessage: String?
    let clearError: () -> Void
    
    func body(content: Content) -> some View {
        content
            .alert("エラー", isPresented: .constant(errorMessage != nil)) {
                Button("OK") {
                    clearError()
                }
            } message: {
                if let error = errorMessage {
                    Text(error)
                }
            }
    }
}

extension View {
    func signInErrorAlert(errorMessage: String?, clearError: @escaping () -> Void) -> some View {
        modifier(SignInErrorAlert(errorMessage: errorMessage, clearError: clearError))
    }
}