import SwiftUI

struct DailyBreakdownCard: View {
    let weeklyData: [DailyMeetingMinutes]
    @State private var selectedDay: Int? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "calendar.badge.clock")
                    .font(.title2)
                    .foregroundColor(.purple)
                Text("日別の詳細")
                    .font(.headline)
            }
            
            VStack(spacing: 8) {
                ForEach(weeklyData.indices, id: \.self) { index in
                    DayRow(
                        data: weeklyData[index],
                        isSelected: selectedDay == index
                    )
                    .onTapGesture {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedDay = selectedDay == index ? nil : index
                        }
                    }
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
        )
    }
}

struct DayRow: View {
    let data: DailyMeetingMinutes
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Circle()
                    .fill(dayColor)
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(data.dayName)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                    )
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(formattedDate)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(formattedTime)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                if data.totalMinutes > 0 {
                    Image(systemName: isSelected ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 8)
            
            if isSelected && data.totalMinutes > 0 {
                HStack {
                    Text("会議の合計時間")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(detailedTime)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .padding(.top, 8)
                .transition(.opacity)
            }
        }
        .padding(.horizontal, 4)
    }
    
    private var dayColor: Color {
        switch data.totalMinutes {
        case 0:
            return .gray.opacity(0.5)
        case 1..<60:
            return .blue
        case 60..<120:
            return .green
        case 120..<180:
            return .orange
        default:
            return .red
        }
    }
    
    private var formattedDate: String {
        let components = data.date.split(separator: "-")
        if components.count >= 3 {
            return "\(components[1])月\(components[2])日"
        }
        return data.date
    }
    
    private var formattedTime: String {
        if data.totalMinutes == 0 {
            return "会議なし"
        }
        let hours = data.totalMinutes / 60
        let mins = data.totalMinutes % 60
        
        if hours > 0 && mins > 0 {
            return "\(hours)時間\(mins)分"
        } else if hours > 0 {
            return "\(hours)時間"
        } else {
            return "\(mins)分"
        }
    }
    
    private var detailedTime: String {
        let hours = data.totalMinutes / 60
        let mins = data.totalMinutes % 60
        return String(format: "%d時間%02d分", hours, mins)
    }
}