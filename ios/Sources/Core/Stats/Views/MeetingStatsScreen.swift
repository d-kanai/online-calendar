import SwiftUI

public struct MeetingStatsScreen: View {
    @ObservedObject private var viewModel: MeetingStatsViewModel
    @State private var loadStatsTask: Task<Void, Error>?
    
    public init(viewModel: MeetingStatsViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        NavigationView {
            ZStack {
                #if os(iOS)
                Color(UIColor.systemGroupedBackground)
                    .ignoresSafeArea()
                #else
                Color(.gray).opacity(0.1)
                    .ignoresSafeArea()
                #endif
                
                if loadStatsTask != nil {
                    LoadingView()
                } else if let errorMessage = viewModel.errorMessage {
                    StatsErrorView(message: errorMessage)
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            AverageTimeCard(averageMinutes: viewModel.averageDailyMinutes)
                            
                            if !viewModel.weeklyData.isEmpty {
                                SimpleBarChart(weeklyData: viewModel.weeklyData)
                                
                                DailyBreakdownCard(weeklyData: viewModel.weeklyData)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("会議統計")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.large)
            #endif
        }
        .task {
            loadStatsTask = Task {
                await viewModel.loadStats()
                loadStatsTask = nil
            }
        }
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("統計データ表示") {
    MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.withData())
}

#Preview("空の状態") {
    MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.empty())
}

#Preview("エラー状態") {
    MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.withError())
}

#Preview("ローディング状態") {
    MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.loading())
}

// MARK: - Preview Mock Classes
@MainActor
private class MockMeetingStatsViewModel: MeetingStatsViewModel {
    private var shouldSkipLoading = false
    
    override init(repository: MeetingStatsRepositoryProtocol = MockMeetingStatsRepository()) {
        super.init(repository: repository)
    }
    
    static func withData() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.averageDailyMinutes = 125
        viewModel.weeklyData = [
            DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 180),
            DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 90),
            DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 150),
            DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 60),
            DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 210),
            DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 45),
            DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 135)
        ]
        return viewModel
    }
    
    static func empty() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.averageDailyMinutes = 0
        viewModel.weeklyData = []
        return viewModel
    }
    
    static func withError() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.errorMessage = "統計データの取得に失敗しました"
        return viewModel
    }
    
    static func loading() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        // shouldSkipLoadingをfalseにしてローディング状態を維持
        return viewModel
    }
    
    override func loadStats() async {
        guard !shouldSkipLoading else { return }
        await super.loadStats()
    }
}

private class MockMeetingStatsRepository: MeetingStatsRepositoryProtocol {
    func fetchMeetingStats(days: Int) async throws -> MeetingStatsResponse {
        return MeetingStatsResponse(averageDailyMinutes: 0, weeklyData: [])
    }
}

#endif