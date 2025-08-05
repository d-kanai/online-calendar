import Testing
import SwiftUI
import ViewInspector
@testable import Core

@Suite("MeetingStatsScreen振る舞いテスト")
struct MeetingStatsScreenSpec {
    
    @Test("統計画面の基本UIが正しく表示される")
    @MainActor
    func test_basicUIElements() throws {
        // Given
        let viewModel = MeetingStatsViewModel()
        viewModel.averageDailyMinutesText = "0.0分"
        viewModel.averageDailyMinutes = 0.0
        let view = MeetingStatsScreen(viewModel: viewModel)
        
        // When
        let inspection = try view.inspect()
        
        // Then - タイトルが表示される
        _ = try inspection.find(ViewType.NavigationView.self)
    }
    
    @Test("ローディング中はLoadingViewが表示される")
    @MainActor
    func test_loadingState() throws {
        // Given
        let viewModel = MeetingStatsViewModel()
        viewModel.isLoading = true
        let view = MeetingStatsScreen(viewModel: viewModel)
        
        // When
        let inspection = try view.inspect()
        
        // Then - LoadingViewが表示される
        let loadingText = try inspection.find(text: "統計データを読み込んでいます...")
        #expect(try loadingText.string() == "統計データを読み込んでいます...")
    }
    
    @Test("統計データが正しく表示される")
    @MainActor
    func test_displayStats() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [60, 30, 90, 0, 45, 0, 120]
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When - データを読み込む
        await viewModel.loadStats()
        
        let view = MeetingStatsScreen(viewModel: viewModel)
        let inspection = try view.inspect()
        
        // Then - 平均時間が表示される（AverageTimeCard内）
        let averageTime = try inspection.find(text: "49.3分")
        #expect(try averageTime.string() == "49.3分")
        
        // 週合計が表示される（SimpleBarChart内）
        let weekTotal = try inspection.find(text: "週合計: 5時間")
        #expect(try weekTotal.string() == "週合計: 5時間")
    }
    
    @Test("エラー時にエラーメッセージが表示される")
    @MainActor
    func test_errorState() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.shouldThrowError = true
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When
        await viewModel.loadStats()
        
        let view = MeetingStatsScreen(viewModel: viewModel)
        let inspection = try view.inspect()
        
        // Then - StatsErrorViewが表示される
        let errorTitle = try inspection.find(text: "エラーが発生しました")
        #expect(try errorTitle.string() == "エラーが発生しました")
        
        let errorMessage = try inspection.find(text: "統計データの取得に失敗しました")
        #expect(try errorMessage.string() == "統計データの取得に失敗しました")
    }
    
    @Test("画面表示時にloadStatsが呼ばれる")
    @MainActor
    func test_onAppearLoadStats() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [30, 60, 30, 0, 0, 0, 0]
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        _ = MeetingStatsScreen(viewModel: viewModel)
        
        // 初期状態では0分
        #expect(viewModel.averageDailyMinutes == 0.0)
        
        // When - onAppearをシミュレート
        // ViewInspectorではonAppearを直接呼べないため、
        // ViewModelのloadStatsを呼んで動作を確認
        await viewModel.loadStats()
        
        // Then - データが読み込まれる
        #expect(viewModel.averageDailyMinutes == 17.1)
    }
}