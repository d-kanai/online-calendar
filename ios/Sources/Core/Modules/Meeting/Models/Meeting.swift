import Foundation

struct Meeting: Identifiable {
    let id: String
    let title: String
    let description: String?
    let startDate: Date
    let endDate: Date
    let organizer: Organizer
    let participants: [Participant]
    
    // 通常のイニシャライザ
    init(
        id: String,
        title: String,
        description: String? = nil,
        startDate: Date,
        endDate: Date,
        organizer: Organizer,
        participants: [Participant] = []
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.startDate = startDate
        self.endDate = endDate
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
        self.organizer = Organizer(
            id: response.ownerId,
            name: response.owner.components(separatedBy: "@").first ?? response.owner,
            email: response.owner
        )
        self.participants = response.participants.map { simpleParticipant in
            Participant(
                id: simpleParticipant.id,
                email: simpleParticipant.email,
                name: simpleParticipant.name
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
    let email: String
    let name: String
}