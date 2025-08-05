import SwiftUI

public struct RootView: View {
    @StateObject private var authState = AuthState.shared
    
    public init() {}
    
    public var body: some View {
        if authState.isAuthenticated {
            MainTabView()
                .environmentObject(authState)
        } else {
            SignInScreen()
        }
    }
}

struct MainTabView: View {
    @StateObject private var meetingListViewModel = MeetingListViewModel()
    @StateObject private var meetingStatsViewModel = MeetingStatsViewModel()
    
    var body: some View {
        TabView {
            MeetingListTab
                .tabItem {
                    Image(systemName: "calendar")
                    Text("会議")
                }
            
            StatsTab
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("統計")
                }
        }
    }
}

// MARK: - Tab Views
private extension MainTabView {
    var MeetingListTab: some View {
        NavigationView {
            MeetingListScreen(viewModel: meetingListViewModel)
        }
    }
    
    var StatsTab: some View {
        NavigationView {
            MeetingStatsScreen(viewModel: meetingStatsViewModel)
        }
    }
}