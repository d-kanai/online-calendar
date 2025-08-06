import Foundation

public struct HomeSummary {
    public let todayMeetingsCount: Int
    public let nextMeeting: Meeting?
    public let weeklyMeetingHours: Double
    public let userName: String
    
    public init(
        todayMeetingsCount: Int,
        nextMeeting: Meeting?,
        weeklyMeetingHours: Double,
        userName: String
    ) {
        self.todayMeetingsCount = todayMeetingsCount
        self.nextMeeting = nextMeeting
        self.weeklyMeetingHours = weeklyMeetingHours
        self.userName = userName
    }
}

// Temporary Meeting struct for Home module
// TODO: Use Meeting from Meeting module when cross-module reference is set up
public struct Meeting {
    public let id: String
    public let title: String
    public let startTime: Date
    
    public init(id: String, title: String, startTime: Date) {
        self.id = id
        self.title = title
        self.startTime = startTime
    }
}