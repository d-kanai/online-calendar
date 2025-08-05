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