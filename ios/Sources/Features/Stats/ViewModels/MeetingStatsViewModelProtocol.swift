import Foundation
import SwiftUI

@MainActor
public protocol MeetingStatsViewModelProtocol: ObservableObject {
    var averageDailyMinutes: Double { get set }
    var averageDailyMinutesText: String { get set }
    var weeklyData: [DailyMeetingMinutes] { get set }
    var errorMessage: String? { get set }
    
    func loadStats() async
}