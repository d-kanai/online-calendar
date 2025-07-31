import Foundation

struct Meeting: Identifiable {
    let id: String
    let title: String
    let description: String?
    let startDate: Date
    let endDate: Date
    let location: String?
    let isOnline: Bool
    let onlineUrl: String?
    let organizer: Organizer
    let participants: [Participant]
    
    init(from response: MeetingResponse) {
        self.id = response.id
        self.title = response.title
        self.description = nil
        self.startDate = response.startTime
        self.endDate = response.endTime
        self.location = nil
        self.isOnline = false
        self.onlineUrl = nil
        self.organizer = Organizer(
            id: response.ownerId,
            name: response.owner.components(separatedBy: "@").first ?? response.owner,
            email: response.owner
        )
        self.participants = response.participants.map { participantResponse in
            Participant(
                id: participantResponse.id,
                userId: participantResponse.userId,
                userName: participantResponse.userName,
                userEmail: participantResponse.userEmail,
                status: participantResponse.status
            )
        }
    }
}

struct Organizer: Codable {
    let id: String
    let name: String
    let email: String
}

struct Participant: Codable {
    let id: String
    let userId: String
    let userName: String
    let userEmail: String
    let status: String
}