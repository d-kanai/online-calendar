import SwiftUI

struct StatsErrorView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(.orange)
            
            Text("エラーが発生しました")
                .font(.title3)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("ネットワークエラー") {
    StatsErrorView(message: "ネットワークに接続できませんでした。インターネット接続を確認してください。")
}

#Preview("APIエラー") {
    StatsErrorView(message: "統計データの取得に失敗しました。しばらく時間をおいて再度お試しください。")
}

#Preview("認証エラー") {
    StatsErrorView(message: "認証が必要です。再度ログインしてください。")
}

#Preview("短いメッセージ") {
    StatsErrorView(message: "エラーが発生しました")
}

#Preview("長いメッセージ") {
    StatsErrorView(message: "サーバーでエラーが発生しました。この問題が継続する場合は、システム管理者にお問い合わせください。エラーコード: 500 - Internal Server Error")
}

#endif