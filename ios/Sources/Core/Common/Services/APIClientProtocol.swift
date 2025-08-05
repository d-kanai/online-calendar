import Foundation

// MARK: - API Client Protocol
public protocol APIClientProtocol {
    func request<T: Decodable>(endpoint: String, method: HTTPMethod) async throws -> T
}

// MARK: - HTTP Method
public enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

// MARK: - API Client Extension
extension APIClient: APIClientProtocol {
    @available(iOS 15.0, macOS 12.0, *)
    public func request<T: Decodable>(endpoint: String, method: HTTPMethod) async throws -> T {
        switch method {
        case .get:
            return try await get(endpoint, type: T.self)
        case .post:
            throw APIError.notImplemented
        case .put:
            throw APIError.notImplemented
        case .delete:
            throw APIError.notImplemented
        }
    }
}