import SwiftUI
import Core
import Auth
import Meeting
import Stats
import Home

struct MainTabView: View {
    @StateObject private var homeViewModel = HomeViewModel()
    @StateObject private var meetingListViewModel = MeetingListViewModel()
    @StateObject private var meetingStatsViewModel = MeetingStatsViewModel()
    @EnvironmentObject private var navigationState: NavigationState
    
    var body: some View {
        TabView(selection: $navigationState.selectedTab) {
            HomeTab
                .tabItem {
                    TabItemContent(
                        systemImage: "house.fill",
                        title: "ホーム"
                    )
                }
                .tag(0)
            
            MeetingListTab
                .tabItem {
                    TabItemContent(
                        systemImage: "calendar",
                        title: "会議"
                    )
                }
                .tag(1)
            
            StatsTab
                .tabItem {
                    TabItemContent(
                        systemImage: "chart.bar.fill",
                        title: "統計"
                    )
                }
                .tag(2)
            
            #if DEBUG
            DevTab
                .tabItem {
                    TabItemContent(
                        systemImage: "hammer.fill",
                        title: "開発"
                    )
                }
                .tag(3)
            #endif
        }
    }
}

// MARK: - Tab Item Component
private struct TabItemContent: View {
    let systemImage: String
    let title: String
    
    var body: some View {
        Image(systemName: systemImage)
        Text(title)
    }
}

// MARK: - Tab Views
private extension MainTabView {
    var HomeTab: some View {
        HomeTabView(
            homeViewModel: homeViewModel,
            navigationState: navigationState
        )
    }
    
    var MeetingListTab: some View {
        MeetingListTabView(
            meetingListViewModel: meetingListViewModel,
            navigationState: navigationState
        )
    }
    
    var StatsTab: some View {
        StatsTabView(
            meetingStatsViewModel: meetingStatsViewModel,
            navigationState: navigationState
        )
    }
    
    #if DEBUG
    var DevTab: some View {
        DevTabView()
    }
    #endif
}