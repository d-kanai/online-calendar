import Foundation
import SwiftUI

@MainActor
public class MeetingStatsViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published public var averageDailyMinutes: Double = 0.0
    @Published public var averageDailyMinutesText: String = "0.0分"
    @Published public var weeklyData: [DailyMeetingMinutes] = []
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    
    // MARK: - Dependencies
    private let repository: MeetingStatsRepositoryProtocol
    
    // MARK: - Initialization
    public init(repository: MeetingStatsRepositoryProtocol = MeetingStatsRepository()) {
        self.repository = repository
    }
    
    // MARK: - Public Methods
    public func loadStats() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let stats = try await repository.fetchMeetingStats(days: 7)
            
            // APIから取得した平均値をそのまま使用
            averageDailyMinutes = stats.averageDailyMinutes
            
            // 週次データを保存
            weeklyData = stats.weeklyData
            
            // 小数点第1位まで表示
            averageDailyMinutesText = String(format: "%.1f分", stats.averageDailyMinutes)
        } catch {
            errorMessage = "統計データの取得に失敗しました"
            averageDailyMinutes = 0.0
            averageDailyMinutesText = "0.0分"
            weeklyData = []
        }
        
        isLoading = false
    }
}