import SwiftUI

struct HomeErrorView: View {
    let message: String
    let onRetry: () -> Void
    
    init(message: String, onRetry: @escaping () -> Void) {
        self.message = message
        self.onRetry = onRetry
    }
    
    var body: some View {
        VStack(spacing: 20) {
            ErrorIcon
            MessageText
            RetryButton
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - Components
private extension HomeErrorView {
    var ErrorIcon: some View {
        Image(systemName: "exclamationmark.triangle")
            .font(.system(size: 48))
            .foregroundColor(.orange)
    }
    
    var MessageText: some View {
        VStack(spacing: 8) {
            Text("読み込みに失敗しました")
                .font(.headline)
                .foregroundColor(.primary)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }
    
    var RetryButton: some View {
        Button("再試行", action: onRetry)
            .foregroundColor(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(Color.blue)
            .cornerRadius(8)
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("エラー表示") {
    HomeErrorView(
        message: "ネットワークエラーが発生しました",
        onRetry: {}
    )
    .frame(height: 400)
    .padding()
}

#Preview("長いエラーメッセージ") {
    HomeErrorView(
        message: "サーバーに接続できませんでした。インターネット接続を確認して、再度お試しください。",
        onRetry: {}
    )
    .frame(height: 400)
    .padding()
}

#Preview("ダークモード") {
    HomeErrorView(
        message: "データの取得に失敗しました",
        onRetry: {}
    )
    .frame(height: 400)
    .padding()
    .preferredColorScheme(.dark)
}
#endif