import SwiftUI
import Stats

struct StatsTabView: View {
    let meetingStatsViewModel: MeetingStatsViewModel
    let navigationState: NavigationState
    
    var body: some View {
        NavigationView {
            MeetingStatsScreen(viewModel: meetingStatsViewModel)
                .toolbar {
                    AppHeader()
                }
                .onAppear {
                    handleNavigationFromHome()
                }
        }
    }
}

// MARK: - Navigation Handling
private extension StatsTabView {
    func handleNavigationFromHome() {
        // TODO: Apply time range logic when navigated from Home
        print("📊 Navigated to stats from Home")
    }
}