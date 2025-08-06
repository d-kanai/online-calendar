import SwiftUI
import Meeting

struct MeetingListTabView: View {
    let meetingListViewModel: MeetingListViewModel
    let navigationState: NavigationState
    
    var body: some View {
        NavigationView {
            MeetingListScreen(viewModel: meetingListViewModel)
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
private extension MeetingListTabView {
    func handleNavigationFromHome() {
        // TODO: Apply filter logic when navigated from Home
        print("📅 Navigated to meetings from Home")
    }
}