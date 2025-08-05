import Foundation

public struct Meeting: Identifiable {
    public let id: String
    public let title: String
    public let description: String?
    public let startDate: Date
    public let endDate: Date
    public let organizer: Organizer
    public let participants: [Participant]
    
    // 通常のイニシャライザ
    public init(
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

public struct Organizer: Codable {
    public let id: String
    public let name: String
    public let email: String
    
    public init(id: String, name: String, email: String) {
        self.id = id
        self.name = name
        self.email = email
    }
}

public struct Participant: Codable {
    public let id: String
    public let email: String
    public let name: String?
    
    public init(id: String, email: String, name: String? = nil) {
        self.id = id
        self.email = email
        self.name = name
    }
}