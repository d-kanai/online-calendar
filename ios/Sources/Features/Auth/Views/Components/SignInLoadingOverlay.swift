import SwiftUI

struct SignInLoadingOverlay: View {
    let isLoading: Bool
    
    var body: some View {
        if isLoading {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
                .overlay {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.5)
                }
        }
    }
}