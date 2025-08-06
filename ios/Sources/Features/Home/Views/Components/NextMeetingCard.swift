import SwiftUI

struct NextMeetingCard: View {
    let meeting: Meeting
    
    private var timeUntilMeeting: String {
        let interval = meeting.startTime.timeIntervalSinceNow
        let minutes = Int(interval / 60)
        
        if minutes < 0 {
            return "開催中"
        } else if minutes == 0 {
            return "まもなく開始"
        } else if minutes < 60 {
            return "\(minutes)分後"
        } else {
            let hours = minutes / 60
            return "\(hours)時間後"
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("次の会議", systemImage: "clock")
                    .font(.headline)
                    .foregroundColor(.orange)
                
                Spacer()
                
                Text(timeUntilMeeting)
                    .font(.subheadline)
                    .foregroundColor(.orange)
                    .fontWeight(.semibold)
            }
            
            Text(meeting.title)
                .font(.title3)
                .fontWeight(.medium)
            
            Text(meeting.startTime, style: .time)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
    }
}

// MARK: - Preview

#Preview("次の会議カード") {
    VStack(spacing: 16) {
        NextMeetingCard(meeting: Meeting(
            id: "1",
            title: "デザインレビュー",
            startTime: Date().addingTimeInterval(30 * 60) // 30分後
        ))
        
        NextMeetingCard(meeting: Meeting(
            id: "2",
            title: "開催中の会議",
            startTime: Date().addingTimeInterval(-10 * 60) // 10分前
        ))
        
        NextMeetingCard(meeting: Meeting(
            id: "3",
            title: "まもなく開始",
            startTime: Date() // 現在時刻
        ))
        
        NextMeetingCard(meeting: Meeting(
            id: "4",
            title: "午後の会議",
            startTime: Date().addingTimeInterval(120 * 60) // 2時間後
        ))
    }
    .padding()
}