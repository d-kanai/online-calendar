import SwiftUI
import Core

struct HomeHeaderView: View {
    let userName: String?
    @Themed private var theme
    
    init(userName: String? = nil) {
        self.userName = userName
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.small) {
            CurrentDateText
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, theme.spacing.medium)
        .padding(.top, theme.spacing.large)
    }
}

// MARK: - Components
private extension HomeHeaderView {
    var CurrentDateText: some View {
        Text(Date(), style: .date)
            .font(theme.font(.subheadline))
            .foregroundColor(Color.secondary)
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