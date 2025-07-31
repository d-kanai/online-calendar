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
    
    // 通常のイニシャライザ
    init(
        id: String,
        title: String,
        description: String? = nil,
        startDate: Date,
        endDate: Date,
        location: String? = nil,
        isOnline: Bool = false,
        onlineUrl: String? = nil,
        organizer: Organizer,
        participants: [Participant] = []
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.startDate = startDate
        self.endDate = endDate
        self.location = location
        self.isOnline = isOnline
        self.onlineUrl = onlineUrl
        self.organizer = organizer
        self.participants = participants
    }
    
    // APIレスポンスからの変換用
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