import SwiftUI

struct RootView: View {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var meetingListViewModel = MeetingListViewModel()
    
    var body: some View {
        if authManager.isAuthenticated {
            MeetingListView(viewModel: meetingListViewModel)
                .environmentObject(authManager)
        } else {
            SignInView()
        }
    }
}