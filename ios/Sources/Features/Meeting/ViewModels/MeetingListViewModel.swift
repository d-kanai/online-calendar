import Foundation
import SwiftUI

@MainActor
public class MeetingListViewModel: MeetingListViewModelProtocol {
    // MARK: - Published Properties
    @Published public var meetings: [Meeting] = []
    @Published public var errorMessage: String?
    @Published public var selectedMeeting: Meeting?
    
    // MARK: - Dependencies
    private let repository: MeetingRepositoryProtocol
    
    // MARK: - Initialization
    public init(repository: MeetingRepositoryProtocol = MeetingRepository()) {
        self.repository = repository
    }
    
    // MARK: - Meeting Management
    public func loadMeetings() async {
        errorMessage = nil
        
        do {
            meetings = try await repository.fetchMeetings()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    public func refreshMeetings() async {
        await loadMeetings()
    }
    
    // MARK: - Meeting Actions
    public func selectMeeting(_ meeting: Meeting) {
        selectedMeeting = meeting
    }
    
}