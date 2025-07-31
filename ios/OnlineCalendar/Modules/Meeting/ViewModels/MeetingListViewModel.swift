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
        print("🔄 [MeetingListViewModel] Starting to load meetings...")
        errorMessage = nil
        
        do {
            meetings = try await repository.fetchMeetings()
            print("✅ [MeetingListViewModel] Successfully loaded \(meetings.count) meetings")
        } catch {
            errorMessage = error.localizedDescription
            print("❌ [MeetingListViewModel] Failed to load meetings: \(error)")
            print("❌ [MeetingListViewModel] Error type: \(type(of: error))")
            print("❌ [MeetingListViewModel] Error description: \(error.localizedDescription)")
        }
        
        print("🔄 [MeetingListViewModel] Finished loading meetings")
    }
    
    func refreshMeetings() async {
        await loadMeetings()
    }
    
    // MARK: - Meeting Actions
    func selectMeeting(_ meeting: Meeting) {
        selectedMeeting = meeting
    }
    
    func deleteMeeting(_ meeting: Meeting) async {
        // TODO: Implement delete functionality
        print("🗑️ [MeetingListViewModel] Delete meeting: \(meeting.id)")
    }
}