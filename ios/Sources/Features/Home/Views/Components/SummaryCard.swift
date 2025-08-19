import SwiftUI
import Core

struct SummaryCard: View {
    let title: String
    let systemImage: String
    let value: String?
    let isLoading: Bool
    let onTap: () -> Void
    
    @Themed private var theme
    
    init(
        title: String,
        systemImage: String,
        value: String? = nil,
        isLoading: Bool = false,
        onTap: @escaping () -> Void
    ) {
        self.title = title
        self.systemImage = systemImage
        self.value = value
        self.isLoading = isLoading
        self.onTap = onTap
    }
    
    var body: some View {
        Button(action: onTap) {
            HStack {
                ContentSection
                Spacer()
                ChevronIcon
            }
            .padding(theme.spacing.medium)
            .background(CardBackground)
            .cornerRadius(theme.radius.large)
            .shadow(
                color: Color.black.opacity(0.1),
                radius: 4,
                x: 0,
                y: 2
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Components
private extension SummaryCard {
    var ContentSection: some View {
        VStack(alignment: .leading, spacing: theme.spacing.small) {
            TitleLabel
            ValueText
        }
    }
    
    var TitleLabel: some View {
        Label(title, systemImage: systemImage)
            .font(theme.font(.headline))
            .foregroundColor(theme.primaryColor)
    }
    
    @ViewBuilder
    var ValueText: some View {
        if isLoading {
            ProgressView()
                .scaleEffect(0.8)
                .frame(maxWidth: .infinity, alignment: .leading)
        } else if let value = value {
            Text(value)
                .font(theme.font(.title))
                .fontWeight(.semibold)
                .foregroundColor(Color.primary)
        } else {
            Text("-")
                .font(theme.font(.title))
                .foregroundColor(Color.secondary)
        }
    }
    
    var ChevronIcon: some View {
        Image(systemName: "chevron.right")
            .foregroundColor(Color.secondary)
    }
    
    var CardBackground: some View {
        theme.surfaceColor
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("データあり") {
    VStack(spacing: 16) {
        SummaryCard(
            title: "今日の会議",
            systemImage: "calendar",
            value: "3件",
            onTap: {}
        )
        
        SummaryCard(
            title: "今週の会議時間",
            systemImage: "chart.bar",
            value: "12.5時間",
            onTap: {}
        )
    }
    .padding()
}

#Preview("ローディング中") {
    VStack(spacing: 16) {
        SummaryCard(
            title: "今日の会議",
            systemImage: "calendar",
            isLoading: true,
            onTap: {}
        )
        
        SummaryCard(
            title: "今週の会議時間",
            systemImage: "chart.bar",
            isLoading: true,
            onTap: {}
        )
    }
    .padding()
}

#Preview("データなし") {
    VStack(spacing: 16) {
        SummaryCard(
            title: "今日の会議",
            systemImage: "calendar",
            onTap: {}
        )
        
        SummaryCard(
            title: "今週の会議時間",
            systemImage: "chart.bar",
            onTap: {}
        )
    }
    .padding()
}

#Preview("ダークモード") {
    VStack(spacing: 16) {
        SummaryCard(
            title: "今日の会議",
            systemImage: "calendar",
            value: "5件",
            onTap: {}
        )
        
        SummaryCard(
            title: "今週の会議時間",
            systemImage: "chart.bar",
            value: "18.0時間",
            onTap: {}
        )
    }
    .padding()
    .preferredColorScheme(.dark)
}

#Preview("iPad") {
    VStack(spacing: 16) {
        SummaryCard(
            title: "今日の会議",
            systemImage: "calendar",
            value: "2件",
            onTap: {}
        )
        
        SummaryCard(
            title: "今週の会議時間",
            systemImage: "chart.bar",
            value: "8.5時間",
            onTap: {}
        )
    }
    .padding()
}
#endif