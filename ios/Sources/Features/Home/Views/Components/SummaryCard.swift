import SwiftUI

struct SummaryCard: View {
    let title: String
    let systemImage: String
    let value: String?
    let isLoading: Bool
    let onTap: () -> Void
    
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
            .padding()
            .background(CardBackground)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Components
private extension SummaryCard {
    var ContentSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            TitleLabel
            ValueText
        }
    }
    
    var TitleLabel: some View {
        Label(title, systemImage: systemImage)
            .font(.headline)
            .foregroundColor(.primary)
    }
    
    @ViewBuilder
    var ValueText: some View {
        if isLoading {
            ProgressView()
                .scaleEffect(0.8)
                .frame(maxWidth: .infinity, alignment: .leading)
        } else if let value = value {
            Text(value)
                .font(.title.weight(.semibold))
                .foregroundColor(.primary)
        } else {
            Text("-")
                .font(.title)
                .foregroundColor(.secondary)
        }
    }
    
    var ChevronIcon: some View {
        Image(systemName: "chevron.right")
            .foregroundColor(.secondary)
    }
    
    var CardBackground: some View {
        Color.gray.opacity(0.1)
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