import SwiftUI
import Home

struct HomeTabView: View {
    let homeViewModel: HomeViewModel
    let navigationState: NavigationState
    
    var body: some View {
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
}