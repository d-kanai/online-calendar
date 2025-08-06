import SwiftUI
import Core

struct AuthenticatedView: View {
    @StateObject private var navigationState = NavigationState()
    @EnvironmentObject private var authState: AuthState
    
    var body: some View {
        MainTabView()
            .environmentObject(authState)
            .environmentObject(navigationState)
    }
}