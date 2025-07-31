import Foundation
import SwiftUI

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated = false
    @Published var authToken: String?
    @Published var currentUser: User?
    
    private init() {
        checkStoredToken()
    }
    
    struct User {
        let id: String
        let email: String
        let name: String
    }
    
    struct SignInResponse: Codable {
        let success: Bool
        let data: AuthData?
        let error: String?
        
        struct AuthData: Codable {
            let token: String
            let user: UserData
            
            struct UserData: Codable {
                let id: String
                let email: String
                let name: String
            }
        }
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
        
        guard let url = URL(string: "http://localhost:3001/api/v1/auth/signin") else {
            throw AuthError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.invalidResponse
        }
        
        print("🔐 [AuthManager] Response status: \(httpResponse.statusCode)")
        
        if let responseString = String(data: data, encoding: .utf8) {
            print("🔐 [AuthManager] Response body: \(responseString)")
        }
        
        guard 200..<300 ~= httpResponse.statusCode else {
            throw AuthError.authenticationFailed
        }
        
        let decoder = JSONDecoder()
        let signInResponse = try decoder.decode(SignInResponse.self, from: data)
        
        guard signInResponse.success,
              let authData = signInResponse.data else {
            throw AuthError.authenticationFailed
        }
        
        self.authToken = authData.token
        self.currentUser = User(
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name
        )
        self.isAuthenticated = true
        
        // トークンを保存
        UserDefaults.standard.set(authData.token, forKey: "authToken")
        
        print("✅ [AuthManager] Sign in successful")
    }
    
    func signOut() {
        authToken = nil
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "authToken")
        print("👋 [AuthManager] Signed out")
    }
}

enum AuthError: LocalizedError {
    case invalidURL
    case invalidResponse
    case authenticationFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid server response"
        case .authenticationFailed:
            return "Authentication failed"
        }
    }
}