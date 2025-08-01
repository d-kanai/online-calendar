
import Testing
import SwiftUI
import ViewInspector
@testable import OnlineCalendar

// MARK: - MeetingListView振る舞いテスト
@Suite("MeetingListView振る舞いテスト")
struct MeetingListViewSpec {
    
    @Test("会議がListに表示される")
    @MainActor
    func test1() async throws {
        // Given - APIレスポンスをモック
        let mockRepository = MockMeetingRepository()
        let mockMeeting = Meeting(
            id: "1",
            title: "テスト会議",
            description: "テスト用の会議",
            startDate: Date(),
            endDate: Date().addingTimeInterval(3600),
            organizer: Organizer(id: "org1", name: "テスト主催者", email: "test@example.com"),
            participants: []
        )
        mockRepository.fetchMeetingsResult = .success([mockMeeting])
        
        // ViewModelとViewを準備
        let viewModel = MeetingListViewModel(repository: mockRepository)
        let authManager = AuthManager.shared
        let view = MeetingListView(viewModel: viewModel).environmentObject(authManager)

        // When - loadMeetingsを呼び出してデータをロード
        await viewModel.loadMeetings()
        
        // ViewInspectorでビューを検査
        let inspection = try view.inspect()

        // Then - ビューに会議タイトルが表示されていることを確認
        let elem = try inspection.find(text: "テスト会議")
        #expect(try elem.string() == "テスト会議")
    }
    
    @Test("APIエラー時はビューにエラーメッセージが表示される")
    @MainActor
    func test2() async throws {
        // Given - APIエラーをモック
        let mockRepository = MockMeetingRepository()
        mockRepository.fetchMeetingsResult = .failure(APIError.networkError("ネットワークエラー"))
        
        // ViewModelとViewを準備
        let viewModel = MeetingListViewModel(repository: mockRepository)
        let authManager = AuthManager.shared
        let view = MeetingListView(viewModel: viewModel).environmentObject(authManager)

        // When - loadMeetingsを呼び出してエラーを発生させる
        await viewModel.loadMeetings()
        
        // ViewInspectorでビューを検査
        let inspection = try view.inspect()

        // Then - エラーメッセージが表示されていることを確認
        let errorText = try inspection.find(text: "ネットワークエラー")
        #expect(try errorText.string() == "ネットワークエラー")
    }
    
    @Test("空のリストの場合は適切なメッセージが表示される")
    @MainActor
    func test3() async throws {
        // Given - 空のレスポンスをモック
        let mockRepository = MockMeetingRepository()
        mockRepository.fetchMeetingsResult = .success([])
        
        // ViewModelとViewを準備
        let viewModel = MeetingListViewModel(repository: mockRepository)
        let authManager = AuthManager.shared
        let view = MeetingListView(viewModel: viewModel).environmentObject(authManager)

        // When - loadMeetingsを呼び出して空のデータをロード
        await viewModel.loadMeetings()
        
        // ViewInspectorでビューを検査
        let inspection = try view.inspect()

        // Then - 空状態メッセージが表示されていることを確認
        let emptyMessage = try inspection.find(text: "会議がありません")
        #expect(try emptyMessage.string() == "会議がありません")
    }
    
}
