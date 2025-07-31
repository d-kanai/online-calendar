import Foundation

// MARK: - Meeting Repository Protocol
protocol MeetingRepositoryProtocol {
    func fetchMeetings() async throws -> [Meeting]
    func fetchMeeting(id: String) async throws -> Meeting
    func createMeeting(_ meeting: Meeting) async throws -> Meeting
    func updateMeeting(_ meeting: Meeting) async throws -> Meeting
    func deleteMeeting(id: String) async throws
    func acceptInvitation(meetingId: String) async throws
    func declineInvitation(meetingId: String) async throws
}

// MARK: - Meeting Repository Implementation
class MeetingRepository: MeetingRepositoryProtocol {
    private let apiClient = APIClient.shared
    
    // MARK: - Fetch Operations
    func fetchMeetings() async throws -> [Meeting] {
        let response = try await apiClient.get(
            "/meetings",
            type: APIResponse<[MeetingResponse]>.self
        )
        return response.data.map { Meeting(from: $0) }
    }
    
    func fetchMeeting(id: String) async throws -> Meeting {
        let response = try await apiClient.get(
            "/meetings/\(id)",
            type: APIResponse<MeetingResponse>.self
        )
        return Meeting(from: response.data)
    }
    
    // MARK: - CRUD Operations
    func createMeeting(_ meeting: Meeting) async throws -> Meeting {
        let request = CreateMeetingRequest(from: meeting)
        let response = try await apiClient.post(
            "/meetings",
            body: request,
            type: APIResponse<MeetingResponse>.self
        )
        return Meeting(from: response.data)
    }
    
    func updateMeeting(_ meeting: Meeting) async throws -> Meeting {
        let request = UpdateMeetingRequest(from: meeting)
        let response = try await apiClient.put(
            "/meetings/\(meeting.id)",
            body: request,
            type: APIResponse<MeetingResponse>.self
        )
        return Meeting(from: response.data)
    }
    
    func deleteMeeting(id: String) async throws {
        try await apiClient.delete("/meetings/\(id)")
    }
    
    // MARK: - Invitation Operations
    func acceptInvitation(meetingId: String) async throws {
        let request = InvitationActionRequest(action: "accept")
        // APIResponseでラップされた空のレスポンスを期待
        let _ = try await apiClient.post(
            "/meetings/\(meetingId)/invitation",
            body: request,
            type: APIResponse<InvitationResponse>.self
        )
    }
    
    func declineInvitation(meetingId: String) async throws {
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
    let location: String?
    let isOnline: Bool
    let meetingUrl: String?
    let participants: [String]
    
    init(from meeting: Meeting) {
        self.title = meeting.title
        self.description = meeting.description
        self.startDate = meeting.startDate
        self.endDate = meeting.endDate
        self.location = meeting.location
        self.isOnline = meeting.isOnline
        self.meetingUrl = meeting.onlineUrl
        self.participants = meeting.participants.map { $0.userId }
    }
}

private struct UpdateMeetingRequest: Encodable {
    let title: String
    let description: String?
    let startDate: Date
    let endDate: Date
    let location: String?
    let isOnline: Bool
    let meetingUrl: String?
    
    init(from meeting: Meeting) {
        self.title = meeting.title
        self.description = meeting.description
        self.startDate = meeting.startDate
        self.endDate = meeting.endDate
        self.location = meeting.location
        self.isOnline = meeting.isOnline
        self.meetingUrl = meeting.onlineUrl
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

