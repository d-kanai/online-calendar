import SwiftUI
import Core

public struct RootView: View {
    @StateObject private var authState = AuthState.shared
    @StateObject private var themeProvider = ThemeProvider.shared
    
    public init() {}
    
    public var body: some View {
        Group {
            if authState.isAuthenticated {
                AuthenticatedView()
            } else {
                UnauthenticatedView()
            }
        }
        .environmentObject(authState)
        .withDynamicTheme()
        .onAppear {
            themeProvider.setTheme(for: "default")
        }
    }
}