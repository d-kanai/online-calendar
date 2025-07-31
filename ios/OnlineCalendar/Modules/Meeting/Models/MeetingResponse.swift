import Foundation

// MARK: - API Response Models
struct MeetingResponse: Decodable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let isImportant: Bool
    let ownerId: String
    let owner: String
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, title, startTime, endTime, isImportant, ownerId, owner, createdAt, updatedAt
    }
}

struct ParticipantResponse: Decodable {
    let id: String
    let email: String
    let name: String
    
    enum CodingKeys: String, CodingKey {
        case id, email, name
    }
}