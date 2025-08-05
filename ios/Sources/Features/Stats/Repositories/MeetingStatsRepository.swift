import Foundation
import Core

// MARK: - Repository Protocol
public protocol MeetingStatsRepositoryProtocol {
    func fetchMeetingStats(days: Int) async throws -> MeetingStatsResponse
}

// MARK: - Repository Implementation
public class MeetingStatsRepository: MeetingStatsRepositoryProtocol {
    private let apiClient: APIClientProtocol
    
    public init(apiClient: APIClientProtocol = APIClient()) {
        self.apiClient = apiClient
    }
    
    public func fetchMeetingStats(days: Int) async throws -> MeetingStatsResponse {
        let endpoint = "/stats/daily-average?days=\(days)"
        let apiResponse: MeetingStatsAPIResponse = try await apiClient.request(endpoint: endpoint, method: .get)
        return apiResponse.data
    }
}