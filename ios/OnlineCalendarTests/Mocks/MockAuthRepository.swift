import Foundation
@testable import OnlineCalendar

// MARK: - Mock Auth Repository
class MockAuthRepository: AuthRepositoryProtocol {
    var signInResult: Result<AuthResponse, Error> = .failure(APIError.networkError("Not configured"))
    var signUpResult: Result<AuthResponse, Error> = .failure(APIError.networkError("Not configured"))
    var signOutCalled = false
    var signInCalled = false
    var refreshTokenResult: Result<AuthResponse, Error> = .failure(APIError.networkError("Not configured"))
    var getCurrentUserResult: Result<User, Error> = .failure(APIError.networkError("Not configured"))
    
    func signIn(email: String, password: String) async throws -> AuthResponse {
        signInCalled = true
        switch signInResult {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    func signUp(email: String, password: String, name: String) async throws -> AuthResponse {
        switch signUpResult {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    func signOut() async throws {
        signOutCalled = true
    }
    
    func refreshToken(_ refreshToken: String) async throws -> AuthResponse {
        switch refreshTokenResult {
        case .success(let response):
            return response
        case .failure(let error):
            throw error
        }
    }
    
    func getCurrentUser(token: String) async throws -> User {
        switch getCurrentUserResult {
        case .success(let user):
            return user
        case .failure(let error):
            throw error
        }
    }
}

// MARK: - Mock Auth Response
struct MockAuthResponse {
    let token: String
    let refreshToken: String?
    let user: User
    
    func toAuthResponse() -> AuthResponse {
        // AuthResponseのデコーダーを使ってオブジェクトを作成
        let jsonData = """
        {
            "token": "\(token)",
            "refreshToken": "\(refreshToken ?? "")",
            "user": {
                "id": "\(user.id)",
                "email": "\(user.email)",
                "name": "\(user.name)"
            }
        }
        """.data(using: .utf8)!
        
        return try! JSONDecoder().decode(AuthResponse.self, from: jsonData)
    }
}