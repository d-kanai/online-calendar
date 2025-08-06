import SwiftUI
import Core

public struct RootView: View {
    @StateObject private var authState = AuthState.shared
    
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
    }
}