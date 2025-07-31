import Foundation

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
    let error: String?
}

struct MeetingResponse: Codable {
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

struct ParticipantResponse: Codable {
    let id: String
    let userId: String
    let userName: String
    let userEmail: String
    let status: String
}