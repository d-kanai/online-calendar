import SwiftUI

struct MeetingListView: View {
    @EnvironmentObject private var authManager: AuthManager
    @State private var meetings: [Meeting] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            List {
                if isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .padding()
                } else if let error = errorMessage {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                        .padding()
                } else {
                    ForEach(meetings) { meeting in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(meeting.title)
                                .font(.headline)
                            
                            HStack {
                                Image(systemName: "calendar")
                                    .foregroundColor(.secondary)
                                Text(formatDate(meeting.startDate))
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            if let location = meeting.location {
                                HStack {
                                    Image(systemName: "location")
                                        .foregroundColor(.secondary)
                                    Text(location)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            if meeting.isOnline {
                                HStack {
                                    Image(systemName: "video")
                                        .foregroundColor(.blue)
                                    Text("オンライン会議")
                                        .font(.subheadline)
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("会議一覧")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("サインアウト") {
                        authManager.signOut()
                    }
                }
            }
            .task {
                await loadMeetings()
            }
            .refreshable {
                await loadMeetings()
            }
        }
    }
    
    private func loadMeetings() async {
        print("🔄 [MeetingListView] Starting to load meetings...")
        isLoading = true
        errorMessage = nil
        
        do {
            meetings = try await APIClient.shared.fetchMeetings()
            print("✅ [MeetingListView] Successfully loaded \(meetings.count) meetings")
        } catch {
            errorMessage = error.localizedDescription
            print("❌ [MeetingListView] Failed to load meetings: \(error)")
            print("❌ [MeetingListView] Error type: \(type(of: error))")
            print("❌ [MeetingListView] Error description: \(error.localizedDescription)")
        }
        
        isLoading = false
        print("🔄 [MeetingListView] Finished loading meetings")
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter.string(from: date)
    }
}