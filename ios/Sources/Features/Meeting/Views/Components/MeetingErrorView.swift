import SwiftUI

public struct MeetingErrorView: View {
    public let message: String
    public let systemImage: String
    public let onRetry: (() -> Void)?
    
    public init(message: String, systemImage: String = "exclamationmark.triangle", onRetry: (() -> Void)? = nil) {
        self.message = message
        self.systemImage = systemImage
        self.onRetry = onRetry
    }
    
    public var body: some View {
        VStack(spacing: 16) {
            Image(systemName: systemImage)
                .font(.system(size: 48))
                .foregroundColor(.red)
            
            Text("エラーが発生しました")
                .font(.headline)
                .foregroundColor(.primary)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            if let onRetry = onRetry {
                Button("再試行") {
                    onRetry()
                }
                .buttonStyle(.borderedProminent)
                .padding(.top, 8)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("ネットワークエラー") {
    MeetingErrorView(
        message: "ネットワークに接続できませんでした。インターネット接続を確認してください。",
        systemImage: "wifi.exclamationmark"
    )
}

#Preview("APIエラー") {
    MeetingErrorView(
        message: "会議データの取得に失敗しました。しばらく時間をおいて再度お試しください。",
        onRetry: {}
    )
}

#Preview("認証エラー") {
    MeetingErrorView(
        message: "認証が必要です。再度ログインしてください。",
        systemImage: "person.badge.key",
        onRetry: {}
    )
}

#Preview("権限エラー") {
    MeetingErrorView(
        message: "会議データにアクセスする権限がありません。管理者にお問い合わせください。",
        systemImage: "lock.shield"
    )
}

#Preview("サーバーエラー") {
    MeetingErrorView(
        message: "サーバーで一時的な問題が発生しています。しばらく時間をおいて再度お試しください。",
        systemImage: "server.rack",
        onRetry: {}
    )
}

#Preview("短いメッセージ") {
    MeetingErrorView(message: "エラーが発生しました")
}

#Preview("長いメッセージ") {
    MeetingErrorView(
        message: "予期しないエラーが発生しました。この問題が継続する場合は、アプリを再起動するか、システム管理者にお問い合わせください。エラーコード: MEETING_FETCH_ERROR_500",
        onRetry: {}
    )
}

#Preview("リスト内表示") {
    List {
        MeetingErrorView(
            message: "会議データの読み込みに失敗しました",
            onRetry: {}
        )
    }
}

#Preview("カード内表示") {
    MeetingErrorView(
        message: "ネットワークエラーが発生しました",
        systemImage: "wifi.slash",
        onRetry: {}
    )
    .padding(20)
    .background(
        RoundedRectangle(cornerRadius: 16)
            .fill(Color.white)
            .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
    )
    .padding()
}

#endif