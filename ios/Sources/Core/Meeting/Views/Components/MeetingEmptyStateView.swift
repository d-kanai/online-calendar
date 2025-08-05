import SwiftUI

struct MeetingEmptyStateView: View {
    let message: String
    let systemImage: String
    
    init(message: String = "会議がありません", systemImage: String = "calendar.badge.exclamationmark") {
        self.message = message
        self.systemImage = systemImage
    }
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: systemImage)
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text(message)
                .font(.headline)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("デフォルト") {
    MeetingEmptyStateView()
}

#Preview("カスタムメッセージ") {
    MeetingEmptyStateView(
        message: "本日の会議は予定されていません",
        systemImage: "calendar.circle"
    )
}

#Preview("検索結果なし") {
    MeetingEmptyStateView(
        message: "検索条件に一致する会議が見つかりません",
        systemImage: "magnifyingglass"
    )
}

#Preview("過去の会議なし") {
    MeetingEmptyStateView(
        message: "過去の会議履歴がありません",
        systemImage: "clock.badge.questionmark"
    )
}

#Preview("ネットワークエラー") {
    MeetingEmptyStateView(
        message: "会議データを取得できませんでした",
        systemImage: "wifi.exclamationmark"
    )
}

#Preview("リスト内表示") {
    List {
        MeetingEmptyStateView()
    }
}

#Preview("カード内表示") {
    MeetingEmptyStateView()
        .padding(30)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
        )
        .padding()
}

#endif