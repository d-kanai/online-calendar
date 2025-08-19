import SwiftUI
import Core

// MARK: - HomeScreen

public struct HomeScreen: View {
    @StateObject private var viewModel: HomeViewModel
    @State private var loadTask: Task<Void, Error>?
    @Themed private var theme
    
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
        .background(theme.backgroundColor)
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
            VStack(spacing: theme.spacing.large) {
                HeaderSection
                SummaryCardsSection
                NextMeetingSection
                Spacer(minLength: theme.spacing.xxLarge)
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
        VStack(spacing: theme.spacing.medium) {
            // 会議作成ボタン
            CreateMeetingButton
            
            // サマリーカード
            TodayMeetingsCard
            WeeklyStatsCard
        }
        .padding(.horizontal, theme.spacing.medium)
    }
    
    var NextMeetingSection: some View {
        Group {
            if let nextMeeting = viewModel.summary?.nextMeeting {
                NextMeetingCard(meeting: nextMeeting)
                    .padding(.horizontal, theme.spacing.medium)
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
                    .font(theme.font(.title2))
                Text("新規会議作成")
                    .font(theme.font(.headline))
                Spacer()
                Image(systemName: "chevron.right")
                    .font(theme.font(.caption))
                    .foregroundColor(theme.primaryColor.opacity(0.7))
            }
            .padding(theme.spacing.medium)
            .foregroundColor(theme.primaryColor)
            .background(theme.primaryColor.opacity(0.1))
            .cornerRadius(theme.radius.large)
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

// MARK: - Previews
#if DEBUG
struct HomeScreen_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            NavigationView {
                HomeScreen(
                    viewModel: MockHomeViewModel(),
                    navigationHandler: MockNavigationHandler()
                )
            }
            .withDynamicTheme()
            .preferredColorScheme(.light)
            .previewDisplayName("Light Mode")
            
            NavigationView {
                HomeScreen(
                    viewModel: MockHomeViewModel(),
                    navigationHandler: MockNavigationHandler()
                )
            }
            .withDynamicTheme()
            .preferredColorScheme(.dark)
            .previewDisplayName("Dark Mode")
        }
    }
}

// MARK: - Mock Classes for Preview
private class MockHomeViewModel: HomeViewModel {
    init() {
        super.init()
        self.summary = HomeSummary(
            todayMeetingsCount: 5,
            nextMeeting: Meeting(
                id: "1",
                title: "デザインレビュー",
                startTime: Date().addingTimeInterval(30 * 60)
            ),
            weeklyMeetingHours: 12.5,
            userName: "テストユーザー"
        )
    }
}

private class MockNavigationHandler: NavigationHandler {
    func navigate(to action: NavigationAction) {
        print("Navigate to: \(action)")
    }
}
#endif

