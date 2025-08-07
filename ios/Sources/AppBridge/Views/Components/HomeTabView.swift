import SwiftUI
import Home
import Core
import Meeting

struct HomeTabView: View {
    let homeViewModel: HomeViewModel
    @ObservedObject var navigationState: NavigationState
    @StateObject private var createMeetingViewModel = CreateMeetingViewModel()
    
    var body: some View {
        NavigationView {
            HomeScreen(
                viewModel: homeViewModel,
                navigationHandler: navigationState
            )
        }
        .sheet(isPresented: $navigationState.showCreateMeetingModal) {
            CreateMeetingModalView(
                viewModel: createMeetingViewModel,
                isPresented: $navigationState.showCreateMeetingModal
            )
        }
    }
}