import SwiftUI

struct HomeHeaderView: View {
    let userName: String?
    
    init(userName: String? = nil) {
        self.userName = userName
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            GreetingText
            CurrentDateText
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal)
        .padding(.top, 20)
    }
}

// MARK: - Components
private extension HomeHeaderView {
    var GreetingText: some View {
        Group {
            if let userName = userName {
                Text("こんにちは、\(userName)さん")
            } else {
                Text("こんにちは")
            }
        }
        .font(.largeTitle.bold())
    }
    
    var CurrentDateText: some View {
        Text(Date(), style: .date)
            .font(.subheadline)
            .foregroundColor(.secondary)
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("ユーザー名あり") {
    HomeHeaderView(userName: "田中太郎")
        .padding()
}

#Preview("ユーザー名なし") {
    HomeHeaderView()
        .padding()
}

#Preview("ダークモード") {
    HomeHeaderView(userName: "山田花子")
        .padding()
        .preferredColorScheme(.dark)
}
#endif