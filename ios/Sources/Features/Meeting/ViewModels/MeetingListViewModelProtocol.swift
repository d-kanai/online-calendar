import Foundation
import SwiftUI

@MainActor
public protocol MeetingListViewModelProtocol: ObservableObject {
    var meetings: [Meeting] { get set }
    var errorMessage: String? { get set }
    var selectedMeeting: Meeting? { get set }
    
    func loadMeetings() async
    func refreshMeetings() async
    func selectMeeting(_ meeting: Meeting)
}