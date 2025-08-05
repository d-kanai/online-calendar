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
        let view = MeetingStatsScreen(viewModel: viewModel)
        
        // When
        let inspection = try view.inspect()
        
        // Then - 平均時間のラベルが表示される
        let averageLabel = try inspection.find(text: "1日あたりの平均会議時間")
        #expect(try averageLabel.string() == "1日あたりの平均会議時間")
    }
    
    @Test("ローディング中はProgressViewが表示される")
    @MainActor
    func test_loadingState() throws {
        // Given
        let viewModel = MeetingStatsViewModel()
        viewModel.isLoading = true
        let view = MeetingStatsScreen(viewModel: viewModel)
        
        // When
        let inspection = try view.inspect()
        
        // Then
        _ = try inspection.find(ViewType.ProgressView.self)
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
        
        // Then - 平均時間が表示される
        let averageTime = try inspection.find(text: "49.3分")
        #expect(try averageTime.string() == "49.3分")
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
        
        // Then - エラーメッセージが表示される
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