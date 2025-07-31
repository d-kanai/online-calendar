import Foundation
import SwiftUI

// MARK: - AuthManager
// 認証状態の管理とトークンの永続化を担当
@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
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
        loadStoredSession()
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