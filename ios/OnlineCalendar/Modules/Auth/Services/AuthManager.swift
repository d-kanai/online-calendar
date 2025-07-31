import Foundation
import SwiftUI

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated = false
    @Published var authToken: String?
    @Published var currentUser: User?
    
    private let repository: AuthRepositoryProtocol
    
    private init(repository: AuthRepositoryProtocol = AuthRepository()) {
        self.repository = repository
        checkStoredToken()
    }
    
    private func checkStoredToken() {
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            self.authToken = token
            self.isAuthenticated = true
            print("✅ [AuthManager] Found stored token")
        } else {
            print("❌ [AuthManager] No stored token found")
        }
    }
    
    func signIn(email: String, password: String) async throws {
        print("🔐 [AuthManager] Attempting sign in for: \(email)")
        
        do {
            let response = try await repository.signIn(email: email, password: password)
            
            self.authToken = response.token
            self.currentUser = response.user
            self.isAuthenticated = true
            
            // トークンを保存
            UserDefaults.standard.set(response.token, forKey: "authToken")
            
            print("✅ [AuthManager] Sign in successful")
        } catch {
            print("❌ [AuthManager] Sign in failed: \(error)")
            throw error
        }
    }
    
    func signOut() {
        authToken = nil
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "authToken")
        print("👋 [AuthManager] Signed out")
    }
}