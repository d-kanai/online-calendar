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
    let participants: [ParticipantResponse]
    let createdAt: Date
    let updatedAt: Date
}

struct ParticipantResponse: Decodable {
    let id: String
    let userId: String
    let userName: String
    let userEmail: String
    let status: String
}