import SwiftUI

struct MeetingListView: View {
    @StateObject private var viewModel = MeetingListViewModel()
    @EnvironmentObject private var authManager: AuthManager
    
    var body: some View {
        NavigationView {
            List {
                if viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .padding()
                } else if let error = viewModel.errorMessage {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                        .padding()
                } else {
                    ForEach(viewModel.meetings) { meeting in
                        MeetingRowView(
                            meeting: meeting,
                            onTap: {
                                viewModel.selectMeeting(meeting)
                            },
                            onDelete: {
                                Task {
                                    await viewModel.deleteMeeting(meeting)
                                }
                            }
                        )
                    }
                }
            }
            .navigationTitle("会議一覧")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("サインアウト") {
                        authManager.clearSession()
                    }
                }
            }
            .task {
                await viewModel.loadMeetings()
            }
            .refreshable {
                await viewModel.refreshMeetings()
            }
        }
    }
}

// MARK: - Meeting Row View (内部View)
private struct MeetingRowView: View {
    let meeting: Meeting
    let onTap: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(meeting.title)
                .font(.headline)
                .lineLimit(2)
            
            // 日時（Utilを使用）
            Label {
                Text(meeting.startDate.japaneseMediumDateTime)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            } icon: {
                Image(systemName: "calendar")
                    .foregroundColor(.secondary)
            }
            
            // 場所
            if let location = meeting.location {
                Label {
                    Text(location)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                } icon: {
                    Image(systemName: "location")
                        .foregroundColor(.secondary)
                }
            }
            
            // オンライン会議
            if meeting.isOnline {
                Label {
                    Text("オンライン会議")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                } icon: {
                    Image(systemName: "video")
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("削除", systemImage: "trash")
            }
        }
    }
}