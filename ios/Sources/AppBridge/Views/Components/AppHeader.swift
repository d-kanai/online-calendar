import SwiftUI
import Core

public struct AppHeader: ToolbarContent {
    @EnvironmentObject private var authState: AuthState
    
    public init() {}
    
    public var body: some ToolbarContent {
        ToolbarItem(placement: .automatic) {
            Button("サインアウト") {
                authState.clearSession()
            }
        }
    }
}