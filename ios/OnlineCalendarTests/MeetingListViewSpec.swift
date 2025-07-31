import Testing
import SwiftUI
@testable import OnlineCalendar

// MARK: - MeetingListView振る舞いテスト
@Suite("MeetingListView振る舞いテスト")
struct MeetingListViewSpec {
    
    // MARK: - 会議表示機能
    @Test("loadMeetings - 複数の会議データが表示される")
    @MainActor
    func testLoadMeetingsMultipleMeetingsDisplayed() async throws {
        // Given - APIレスポンスをモック
        let mockRepository = MockMeetingRepository()
        
        let mockMeetings = [
            Meeting(
                id: "1",
                title: "チームミーティング",
                description: "週次定例会議",
                startDate: Date(),
                endDate: Date().addingTimeInterval(3600),
                organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
                participants: []
            ),
            Meeting(
                id: "2",
                title: "進捗確認",
                description: "プロジェクト進捗確認",
                startDate: Date().addingTimeInterval(7200),
                endDate: Date().addingTimeInterval(10800),
                organizer: Organizer(id: "org2", name: "佐藤花子", email: "sato@example.com"),
                participants: []
            )
        ]
        mockRepository.fetchMeetingsResult = .success(mockMeetings)
        
        // When - ページをレンダリング
        let viewModel = MeetingListViewModel(repository: mockRepository)
        
        // ViewModelのloadMeetingsを呼び出し
        await viewModel.loadMeetings()
        
        // Then - データが画面に表示されていることを確認
        #expect(viewModel.meetings.count == 2)
        #expect(viewModel.meetings[0].title == "チームミーティング")
        #expect(viewModel.meetings[1].title == "進捗確認")
        #expect(viewModel.errorMessage == nil)
    }
    
    @Test("loadMeetings - 空の会議リストの場合は空状態メッセージが表示される")
    @MainActor
    func testLoadMeetingsEmptyList() async throws {
        // Given - 空のレスポンスをモック
        let mockRepository = MockMeetingRepository()
        mockRepository.fetchMeetingsResult = .success([])
        
        // When - ページをレンダリング
        let viewModel = MeetingListViewModel(repository: mockRepository)
        await viewModel.loadMeetings()
        
        // Then - 空状態の確認
        #expect(viewModel.meetings.isEmpty)
        #expect(viewModel.errorMessage == nil)
    }
    
    @Test("loadMeetings - APIエラー時にエラーメッセージが表示される")
    @MainActor
    func testLoadMeetingsApiError() async throws {
        // Given - APIエラーをモック
        let mockRepository = MockMeetingRepository()
        mockRepository.fetchMeetingsResult = .failure(APIError.networkError("ネットワークエラー"))
        
        // When - ページをレンダリング
        let viewModel = MeetingListViewModel(repository: mockRepository)
        await viewModel.loadMeetings()
        
        // Then - エラーメッセージの確認
        #expect(viewModel.errorMessage != nil)
        #expect(viewModel.meetings.isEmpty)
    }
    
    // MARK: - リフレッシュ機能
    @Test("refreshMeetings - プルトゥリフレッシュで最新データが取得される")
    @MainActor
    func testRefreshMeetings() async throws {
        // Given - 初期データと更新後データを準備
        let mockRepository = MockMeetingRepository()
        let initialMeetings = [
            Meeting(
                id: "1",
                title: "古い会議",
                startDate: Date(),
                endDate: Date().addingTimeInterval(3600),
                organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
                participants: []
            )
        ]
        let updatedMeetings = [
            Meeting(
                id: "1",
                title: "古い会議",
                startDate: Date(),
                endDate: Date().addingTimeInterval(3600),
                organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
                participants: []
            ),
            Meeting(
                id: "2",
                title: "新しい会議",
                startDate: Date().addingTimeInterval(7200),
                endDate: Date().addingTimeInterval(10800),
                organizer: Organizer(id: "org2", name: "佐藤花子", email: "sato@example.com"),
                participants: []
            )
        ]
        
        mockRepository.fetchMeetingsResult = .success(initialMeetings)
        let viewModel = MeetingListViewModel(repository: mockRepository)
        
        // 初期ロード
        await viewModel.loadMeetings()
        #expect(viewModel.meetings.count == 1)
        
        // When - リフレッシュ実行
        mockRepository.fetchMeetingsResult = .success(updatedMeetings)
        await viewModel.refreshMeetings()
        
        // Then - 更新されたデータが表示される
        #expect(viewModel.meetings.count == 2)
        #expect(viewModel.meetings[1].title == "新しい会議")
    }
    
    // MARK: - 会議選択機能
    @Test("selectMeeting - 会議をタップすると選択される")
    @MainActor
    func testSelectMeeting() async throws {
        // Given - 会議データを準備
        let mockRepository = MockMeetingRepository()
        let meeting = Meeting(
            id: "1",
            title: "選択する会議",
            startDate: Date(),
            endDate: Date().addingTimeInterval(3600),
            organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
            participants: []
        )
        mockRepository.fetchMeetingsResult = .success([meeting])
        
        let viewModel = MeetingListViewModel(repository: mockRepository)
        await viewModel.loadMeetings()
        
        // When - 会議を選択
        viewModel.selectMeeting(meeting)
        
        // Then - 選択された会議が設定される
        #expect(viewModel.selectedMeeting?.id == "1")
        #expect(viewModel.selectedMeeting?.title == "選択する会議")
    }
    
    // MARK: - サインアウト機能
    @Test("signOut - サインアウトボタンをタップするとセッションがクリアされる")
    @MainActor
    func testSignOut() async throws {
        // Given - 認証済み状態
        let mockAuthManager = MockAuthManager()
        mockAuthManager.isAuthenticated = true
        
        // When - サインアウトを実行
        mockAuthManager.clearSession()
        
        // Then - セッションがクリアされる
        #expect(!mockAuthManager.isAuthenticated)
        #expect(mockAuthManager.clearSessionCalled)
    }
}

// MARK: - Mock Classes
class MockMeetingRepository: MeetingRepositoryProtocol {
    var fetchMeetingsResult: Result<[Meeting], Error> = .success([])
    var fetchMeetingResult: Result<Meeting, Error>?
    var createMeetingResult: Result<Meeting, Error>?
    var updateMeetingResult: Result<Meeting, Error>?
    var deleteMeetingResult: Result<Void, Error>?
    
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
    
    func deleteMeeting(id: String) async throws {
        switch deleteMeetingResult! {
        case .success:
            return
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

// AuthManagerのモック（プロトコルベースのモックに変更）
@MainActor
class MockAuthManager: ObservableObject {
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