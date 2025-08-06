import Foundation
import Core

public class HomeRepository {
    private let apiClient = APIClient.shared
    
    public init() {}
    
    public func fetchHomeSummary() async throws -> HomeSummary {
        // TODO: Replace with actual API endpoint
        // For now, return mock data
        
        // Simulate API delay
        try await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        
        // Mock data
        let nextMeeting = Meeting(
            id: "1",
            title: "デザインレビュー",
            startTime: Date().addingTimeInterval(30 * 60) // 30 minutes from now
        )
        
        return HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: nextMeeting,
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
    }
}