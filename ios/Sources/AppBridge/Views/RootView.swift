import SwiftUI
import Core
import Auth
import Meeting
import Stats

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
            
            #if DEBUG
            DevTab
                .tabItem {
                    Image(systemName: "hammer.fill")
                    Text("開発")
                }
            #endif
        }
    }
}

// MARK: - Tab Views
private extension MainTabView {
    var MeetingListTab: some View {
        NavigationView {
            MeetingListScreen(viewModel: meetingListViewModel)
                .toolbar {
                    AppHeader()
                }
        }
    }
    
    var StatsTab: some View {
        NavigationView {
            MeetingStatsScreen(viewModel: meetingStatsViewModel)
                .toolbar {
                    AppHeader()
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