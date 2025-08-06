import SwiftUI
import Home
import Core

struct HomeTabView: View {
    let homeViewModel: HomeViewModel
    let navigationState: NavigationState
    
    var body: some View {
        NavigationView {
            HomeScreen(
                viewModel: homeViewModel,
                navigationHandler: navigationState
            )
        }
    }
}