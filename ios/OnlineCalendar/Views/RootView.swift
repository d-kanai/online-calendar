import SwiftUI

struct RootView: View {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some View {
        if authManager.isAuthenticated {
            MeetingListView()
                .environmentObject(authManager)
        } else {
            SignInView()
        }
    }
}