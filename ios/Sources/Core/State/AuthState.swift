import Foundation
import SwiftUI

// MARK: - AuthState
// 認証状態の管理とトークンの永続化を担当
@MainActor
public class AuthState: ObservableObject, TokenProvider {
    public static let shared = AuthState()
    
    // MARK: - Published Properties
    @Published public var isAuthenticated = false
    
    // MARK: - Private Properties
    private var authToken: String?
    private var currentUser: User?
    
    // MARK: - Public Computed Properties
    public var currentToken: String? {
        #if targetEnvironment(simulator) && DEBUG
        // E2Eテストモードの場合は固定トークンを返す
        if ProcessInfo.processInfo.arguments.contains("E2E_AUTH_BYPASS") {
            return "e2e-test-token"
        }
        #endif
        return authToken
    }
    private let userDefaults = UserDefaults.standard
    private let tokenKey = "authToken"
    private let userKey = "currentUser"
    
    // MARK: - Initialization
    public init() {
        #if targetEnvironment(simulator) && DEBUG
        // E2Eテストモードかつバイパスが有効な場合のみ認証をバイパス
        if ProcessInfo.processInfo.arguments.contains("E2E_AUTH_BYPASS") {
            setupE2ESession()
        } else {
            loadStoredSession()
        }
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
    public func setSession(token: String, user: User) {
        self.authToken = token
        self.currentUser = user
        self.isAuthenticated = true
        
        // 永続化
        userDefaults.set(token, forKey: tokenKey)
        if let userData = try? JSONEncoder().encode(user) {
            userDefaults.set(userData, forKey: userKey)
        }
        
    }
    
    public func clearSession() {
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
    
}