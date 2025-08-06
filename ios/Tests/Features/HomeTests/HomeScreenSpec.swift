import Testing
import SwiftUI
import ViewInspector
@testable import Home
@testable import Core

@Suite("HomeScreen振る舞いテスト")
struct HomeScreenSpec {
    
    @Test("ホーム画面のサマリーデータが表示される")
    @MainActor
    func testDisplayHomeSummary() async throws {
        // Given - APIレスポンスをモック
        let mockRepository = MockHomeRepository()
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
        mockRepository.fetchHomeSummaryResult = .success(mockSummary)
        
        // ViewModelとViewを準備
        let viewModel = HomeViewModel(repository: mockRepository)
        let view = HomeScreen(
            viewModel: viewModel,
            onTodayMeetingsTapped: {},
            onWeeklyStatsTapped: {}
        )
        
        // When - データをロード
        await viewModel.loadSummary()
        
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
    func testTodayMeetingsCardTap() async throws {
        // Given - サマリーデータをモック
        let mockRepository = MockHomeRepository()
        let mockSummary = HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: nil,
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
        mockRepository.fetchHomeSummaryResult = .success(mockSummary)
        
        // コールバックの呼び出しを記録
        var todayMeetingsTapped = false
        
        // ViewModelとViewを準備
        let viewModel = HomeViewModel(repository: mockRepository)
        let view = HomeScreen(
            viewModel: viewModel,
            onTodayMeetingsTapped: {
                todayMeetingsTapped = true
            },
            onWeeklyStatsTapped: {}
        )
        
        // データをロード
        await viewModel.loadSummary()
        
        // When - ViewInspectorでボタンを見つけてタップ
        let inspection = try view.inspect()
        // 今日の会議カードはButtonなので、その中のHStackを見つける
        let todayMeetingsButton = try inspection.find(button: "今日の会議")
        try todayMeetingsButton.tap()
        
        // Then - コールバックが呼ばれたことを確認
        #expect(todayMeetingsTapped == true)
    }
    
    @Test("今週の会議時間カードをタップすると遷移コールバックが呼ばれる")
    @MainActor
    func testWeeklyStatsCardTap() async throws {
        // Given - サマリーデータをモック
        let mockRepository = MockHomeRepository()
        let mockSummary = HomeSummary(
            todayMeetingsCount: 3,
            nextMeeting: nil,
            weeklyMeetingHours: 12.5,
            userName: "田中太郎"
        )
        mockRepository.fetchHomeSummaryResult = .success(mockSummary)
        
        // コールバックの呼び出しを記録
        var weeklyStatsTapped = false
        
        // ViewModelとViewを準備
        let viewModel = HomeViewModel(repository: mockRepository)
        let view = HomeScreen(
            viewModel: viewModel,
            onTodayMeetingsTapped: {},
            onWeeklyStatsTapped: {
                weeklyStatsTapped = true
            }
        )
        
        // データをロード
        await viewModel.loadSummary()
        
        // When - ViewInspectorでボタンを見つけてタップ
        let inspection = try view.inspect()
        let weeklyStatsButton = try inspection.find(button: "今週の会議時間")
        try weeklyStatsButton.tap()
        
        // Then - コールバックが呼ばれたことを確認
        #expect(weeklyStatsTapped == true)
    }
    
    @Test("次の会議が30分後の場合、時間表示が正しい")
    @MainActor
    func testNextMeetingTimeDisplay() async throws {
        // Given - 30分後の会議をモック
        let mockRepository = MockHomeRepository()
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
        mockRepository.fetchHomeSummaryResult = .success(mockSummary)
        
        // ViewModelとViewを準備
        let viewModel = HomeViewModel(repository: mockRepository)
        let view = HomeScreen(
            viewModel: viewModel,
            onTodayMeetingsTapped: {},
            onWeeklyStatsTapped: {}
        )
        
        // When - データをロード
        await viewModel.loadSummary()
        
        // ViewInspectorでビューを検査
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
    func testLoadingState() async throws {
        // Given - 遅延のあるモックリポジトリ
        let mockRepository = MockHomeRepository()
        mockRepository.delay = 0.5 // 500ms遅延
        mockRepository.fetchHomeSummaryResult = .success(HomeSummary(
            todayMeetingsCount: 1,
            nextMeeting: nil,
            weeklyMeetingHours: 1.0,
            userName: "Test"
        ))
        
        // ViewModelとViewを準備
        let viewModel = HomeViewModel(repository: mockRepository)
        
        // When - ロード開始（awaitしない）
        let loadTask = Task {
            await viewModel.loadSummary()
        }
        
        // 少し待機してからローディング状態を確認
        try await Task.sleep(nanoseconds: 10_000_000) // 10ms待機
        
        // Then - ローディング中の状態を確認
        #expect(viewModel.isLoading == true)
        
        // ロード完了を待つ
        await loadTask.value
        #expect(viewModel.isLoading == false)
    }
    
    @Test("APIエラー時はエラーメッセージが表示される")
    @MainActor
    func testErrorState() async throws {
        // Given - エラーを返すモックリポジトリ
        let mockRepository = MockHomeRepository()
        mockRepository.fetchHomeSummaryResult = .failure(NSError(domain: "test", code: 500))
        
        // ViewModelを準備
        let viewModel = HomeViewModel(repository: mockRepository)
        _ = HomeScreen(
            viewModel: viewModel,
            onTodayMeetingsTapped: {},
            onWeeklyStatsTapped: {}
        )
        
        // When - データロードでエラー発生
        await viewModel.loadSummary()
        
        // Then - エラーメッセージが設定される
        #expect(viewModel.errorMessage == "ホーム画面の読み込みに失敗しました")
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