import SwiftUI

struct MeetingListView: View {
    @ObservedObject var viewModel: MeetingListViewModel
    @EnvironmentObject private var authState: AuthState
    @State private var loadMeetingsTask: Task<Void, Error>?
    
    init(viewModel: MeetingListViewModel) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        NavigationView {
            List {
                ContentView
            }
            .navigationTitle("会議一覧")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    SignOutButton
                }
            }
            .task {
                loadMeetingsTask = Task {
                    await viewModel.loadMeetings()
                }
            }
            .refreshable {
                await viewModel.refreshMeetings()
            }
        }
    }
}

// MARK: - View Components
private extension MeetingListView {
    
    @ViewBuilder
    var ContentView: some View {
        if loadMeetingsTask != nil && viewModel.meetings.isEmpty && viewModel.errorMessage == nil {
            LoadingView
        } else if let error = viewModel.errorMessage {
            ErrorView(message: error)
        } else if viewModel.meetings.isEmpty {
            EmptyStateView
        } else {
            MeetingsList
        }
    }
    
    var LoadingView: some View {
        HStack {
            Spacer()
            ProgressView()
            Spacer()
        }
        .padding()
    }
    
    var EmptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar.badge.exclamationmark")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text("会議がありません")
                .font(.headline)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
    }
    
    var MeetingsList: some View {
        ForEach(viewModel.meetings) { meeting in
            MeetingRowView(
                meeting: meeting,
                onTap: {
                    viewModel.selectMeeting(meeting)
                }
            )
        }
    }
    
    var SignOutButton: some View {
        Button("サインアウト") {
            authState.clearSession()
        }
    }
}

// MARK: - Error View
struct ErrorView: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.red)
            Text(message)
                .foregroundColor(.red)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
    }
}

// MARK: - Meeting Row View
struct MeetingRowView: View {
    let meeting: Meeting
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            TitleSection
            DateTimeSection
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
        .id("meetingRow_\(meeting.id)")
    }
}

// MARK: - Meeting Row Components
private extension MeetingRowView {
    
    var TitleSection: some View {
        Text(meeting.title)
            .font(.headline)
            .lineLimit(2)
    }
    
    var DateTimeSection: some View {
        Label {
            Text(meeting.startDate.japaneseMediumDateTime)
                .font(.subheadline)
                .foregroundColor(.secondary)
        } icon: {
            Image(systemName: "calendar")
                .foregroundColor(.secondary)
        }
    }
}