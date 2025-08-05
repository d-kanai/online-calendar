import Foundation

// MARK: - API Response Model
public struct MeetingStatsAPIResponse: Codable {
    public let success: Bool
    public let data: MeetingStatsResponse
}

public struct MeetingStatsResponse: Codable {
    public let averageDailyMinutes: Double
    public let weeklyData: [DailyMeetingMinutes]
    
    public init(averageDailyMinutes: Double, weeklyData: [DailyMeetingMinutes]) {
        self.averageDailyMinutes = averageDailyMinutes
        self.weeklyData = weeklyData
    }
}

public struct DailyMeetingMinutes: Codable {
    public let date: String
    public let dayName: String
    public let totalMinutes: Int
    
    public init(date: String, dayName: String, totalMinutes: Int) {
        self.date = date
        self.dayName = dayName
        self.totalMinutes = totalMinutes
    }
}