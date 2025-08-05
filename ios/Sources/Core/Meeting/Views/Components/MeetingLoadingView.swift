import SwiftUI

struct MeetingLoadingView: View {
    @State private var isAnimating = false
    let message: String
    
    init(message: String = "会議データを読み込んでいます...") {
        self.message = message
    }
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 3)
                    .frame(width: 24, height: 24)
                
                Circle()
                    .trim(from: 0, to: 0.7)
                    .stroke(
                        LinearGradient(
                            colors: [.blue, .blue.opacity(0.5)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 3, lineCap: .round)
                    )
                    .frame(width: 24, height: 24)
                    .rotationEffect(Angle(degrees: isAnimating ? 360 : 0))
                    .animation(
                        Animation.linear(duration: 1)
                            .repeatForever(autoreverses: false),
                        value: isAnimating
                    )
            }
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
        }
        .padding()
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("デフォルト") {
    MeetingLoadingView()
}

#Preview("カスタムメッセージ") {
    MeetingLoadingView(message: "会議スケジュールを同期中...")
}

#Preview("短いメッセージ") {
    MeetingLoadingView(message: "読み込み中...")
}

#Preview("更新メッセージ") {
    MeetingLoadingView(message: "最新の会議情報を取得中...")
}

#Preview("リスト内表示") {
    List {
        MeetingLoadingView()
        MeetingLoadingView(message: "参加者情報を確認中...")
    }
}

#Preview("センター配置") {
    VStack {
        Spacer()
        HStack {
            Spacer()
            MeetingLoadingView()
            Spacer()
        }
        Spacer()
    }
}

#Preview("カード内表示") {
    MeetingLoadingView()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.1), radius: 5)
        )
        .padding()
}

#endif