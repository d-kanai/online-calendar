import SwiftUI

public struct MeetingListScreen: View {
    @ObservedObject var viewModel: MeetingListViewModel
    @EnvironmentObject private var authState: AuthState
    @State private var loadMeetingsTask: Task<Void, Error>?
    
    init(viewModel: MeetingListViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        List {
            ContentView
        }
        .navigationTitle("会議一覧")
        .toolbar {
            ToolbarItem(placement: .automatic) {
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

// MARK: - View Components
private extension MeetingListScreen {
    
    @ViewBuilder
    var ContentView: some View {
        if let error = viewModel.errorMessage {
            MeetingErrorView(message: error)
        } else if viewModel.meetings.isEmpty {
            if loadMeetingsTask != nil {
                MeetingLoadingView()
            } else {
                MeetingEmptyStateView()
            }
        } else {
            MeetingsList
        }
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
