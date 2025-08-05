import SwiftUI

struct SimpleBarChart: View {
    let weeklyData: [DailyMeetingMinutes]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "chart.bar.fill")
                    .font(.title2)
                    .foregroundColor(.green)
                Text("過去7日間の会議時間")
                    .font(.headline)
                
                Spacer()
                
                Text("週合計: \(formattedWeekTotal)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(Array(weeklyData.enumerated()), id: \.offset) { index, data in
                    VStack(spacing: 4) {
                        // 時間表示
                        if data.totalMinutes > 0 {
                            Text(formatMinutes(data.totalMinutes))
                                .font(.caption2)
                                .foregroundColor(.secondary)
                                .lineLimit(1)
                        } else {
                            Text(" ")
                                .font(.caption2)
                        }
                        
                        // バー
                        RoundedRectangle(cornerRadius: 4)
                            .fill(barColor(for: data))
                            .frame(height: barHeight(for: data))
                            .frame(maxWidth: .infinity)
                        
                        // 曜日
                        Text(data.dayName)
                            .font(.caption)
                            .foregroundColor(.primary)
                    }
                }
            }
            .frame(height: 150)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
        )
    }
    
    private func barHeight(for data: DailyMeetingMinutes) -> CGFloat {
        let maxMinutes = weeklyData.map { $0.totalMinutes }.max() ?? 1
        guard maxMinutes > 0 else { return 0 }
        let ratio = CGFloat(data.totalMinutes) / CGFloat(maxMinutes)
        return max(2, ratio * 100) // 最小2ポイントの高さを保証
    }
    
    private func barColor(for data: DailyMeetingMinutes) -> Color {
        switch data.totalMinutes {
        case 0:
            return .gray.opacity(0.3)
        case 1..<60:
            return .blue.opacity(0.7)
        case 60..<120:
            return .blue
        case 120..<180:
            return .orange
        default:
            return .red
        }
    }
    
    private func formatMinutes(_ minutes: Int) -> String {
        let hours = minutes / 60
        let mins = minutes % 60
        
        if hours > 0 && mins > 0 {
            return "\(hours)時間\(mins)分"
        } else if hours > 0 {
            return "\(hours)時間"
        } else if mins > 0 {
            return "\(mins)分"
        } else {
            return "0分"
        }
    }
    
    private var formattedWeekTotal: String {
        let totalMinutes = weeklyData.reduce(0) { $0 + $1.totalMinutes }
        let hours = totalMinutes / 60
        return "\(hours)時間"
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("標準的な週") {
    SimpleBarChart(weeklyData: [
        DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 120),
        DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 60),
        DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 180),
        DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 90),
        DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 150),
        DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 30),
        DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 45)
    ])
    .padding()
}

#Preview("忙しい週") {
    SimpleBarChart(weeklyData: [
        DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 300),
        DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 240),
        DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 360),
        DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 180),
        DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 420),
        DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 120),
        DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 60)
    ])
    .padding()
}

#Preview("軽い週") {
    SimpleBarChart(weeklyData: [
        DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 30),
        DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 15),
        DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 45),
        DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 60),
        DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 30)
    ])
    .padding()
}

#Preview("会議のない週") {
    SimpleBarChart(weeklyData: [
        DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 0),
        DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 0)
    ])
    .padding()
}

#Preview("変動の大きい週") {
    SimpleBarChart(weeklyData: [
        DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 5),
        DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 360),
        DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 15),
        DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 480),
        DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 30),
        DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 0),
        DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 240)
    ])
    .padding()
}

#endif
