import Foundation

class APIClient {
    static let shared = APIClient()
    
    private let baseURL = "http://localhost:3001/api/v1"
    private let session = URLSession.shared
    
    private init() {}
    
    func fetchMeetings() async throws -> [Meeting] {
        guard let url = URL(string: "\(baseURL)/meetings") else {
            print("❌ [APIClient] Invalid URL: \(baseURL)/meetings")
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        // TODO: 実際の認証トークンを実装する必要があります
        request.setValue("Bearer dummy-token", forHTTPHeaderField: "Authorization")
        
        print("📡 [APIClient] Fetching meetings from: \(url)")
        print("📡 [APIClient] Headers: \(request.allHTTPHeaderFields ?? [:])")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                print("❌ [APIClient] Invalid response type")
                throw APIError.invalidResponse
            }
            
            print("📡 [APIClient] Response status: \(httpResponse.statusCode)")
            
            if let responseString = String(data: data, encoding: .utf8) {
                print("📡 [APIClient] Response body: \(responseString)")
            }
            
            guard 200..<300 ~= httpResponse.statusCode else {
                print("❌ [APIClient] HTTP error: \(httpResponse.statusCode)")
                if let errorBody = String(data: data, encoding: .utf8) {
                    print("❌ [APIClient] Error response: \(errorBody)")
                }
                throw APIError.invalidResponse
            }
            
            let decoder = JSONDecoder()
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
            dateFormatter.locale = Locale(identifier: "en_US_POSIX")
            dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
            decoder.dateDecodingStrategy = .formatted(dateFormatter)
            
            do {
                let apiResponse = try decoder.decode(APIResponse<[MeetingResponse]>.self, from: data)
                let meetings = apiResponse.data.map { Meeting(from: $0) }
                print("✅ [APIClient] Successfully decoded \(meetings.count) meetings")
                return meetings
            } catch {
                print("❌ [APIClient] Decoding error: \(error)")
                if let responseString = String(data: data, encoding: .utf8) {
                    print("❌ [APIClient] Raw response: \(responseString)")
                }
                throw APIError.decodingError
            }
        } catch {
            print("❌ [APIClient] Network error: \(error)")
            throw error
        }
    }
}

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case decodingError
}