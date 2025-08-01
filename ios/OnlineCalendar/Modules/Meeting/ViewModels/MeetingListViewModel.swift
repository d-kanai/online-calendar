import Foundation
import SwiftUI

@MainActor
class MeetingListViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var meetings: [Meeting] = []
    @Published var errorMessage: String?
    @Published var selectedMeeting: Meeting?
    
    // MARK: - Dependencies
    private let repository: MeetingRepositoryProtocol
    
    // MARK: - Initialization
    init(repository: MeetingRepositoryProtocol = MeetingRepository()) {
        self.repository = repository
    }
    
    // MARK: - Meeting Management
    func loadMeetings() async {
        errorMessage = nil
        
        do {
            meetings = try await repository.fetchMeetings()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func refreshMeetings() async {
        await loadMeetings()
    }
    
    // MARK: - Meeting Actions
    func selectMeeting(_ meeting: Meeting) {
        selectedMeeting = meeting
    }
    
}