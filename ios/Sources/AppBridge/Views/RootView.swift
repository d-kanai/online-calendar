import SwiftUI
import Core
import Auth
import Meeting
import Stats
import Home

public struct RootView: View {
    @StateObject private var authState = AuthState.shared
    @StateObject private var navigationState = NavigationState()
    
    public init() {}
    
    public var body: some View {
        if authState.isAuthenticated {
            MainTabView()
                .environmentObject(authState)
                .environmentObject(navigationState)
        } else {
            SignInScreen()
        }
    }
}

// Navigation State for cross-module navigation
class NavigationState: ObservableObject {
    @Published var selectedTab: Int = 0
    @Published var meetingListFilter: MeetingListFilter = .all
    @Published var statsTimeRange: StatsTimeRange = .week
    
    func navigateToTodayMeetings() {
        meetingListFilter = .today
        selectedTab = 1 // Meeting tab
    }
    
    func navigateToWeeklyStats() {
        statsTimeRange = .week
        selectedTab = 2 // Stats tab
    }
}

enum MeetingListFilter {
    case all, today, upcoming
}

enum StatsTimeRange {
    case week, month, year
}

struct MainTabView: View {
    @StateObject private var homeViewModel = HomeViewModel()
    @StateObject private var meetingListViewModel = MeetingListViewModel()
    @StateObject private var meetingStatsViewModel = MeetingStatsViewModel()
    @EnvironmentObject private var navigationState: NavigationState
    
    var body: some View {
        TabView(selection: $navigationState.selectedTab) {
            HomeTab
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("ホーム")
                }
                .tag(0)
            
            MeetingListTab
                .tabItem {
                    Image(systemName: "calendar")
                    Text("会議")
                }
                .tag(1)
            
            StatsTab
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("統計")
                }
                .tag(2)
            
            #if DEBUG
            DevTab
                .tabItem {
                    Image(systemName: "hammer.fill")
                    Text("開発")
                }
                .tag(3)
            #endif
        }
    }
}

// MARK: - Tab Views
private extension MainTabView {
    var HomeTab: some View {
        NavigationView {
            HomeScreen(
                viewModel: homeViewModel,
                onTodayMeetingsTapped: {
                    navigationState.navigateToTodayMeetings()
                },
                onWeeklyStatsTapped: {
                    navigationState.navigateToWeeklyStats()
                }
            )
        }
    }
    
    var MeetingListTab: some View {
        NavigationView {
            MeetingListScreen(viewModel: meetingListViewModel)
                .toolbar {
                    AppHeader()
                }
                .onAppear {
                    // Apply filter if navigated from Home
                    if navigationState.meetingListFilter == .today {
                        // TODO: Apply today filter to MeetingListViewModel
                        print("📅 Filtering meetings for today")
                    }
                }
        }
    }
    
    var StatsTab: some View {
        NavigationView {
            MeetingStatsScreen(viewModel: meetingStatsViewModel)
                .toolbar {
                    AppHeader()
                }
                .onAppear {
                    // Apply time range if navigated from Home
                    if navigationState.statsTimeRange == .week {
                        // TODO: Apply weekly stats filter
                        print("📊 Showing weekly stats")
                    }
                }
        }
    }
    
    #if DEBUG
    var DevTab: some View {
        NavigationView {
            PreviewCatalogScreen()
        }
    }
    #endif
}