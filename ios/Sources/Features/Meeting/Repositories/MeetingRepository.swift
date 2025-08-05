import Foundation
import Core

// MARK: - Meeting Repository Protocol
public protocol MeetingRepositoryProtocol {
    func fetchMeetings() async throws -> [Meeting]
    func fetchMeeting(id: String) async throws -> Meeting
    func createMeeting(_ meeting: Meeting) async throws -> Meeting
    func updateMeeting(_ meeting: Meeting) async throws -> Meeting
    func acceptInvitation(meetingId: String) async throws
    func declineInvitation(meetingId: String) async throws
}

// MARK: - Meeting Repository Implementation
public class MeetingRepository: MeetingRepositoryProtocol {
    public init() {}
    private let apiClient = APIClient.shared
    
    // MARK: - Fetch Operations
    public func fetchMeetings() async throws -> [Meeting] {
        let response = try await apiClient.get(
            "/meetings",
            type: APIResponse<[MeetingResponse]>.self
        )
        return response.data.map { Meeting(from: $0) }
    }
    
    public func fetchMeeting(id: String) async throws -> Meeting {
        let response = try await apiClient.get(
            "/meetings/\(id)",
            type: APIResponse<MeetingResponse>.self
        )
        return Meeting(from: response.data)
    }
    
    // MARK: - CRUD Operations
    public func createMeeting(_ meeting: Meeting) async throws -> Meeting {
        let request = CreateMeetingRequest(from: meeting)
        let response = try await apiClient.post(
            "/meetings",
            body: request,
            type: APIResponse<MeetingResponse>.self
        )
        return Meeting(from: response.data)
    }
    
    public func updateMeeting(_ meeting: Meeting) async throws -> Meeting {
        let request = UpdateMeetingRequest(from: meeting)
        let response = try await apiClient.put(
            "/meetings/\(meeting.id)",
            body: request,
            type: APIResponse<MeetingResponse>.self
        )
        return Meeting(from: response.data)
    }
    
    // MARK: - Invitation Operations
    public func acceptInvitation(meetingId: String) async throws {
        let request = InvitationActionRequest(action: "accept")
        // APIResponseでラップされた空のレスポンスを期待
        let _ = try await apiClient.post(
            "/meetings/\(meetingId)/invitation",
            body: request,
            type: APIResponse<InvitationResponse>.self
        )
    }
    
    public func declineInvitation(meetingId: String) async throws {
        let request = InvitationActionRequest(action: "decline")
        // APIResponseでラップされた空のレスポンスを期待
        let _ = try await apiClient.post(
            "/meetings/\(meetingId)/invitation",
            body: request,
            type: APIResponse<InvitationResponse>.self
        )
    }
}

// MARK: - Request Models
private struct CreateMeetingRequest: Encodable {
    let title: String
    let description: String?
    let startDate: Date
    let endDate: Date
    let participants: [String]
    
    init(from meeting: Meeting) {
        self.title = meeting.title
        self.description = meeting.description
        self.startDate = meeting.startDate
        self.endDate = meeting.endDate
        self.participants = meeting.participants.map { $0.id }
    }
}

private struct UpdateMeetingRequest: Encodable {
    let title: String
    let description: String?
    let startDate: Date
    let endDate: Date
    
    init(from meeting: Meeting) {
        self.title = meeting.title
        self.description = meeting.description
        self.startDate = meeting.startDate
        self.endDate = meeting.endDate
    }
}

private struct InvitationActionRequest: Encodable {
    let action: String
}

// 招待アクションのレスポンス（空でもDecodableが必要）
private struct InvitationResponse: Decodable {
    // 空のレスポンスの場合もあるため、全てオプショナル
    let message: String?
}

// MARK: - API Response Models
struct MeetingResponse: Decodable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let isImportant: Bool
    let ownerId: String
    let owner: String
    let participants: [SimpleParticipant]
    let createdAt: Date
    let updatedAt: Date
}

struct SimpleParticipant: Decodable {
    let id: String
    let email: String
    let name: String
}