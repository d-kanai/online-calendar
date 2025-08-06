import Testing
import SwiftUI
import ViewInspector
@testable import Home
@testable import Core

@Suite("HomeScreen振る舞いテスト")
struct HomeScreenSpec {
    
    @Test("ホーム画面のサマリーデータが表示される")
    @MainActor
    func testDisplayHomeSummary() throws {
        // Given - 既にデータを持つViewModelを直接作成
        let mockSummary = HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: Meeting(
                id: "1",
                title: "デザインレビュー",
                startTime: Date().addingTimeInterval(30 * 60)
            ),
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
        let viewModel = PreloadedHomeViewModel(summary: mockSummary)
        let mockNavigationHandler = MockNavigationHandler()
        
        // When - View直接作成（データロード不要）
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: mockNavigationHandler
        )
        
        // ViewInspectorでビューを検査
        let inspection = try view.inspect()
        
        // Then - 動的データのみアサート（静的な文字列はアサートしない）
        // 今日の会議数
        let todayMeetingsCount = try inspection.find(text: "3件")
        #expect(try todayMeetingsCount.string() == "3件")
        
        // 今週の会議時間
        let weeklyHours = try inspection.find(text: "12.5時間")
        #expect(try weeklyHours.string() == "12.5時間")
        
        // 次の会議タイトル
        let nextMeetingTitle = try inspection.find(text: "デザインレビュー")
        #expect(try nextMeetingTitle.string() == "デザインレビュー")
    }
    
    @Test("今日の会議カードをタップすると遷移コールバックが呼ばれる")
    @MainActor
    func testTodayMeetingsCardTap() throws {
        // Given - 既にデータを持つViewModelを直接作成
        let mockSummary = HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: nil,
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
        let viewModel = PreloadedHomeViewModel(summary: mockSummary)
        let mockNavigationHandler = MockNavigationHandler()
        
        // When - View直接作成してボタンタップ
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: mockNavigationHandler
        )
        
        let inspection = try view.inspect()
        let todayMeetingsButton = try inspection.find(button: "今日の会議")
        try todayMeetingsButton.tap()
        
        // Then - 正しいNavigationActionが呼ばれたことを確認
        #expect(mockNavigationHandler.navigatedActions.contains(.todayMeetings))
    }
    
    @Test("今週の会議時間カードをタップすると遷移コールバックが呼ばれる")
    @MainActor
    func testWeeklyStatsCardTap() throws {
        // Given - 既にデータを持つViewModelを直接作成
        let mockSummary = HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: nil,
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
        let viewModel = PreloadedHomeViewModel(summary: mockSummary)
        let mockNavigationHandler = MockNavigationHandler()
        
        // When - View直接作成してボタンタップ
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: mockNavigationHandler
        )
        
        let inspection = try view.inspect()
        let weeklyStatsButton = try inspection.find(button: "今週の会議時間")
        try weeklyStatsButton.tap()
        
        // Then - 正しいNavigationActionが呼ばれたことを確認
        #expect(mockNavigationHandler.navigatedActions.contains(.weeklyStats))
    }
    
    @Test("次の会議が30分後の場合、時間表示が正しい")
    @MainActor
    func testNextMeetingTimeDisplay() throws {
        // Given - 30分後の会議を持つViewModelを直接作成
        let nextMeeting = Meeting(
            id: "1",
            title: "デザインレビュー",
            startTime: Date().addingTimeInterval(30 * 60) // 30分後
        )
        let mockSummary = HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: nextMeeting,
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
        let viewModel = PreloadedHomeViewModel(summary: mockSummary)
        let mockNavigationHandler = MockNavigationHandler()
        
        // When - View直接作成
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: mockNavigationHandler
        )
        
        let inspection = try view.inspect()
        
        // Then - 時間表示を確認（約30分後なので"30分後"と表示される）
        // 実際の時間差により29分や31分になる可能性があるため、範囲でチェック
        do {
            _ = try inspection.find(text: "30分後")
        } catch {
            // 29分後または31分後も許容
            do {
                _ = try inspection.find(text: "29分後")
            } catch {
                _ = try inspection.find(text: "31分後")
            }
        }
    }
    
    @Test("データロード中はローディング状態が表示される")
    @MainActor
    func testLoadingState() throws {
        // Given - ローディング状態のViewModelを直接作成
        let viewModel = LoadingHomeViewModel()
        let mockNavigationHandler = MockNavigationHandler()
        
        // When - View直接作成
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: mockNavigationHandler
        )
        
        let inspection = try view.inspect()
        
        // Then - ViewInspectorでローディングViewの存在を確認
        // HomeLoadingViewが表示されているかチェック
        _ = try inspection.find(HomeLoadingView.self)
    }
    
    @Test("APIエラー時はエラーメッセージが表示される")
    @MainActor
    func testErrorState() throws {
        // Given - エラー状態のViewModelを直接作成
        let errorMessage = "ホーム画面の読み込みに失敗しました"
        let viewModel = ErrorHomeViewModel(errorMessage: errorMessage)
        let mockNavigationHandler = MockNavigationHandler()
        
        // When - View直接作成
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: mockNavigationHandler
        )
        
        let inspection = try view.inspect()
        
        // Then - ViewInspectorでエラーViewとメッセージの存在を確認
        _ = try inspection.find(HomeErrorView.self)
        let errorText = try inspection.find(text: errorMessage)
        #expect(try errorText.string() == errorMessage)
    }
}

// MARK: - Test ViewModels

/// 既にデータを持つViewModelクラス（View直接テスト用）
class PreloadedHomeViewModel: HomeViewModel {
    init(summary: HomeSummary) {
        super.init(repository: MockHomeRepository())
        self.summary = summary
        self.isLoading = false
        self.errorMessage = nil
    }
}

/// ローディング状態のViewModelクラス（View直接テスト用）
class LoadingHomeViewModel: HomeViewModel {
    override init(repository: HomeRepository? = MockHomeRepository()) {
        super.init(repository: repository)
        self.isLoading = true
        self.summary = nil
        self.errorMessage = nil
    }
}

/// エラー状態のViewModelクラス（View直接テスト用）
class ErrorHomeViewModel: HomeViewModel {
    init(errorMessage: String) {
        super.init(repository: MockHomeRepository())
        self.isLoading = false
        self.summary = nil
        self.errorMessage = errorMessage
    }
}

// MARK: - Mock

class MockHomeRepository: HomeRepository {
    var fetchHomeSummaryResult: Result<HomeSummary, Error> = .failure(NSError(domain: "test", code: 404))
    var delay: TimeInterval = 0
    
    override func fetchHomeSummary() async throws -> HomeSummary {
        if delay > 0 {
            try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
        }
        
        switch fetchHomeSummaryResult {
        case .success(let summary):
            return summary
        case .failure(let error):
            throw error
        }
    }
}

// MARK: - Mock Navigation Handler

class MockNavigationHandler: NavigationHandler {
    private(set) var navigatedActions: [NavigationAction] = []
    
    func navigate(to action: NavigationAction) {
        navigatedActions.append(action)
    }
}