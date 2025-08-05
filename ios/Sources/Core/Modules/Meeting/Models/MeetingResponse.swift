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
    let participants: [SimpleParticipant]
    let createdAt: Date
    let updatedAt: Date
}

struct SimpleParticipant: Decodable {
    let id: String
    let email: String
    let name: String
}