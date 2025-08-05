import Foundation
@testable import Core

// MARK: - Mock Classes
class MockMeetingRepository: MeetingRepositoryProtocol {
    var fetchMeetingsResult: Result<[Meeting], Error> = .success([])
    var fetchMeetingResult: Result<Meeting, Error>?
    var createMeetingResult: Result<Meeting, Error>?
    var updateMeetingResult: Result<Meeting, Error>?
    
    
    func fetchMeetings() async throws -> [Meeting] {
        switch fetchMeetingsResult {
        case .success(let meetings):
            return meetings
        case .failure(let error):
            throw error
        }
    }
    
    func fetchMeeting(id: String) async throws -> Meeting {
        switch fetchMeetingResult! {
        case .success(let meeting):
            return meeting
        case .failure(let error):
            throw error
        }
    }
    
    func createMeeting(_ meeting: Meeting) async throws -> Meeting {
        switch createMeetingResult! {
        case .success(let meeting):
            return meeting
        case .failure(let error):
            throw error
        }
    }
    
    func updateMeeting(_ meeting: Meeting) async throws -> Meeting {
        switch updateMeetingResult! {
        case .success(let meeting):
            return meeting
        case .failure(let error):
            throw error
        }
    }
    
    func acceptInvitation(meetingId: String) async throws {
        // Not used in this test
    }
    
    func declineInvitation(meetingId: String) async throws {
        // Not used in this test
    }
}

// AuthStateのモック（プロトコルベースのモックに変更）
@MainActor
class MockAuthState: ObservableObject {
    @Published var isAuthenticated = false
    var clearSessionCalled = false
    
    func clearSession() {
        clearSessionCalled = true
        isAuthenticated = false
    }
}

// APIエラーの定義（テスト用）
enum APIError: Error, LocalizedError {
    case networkError(String)
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .networkError(let message):
            return message
        case .serverError(let message):
            return message
        }
    }
}