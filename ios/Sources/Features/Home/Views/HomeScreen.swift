import SwiftUI
import Core

// MARK: - HomeScreen

public struct HomeScreen: View {
    @StateObject private var viewModel: HomeViewModel
    @State private var loadTask: Task<Void, Error>?
    
    // Type-safe navigation handler for cross-module navigation
    private let navigationHandler: NavigationHandler
    
    public init(
        viewModel: HomeViewModel,
        navigationHandler: NavigationHandler
    ) {
        self._viewModel = StateObject(wrappedValue: viewModel)
        self.navigationHandler = navigationHandler
    }
    
    public var body: some View {
        Group {
            if let errorMessage = viewModel.errorMessage {
                ErrorState(message: errorMessage)
            } else if viewModel.isLoading && viewModel.summary == nil {
                LoadingState
            } else {
                ContentView
            }
        }
#if !os(macOS)
        .navigationBarHidden(shouldHideNavigationBar)
        #endif
        .onAppear {
            loadDataIfNeeded()
        }
        .onDisappear {
            cancelLoadTask()
        }
    }
}

// MARK: - Main Views
private extension HomeScreen {
    var ContentView: some View {
        ScrollView {
            VStack(spacing: 24) {
                HeaderSection
                SummaryCardsSection
                NextMeetingSection
                Spacer(minLength: 40)
            }
        }
        .refreshable {
            await viewModel.refresh()
        }
    }
    
    var LoadingState: some View {
        HomeLoadingView()
    }
    
    func ErrorState(message: String) -> some View {
        HomeErrorView(message: message) {
            Task {
                await viewModel.loadSummary()
            }
        }
    }
}

// MARK: - View Sections
private extension HomeScreen {
    var HeaderSection: some View {
        HomeHeaderView(userName: viewModel.summary?.userName)
    }
    
    var SummaryCardsSection: some View {
        VStack(spacing: 16) {
            // 会議作成ボタン
            CreateMeetingButton
            
            // サマリーカード
            TodayMeetingsCard
            WeeklyStatsCard
        }
        .padding(.horizontal)
    }
    
    var NextMeetingSection: some View {
        Group {
            if let nextMeeting = viewModel.summary?.nextMeeting {
                NextMeetingCard(meeting: nextMeeting)
                    .padding(.horizontal)
            }
        }
    }
}

// MARK: - Action Buttons
private extension HomeScreen {
    var CreateMeetingButton: some View {
        Button(action: {
            navigationHandler.navigate(to: .createMeeting)
        }) {
            HStack {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                Text("新規会議作成")
                    .font(.headline)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.blue.opacity(0.1))
            .cornerRadius(12)
        }
        .accessibilityIdentifier("createMeetingButtonHome")
    }
}

// MARK: - Summary Cards
private extension HomeScreen {
    var TodayMeetingsCard: some View {
        SummaryCard(
            title: "今日の会議",
            systemImage: "calendar",
            value: todayMeetingsValue,
            isLoading: viewModel.isLoading,
            onTap: {
                navigationHandler.navigate(to: .todayMeetings)
            }
        )
    }
    
    var WeeklyStatsCard: some View {
        SummaryCard(
            title: "今週の会議時間",
            systemImage: "chart.bar",
            value: weeklyMeetingHoursValue,
            isLoading: viewModel.isLoading,
            onTap: {
                navigationHandler.navigate(to: .weeklyStats)
            }
        )
    }
}

// MARK: - Computed Properties
private extension HomeScreen {
    var todayMeetingsValue: String? {
        guard let count = viewModel.summary?.todayMeetingsCount else { return nil }
        return "\(count)件"
    }
    
    var weeklyMeetingHoursValue: String? {
        guard let hours = viewModel.summary?.weeklyMeetingHours else { return nil }
        return String(format: "%.1f時間", hours)
    }
    
    var shouldHideNavigationBar: Bool {
        #if os(macOS)
        return false
        #else
        return true
        #endif
    }
}

// MARK: - Actions
private extension HomeScreen {
    func loadDataIfNeeded() {
        if viewModel.summary == nil {
            loadTask = Task {
                await viewModel.loadSummary()
            }
        }
    }
    
    func cancelLoadTask() {
        loadTask?.cancel()
    }
}

