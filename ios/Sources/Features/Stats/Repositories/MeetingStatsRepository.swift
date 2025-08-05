import Foundation
import Core

// MARK: - Repository Protocol
public protocol MeetingStatsRepositoryProtocol {
    func fetchMeetingStats(days: Int) async throws -> MeetingStatsResponse
}

// MARK: - Repository Implementation
public class MeetingStatsRepository: MeetingStatsRepositoryProtocol {
    private let apiClient = APIClient.shared
    
    public init() {}
    
    public func fetchMeetingStats(days: Int) async throws -> MeetingStatsResponse {
        let endpoint = "/stats/daily-average?days=\(days)"
        let apiResponse = try await apiClient.get(endpoint, type: MeetingStatsAPIResponse.self)
        return apiResponse.data
    }
}