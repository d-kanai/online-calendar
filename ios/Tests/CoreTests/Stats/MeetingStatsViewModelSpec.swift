import Testing
import Foundation
@testable import Core

@Suite("MeetingStatsViewModel振る舞いテスト")
struct MeetingStatsViewModelSpec {
    
    @Test("過去7日間の会議時間から平均を正しく計算する - ケース1: 49.3分")
    @MainActor
    func test_calculateAverageMeetingTime_case1() async throws {
        // Given - モックデータで過去7日間の会議時間を設定
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [
            60,  // 7日前
            30,  // 6日前
            90,  // 5日前
            0,   // 4日前
            45,  // 3日前
            0,   // 2日前
            120  // 1日前
        ]
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When - 統計を読み込む
        await viewModel.loadStats()
        
        // Then - 平均時間が49.3分と計算される
        #expect(viewModel.averageDailyMinutes == 49.3)
        #expect(viewModel.averageDailyMinutesText == "49.3分")
    }
    
    @Test("過去7日間の会議時間から平均を正しく計算する - ケース2: 17.1分")
    @MainActor
    func test_calculateAverageMeetingTime_case2() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [30, 60, 30, 0, 0, 0, 0]
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When
        await viewModel.loadStats()
        
        // Then
        #expect(viewModel.averageDailyMinutes == 17.1)
        #expect(viewModel.averageDailyMinutesText == "17.1分")
    }
    
    @Test("過去7日間の会議時間から平均を正しく計算する - ケース3: 85.7分")
    @MainActor
    func test_calculateAverageMeetingTime_case3() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [120, 120, 120, 120, 120, 0, 0]
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When
        await viewModel.loadStats()
        
        // Then
        #expect(viewModel.averageDailyMinutes == 85.7)
        #expect(viewModel.averageDailyMinutesText == "85.7分")
    }
    
    @Test("会議がない場合は0.0分と表示される")
    @MainActor
    func test_calculateAverageMeetingTime_noMeetings() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [0, 0, 0, 0, 0, 0, 0]
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When
        await viewModel.loadStats()
        
        // Then
        #expect(viewModel.averageDailyMinutes == 0.0)
        #expect(viewModel.averageDailyMinutesText == "0.0分")
    }
    
    @Test("ローディング状態が正しく管理される")
    @MainActor
    func test_loadingState() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.delay = 0.1 // 遅延を追加してローディング状態をテスト
        mockRepository.dailyMeetingMinutes = [60, 30, 90, 0, 45, 0, 120]
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // 初期状態
        #expect(viewModel.isLoading == false)
        
        // When - 非同期でloadStatsを開始
        let task = Task {
            await viewModel.loadStats()
        }
        
        // ローディング中
        try await Task.sleep(nanoseconds: 10_000_000) // 0.01秒待機
        #expect(viewModel.isLoading == true)
        
        // 完了を待つ
        await task.value
        
        // Then - ローディング完了
        #expect(viewModel.isLoading == false)
        #expect(viewModel.averageDailyMinutes == 49.3)
    }
    
    @Test("エラー時の処理が正しく行われる")
    @MainActor
    func test_errorHandling() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.shouldThrowError = true
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When
        await viewModel.loadStats()
        
        // Then
        #expect(viewModel.errorMessage == "統計データの取得に失敗しました")
        #expect(viewModel.averageDailyMinutes == 0.0)
        #expect(viewModel.averageDailyMinutesText == "0.0分")
    }
}

    @Test("週次データが正しく設定される")
    @MainActor
    func test_weeklyDataIsSet() async throws {
        // Given
        let mockRepository = MockMeetingStatsRepository()
        mockRepository.dailyMeetingMinutes = [60, 30, 90, 0, 45, 0, 120]
        
        let viewModel = MeetingStatsViewModel(repository: mockRepository)
        
        // When
        await viewModel.loadStats()
        
        // Then
        #expect(viewModel.weeklyData.count == 7)
        #expect(viewModel.weeklyData[0].totalMinutes == 60)
        #expect(viewModel.weeklyData[6].totalMinutes == 120)
    }

// MARK: - Mock Repository
class MockMeetingStatsRepository: MeetingStatsRepositoryProtocol {
    var dailyMeetingMinutes: [Int] = []
    var delay: TimeInterval = 0
    var shouldThrowError = false
    
    func fetchMeetingStats(days: Int) async throws -> MeetingStatsResponse {
        if shouldThrowError {
            throw APIError.networkError("統計データの取得に失敗しました")
        }
        
        if delay > 0 {
            try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
        }
        
        // サーバー側で計算された平均値を返す
        let totalMinutes = dailyMeetingMinutes.reduce(0, +)
        let averageMinutes = Double(totalMinutes) / Double(days)
        
        // 小数点第1位で丸める
        let roundedAverage = round(averageMinutes * 10) / 10
        
        let dailyStats = dailyMeetingMinutes.enumerated().map { index, minutes in
            let date = Calendar.current.date(byAdding: .day, value: -(days - index), to: Date())!
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            let dayNames = ["日", "月", "火", "水", "木", "金", "土"]
            let dayName = dayNames[Calendar.current.component(.weekday, from: date) - 1]
            return DailyMeetingMinutes(date: formatter.string(from: date), dayName: dayName, totalMinutes: minutes)
        }
        
        return MeetingStatsResponse(
            averageDailyMinutes: roundedAverage,
            weeklyData: dailyStats
        )
    }
}