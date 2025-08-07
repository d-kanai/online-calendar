import SwiftUI
import Meeting
import Core

struct MeetingListTabView: View {
    let meetingListViewModel: MeetingListViewModel
    @ObservedObject var navigationState: NavigationState
    @State private var showCreateModal = false
    @StateObject private var createMeetingViewModel = CreateMeetingViewModel()
    @EnvironmentObject private var toastManager: ToastManager
    
    var body: some View {
        NavigationView {
            MeetingListScreen(
                viewModel: meetingListViewModel,
                onCreateMeeting: {
                    showCreateModal = true
                }
            )
            .toolbar {
                AppHeader()
            }
            .onAppear {
                handleNavigationFromHome()
            }
        }
        .sheet(isPresented: $showCreateModal) {
            CreateMeetingModalView(
                viewModel: createMeetingViewModel,
                isPresented: $showCreateModal,
                onSuccess: {
                    toastManager.showSuccess("会議を作成しました")
                }
            )
        }
    }
}

// MARK: - Navigation Handling
private extension MeetingListTabView {
    func handleNavigationFromHome() {
        // TODO: Apply filter logic when navigated from Home
        print("📅 Navigated to meetings from Home")
    }
}