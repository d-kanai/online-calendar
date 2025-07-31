import Foundation

// MARK: - Auth Repository Protocol
protocol AuthRepositoryProtocol {
    func signIn(email: String, password: String) async throws -> AuthResponse
    func signUp(email: String, password: String, name: String) async throws -> AuthResponse
    func signOut() async throws
    func refreshToken(_ refreshToken: String) async throws -> AuthResponse
    func getCurrentUser(token: String) async throws -> User
}

// MARK: - Auth Repository Implementation
class AuthRepository: AuthRepositoryProtocol {
    private let apiClient = APIClient.shared
    
    func signIn(email: String, password: String) async throws -> AuthResponse {
        let request = SignInRequest(email: email, password: password)
        let response = try await apiClient.post(
            "/auth/signin",
            body: request,
            type: APIResponse<AuthResponse>.self
        )
        return response.data
    }
    
    func signUp(email: String, password: String, name: String) async throws -> AuthResponse {
        let request = SignUpRequest(email: email, password: password, name: name)
        let response = try await apiClient.post(
            "/auth/signup",
            body: request,
            type: APIResponse<AuthResponse>.self
        )
        return response.data
    }
    
    func signOut() async throws {
        // サーバー側でトークンを無効化する場合
        let _ = try await apiClient.post(
            "/auth/signout",
            body: EmptyRequest(),
            type: APIResponse<SignOutResponse>.self
        )
    }
    
    func refreshToken(_ refreshToken: String) async throws -> AuthResponse {
        let request = RefreshTokenRequest(refreshToken: refreshToken)
        let response = try await apiClient.post(
            "/auth/refresh",
            body: request,
            type: APIResponse<AuthResponse>.self
        )
        return response.data
    }
    
    func getCurrentUser(token: String) async throws -> User {
        let response = try await apiClient.get(
            "/auth/me",
            type: APIResponse<User>.self
        )
        return response.data
    }
}

// MARK: - Request Models
private struct SignInRequest: Encodable {
    let email: String
    let password: String
}

private struct SignUpRequest: Encodable {
    let email: String
    let password: String
    let name: String
}

private struct RefreshTokenRequest: Encodable {
    let refreshToken: String
}

private struct EmptyRequest: Encodable {}

// MARK: - Response Models
struct AuthResponse: Decodable {
    let token: String
    let refreshToken: String?
    let user: User
}

// APIレスポンス用の内部型
private struct SignOutResponse: Decodable {
    let message: String?
}