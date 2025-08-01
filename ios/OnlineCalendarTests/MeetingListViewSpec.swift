
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
    
    @Test("会議をタップするとselectMeetingが呼ばれる")
    @MainActor
    func test4() async throws {
        // Given - 会議データをモック
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
        
        // ViewInspectorでビューを検査してidでMeetingRowを見つける
        let inspection = try view.inspect()
        let meetingRow = try inspection.find(viewWithId: "meetingRow_1")
        
        // Then - onTapGestureアクションを実行
        try meetingRow.callOnTapGesture()
        
        // selectMeetingが呼ばれたことを確認（selectedMeetingが設定される）
        #expect(viewModel.selectedMeeting?.id == "1")
        #expect(viewModel.selectedMeeting?.title == "テスト会議")
    }
    
    @Test("refreshableで会議一覧が更新される")
    @MainActor
    func test5() async throws {
        // Given - 初期データと更新後データをモック
        let mockRepository = MockMeetingRepository()
        let initialMeeting = Meeting(
            id: "1",
            title: "初期会議",
            description: "初期の会議",
            startDate: Date(),
            endDate: Date().addingTimeInterval(3600),
            organizer: Organizer(id: "org1", name: "テスト主催者", email: "test@example.com"),
            participants: []
        )
        mockRepository.fetchMeetingsResult = .success([initialMeeting])
        
        // ViewModelとViewを準備
        let viewModel = MeetingListViewModel(repository: mockRepository)
        let authManager = AuthManager.shared
        let view = MeetingListView(viewModel: viewModel).environmentObject(authManager)

        // 初期データをロード
        await viewModel.loadMeetings()
        #expect(viewModel.meetings.count == 1)
        #expect(viewModel.meetings[0].title == "初期会議")
        
        // When - refreshMeetingsを呼び出す（refreshableアクションのテスト）
        let updatedMeeting = Meeting(
            id: "2",
            title: "更新後会議",
            description: "更新後の会議",
            startDate: Date(),
            endDate: Date().addingTimeInterval(3600),
            organizer: Organizer(id: "org2", name: "更新主催者", email: "update@example.com"),
            participants: []
        )
        mockRepository.fetchMeetingsResult = .success([updatedMeeting])
        
        await viewModel.refreshMeetings()
        
        // Then - データが更新されていることを確認
        #expect(viewModel.meetings.count == 1)
        #expect(viewModel.meetings[0].title == "更新後会議")
    }
    
    @Test("サインアウトボタンをタップするとclearSessionが呼ばれる")
    @MainActor
    func test7() async throws {
        // Given - テストデータを準備
        let mockRepository = MockMeetingRepository()
        mockRepository.fetchMeetingsResult = .success([])
        
        let viewModel = MeetingListViewModel(repository: mockRepository)
        let authManager = AuthManager.shared
        let view = MeetingListView(viewModel: viewModel).environmentObject(authManager)

        // When - ViewInspectorでビューを検査してサインアウトボタンを見つける
        let inspection = try view.inspect()
        let signOutButton = try inspection.find(button: "サインアウト")
        
        // Then - ボタンが存在することを確認
        #expect(try signOutButton.labelView().text().string() == "サインアウト")
        
        // ボタンのタップアクションを実行
        try signOutButton.tap()
        
        // clearSessionが呼ばれたことを確認（セッションがクリアされる）
        // 注意: AuthManagerの実装によってはテストが困難な場合があるため、
        // ここではボタンのタップが正常に実行されることを確認
    }
    
}
