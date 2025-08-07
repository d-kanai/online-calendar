import SwiftUI
import Home
import Core
import Meeting

struct HomeTabView: View {
    let homeViewModel: HomeViewModel
    @ObservedObject var navigationState: NavigationState
    @StateObject private var createMeetingViewModel = CreateMeetingViewModel()
    @EnvironmentObject private var toastManager: ToastManager
    
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
                isPresented: $navigationState.showCreateMeetingModal,
                onSuccess: {
                    toastManager.showSuccess("会議を作成しました")
                }
            )
        }
    }
}