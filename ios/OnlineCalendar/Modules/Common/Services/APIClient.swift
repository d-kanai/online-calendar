import Foundation

// MARK: - Generic HTTP Client
class APIClient {
    static let shared = APIClient()
    
    let baseURL = "http://localhost:3001/api/v1"
    private let session = URLSession.shared
    
    private init() {}
    
    // MARK: - Generic Request Methods
    func get<T: Decodable>(_ endpoint: String, type: T.Type) async throws -> T {
        return try await request(endpoint: endpoint, method: "GET", body: nil as Data?, type: type)
    }
    
    func post<T: Decodable, U: Encodable>(_ endpoint: String, body: U, type: T.Type) async throws -> T {
        let data = try JSONEncoder().encode(body)
        return try await request(endpoint: endpoint, method: "POST", body: data, type: type)
    }
    
    func put<T: Decodable, U: Encodable>(_ endpoint: String, body: U, type: T.Type) async throws -> T {
        let data = try JSONEncoder().encode(body)
        return try await request(endpoint: endpoint, method: "PUT", body: data, type: type)
    }
    
    func delete(_ endpoint: String) async throws {
        let _: EmptyResponse = try await request(endpoint: endpoint, method: "DELETE", body: nil as Data?, type: EmptyResponse.self)
    }
    
    // MARK: - Private Request Method
    private func request<T: Decodable>(
        endpoint: String,
        method: String,
        body: Data? = nil,
        type: T.Type
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            print("❌ [APIClient] Invalid URL: \(baseURL)\(endpoint)")
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = await getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            print("📡 [APIClient] Using auth token")
        }
        
        // Add body if provided
        if let body = body {
            request.httpBody = body
        }
        
        print("🔄 [APIClient] Starting \(method) request to \(endpoint)")
        print("📡 [APIClient] \(method) \(url)")
        print("📡 [APIClient] Headers: \(request.allHTTPHeaderFields ?? [:])")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                print("❌ [APIClient] Invalid response type")
                throw APIError.invalidResponse
            }
            
            print("✅ [APIClient] Response status: \(httpResponse.statusCode)")
            
            if let responseString = String(data: data, encoding: .utf8) {
                print("📡 [APIClient] Response body: \(responseString)")
            }
            
            // Handle HTTP errors
            switch httpResponse.statusCode {
            case 200..<300:
                break // Success
            case 401:
                throw APIError.unauthorized
            case 404:
                throw APIError.notFound
            case 500..<600:
                throw APIError.serverError(httpResponse.statusCode)
            default:
                throw APIError.httpError(httpResponse.statusCode)
            }
            
            // Decode response
            do {
                let decoder = createJSONDecoder()
                return try decoder.decode(T.self, from: data)
            } catch {
                print("❌ [APIClient] Decoding error: \(error)")
                throw APIError.decodingError
            }
        } catch {
            print("❌ [APIClient] Network error: \(error)")
            throw error
        }
    }
    
    // MARK: - Helper Methods
    @MainActor
    private func getAuthToken() -> String? {
        return AuthState.shared.currentToken
    }
    
    func createJSONDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        decoder.dateDecodingStrategy = .formatted(dateFormatter)
        return decoder
    }
}

// MARK: - Empty Response for DELETE requests
struct EmptyResponse: Decodable {}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case decodingError
    case unauthorized
    case notFound
    case httpError(Int)
    case serverError(Int)
    case notImplemented
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid server response"
        case .decodingError:
            return "Failed to decode response"
        case .unauthorized:
            return "Authentication required"
        case .notFound:
            return "Resource not found"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .notImplemented:
            return "This feature is not implemented yet"
        }
    }
}