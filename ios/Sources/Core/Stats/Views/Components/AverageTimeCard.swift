import SwiftUI

struct AverageTimeCard: View {
    let averageMinutes: Double
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "clock.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
                Text("1日あたりの平均会議時間")
                    .font(.headline)
                    .foregroundColor(.secondary)
            }
            
            Text(formattedTime)
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
                .accessibilityIdentifier("daily-average-time")
            
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(30)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
        )
    }
    
    private var formattedTime: String {
        String(format: "%.1f分", averageMinutes)
    }
    
    private var subtitle: String {
        let hours = Int(averageMinutes) / 60
        let minutes = Int(averageMinutes) % 60
        
        if hours > 0 {
            return "約\(hours)時間\(minutes > 0 ? "\(minutes)分" : "")"
        } else {
            return "1日の会議時間"
        }
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("標準的な時間") {
    AverageTimeCard(averageMinutes: 125.5)
        .padding()
}

#Preview("短時間") {
    AverageTimeCard(averageMinutes: 30.0)
        .padding()
}

#Preview("長時間") {
    AverageTimeCard(averageMinutes: 180.0)
        .padding()
}

#Preview("ゼロ時間") {
    AverageTimeCard(averageMinutes: 0.0)
        .padding()
}

#Preview("1時間以上") {
    AverageTimeCard(averageMinutes: 95.5)
        .padding()
}

#endif