import SwiftUI

struct RootView: View {
    @StateObject private var authState = AuthState.shared
    @StateObject private var meetingListViewModel = MeetingListViewModel()
    
    var body: some View {
        if authState.isAuthenticated {
            MeetingListScreen(viewModel: meetingListViewModel)
                .environmentObject(authState)
        } else {
            SignInScreen()
        }
    }
}