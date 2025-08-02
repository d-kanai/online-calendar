import Foundation
import SwiftUI

// MARK: - AuthState
// 認証状態の管理とトークンの永続化を担当
@MainActor
class AuthState: ObservableObject {
    static let shared = AuthState()
    
    // MARK: - Published Properties
    @Published var isAuthenticated = false
    
    // MARK: - Private Properties
    private var authToken: String?
    private var currentUser: User?
    private let userDefaults = UserDefaults.standard
    private let tokenKey = "authToken"
    private let userKey = "currentUser"
    
    // MARK: - Initialization
    private init() {
        #if targetEnvironment(simulator) && DEBUG
        // シミュレータでのデバッグビルドでは常に認証をバイパス
        setupE2ESession()
        #else
        loadStoredSession()
        #endif
    }
    
    private func setupE2ESession() {
        let mockUser = User(
            id: "e2e-test-user",
            email: "test@example.com",
            name: "E2E Test User"
        )
        self.authToken = "e2e-test-token"
        self.currentUser = mockUser
        self.isAuthenticated = true
    }
    
    // MARK: - Session Management
    func setSession(token: String, user: User) {
        self.authToken = token
        self.currentUser = user
        self.isAuthenticated = true
        
        // 永続化
        userDefaults.set(token, forKey: tokenKey)
        if let userData = try? JSONEncoder().encode(user) {
            userDefaults.set(userData, forKey: userKey)
        }
        
    }
    
    func clearSession() {
        authToken = nil
        currentUser = nil
        isAuthenticated = false
        
        // 永続化データをクリア
        userDefaults.removeObject(forKey: tokenKey)
        userDefaults.removeObject(forKey: userKey)
        
    }
    
    // MARK: - Private Methods
    private func loadStoredSession() {
        if let token = userDefaults.string(forKey: tokenKey),
           let userData = userDefaults.data(forKey: userKey),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            self.authToken = token
            self.currentUser = user
            self.isAuthenticated = true
        }
    }
    
    // MARK: - Token Access
    var currentToken: String? {
        return authToken
    }
}