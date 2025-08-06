import SwiftUI
@testable import Home
@testable import Core

struct HomeScreenPreview: View {
    var body: some View {
        TabView {
            // 通常の状態
            NavigationView {
                HomeScreen(
                    viewModel: HomeViewModel(repository: MockHomeRepository.success),
                    onTodayMeetingsTapped: {
                        print("📅 今日の会議タップ")
                    },
                    onWeeklyStatsTapped: {
                        print("📊 今週の統計タップ")
                    }
                )
            }
            .tabItem {
                Label("通常", systemImage: "checkmark.circle")
            }
            
            // ローディング状態
            NavigationView {
                HomeScreen(
                    viewModel: HomeViewModel(repository: MockHomeRepository.loading),
                    onTodayMeetingsTapped: {},
                    onWeeklyStatsTapped: {}
                )
            }
            .tabItem {
                Label("ローディング", systemImage: "arrow.clockwise")
            }
            
            // エラー状態
            NavigationView {
                HomeScreen(
                    viewModel: HomeViewModel(repository: MockHomeRepository.error),
                    onTodayMeetingsTapped: {},
                    onWeeklyStatsTapped: {}
                )
            }
            .tabItem {
                Label("エラー", systemImage: "exclamationmark.triangle")
            }
            
            // 次の会議なし
            NavigationView {
                HomeScreen(
                    viewModel: HomeViewModel(repository: MockHomeRepository.noNextMeeting),
                    onTodayMeetingsTapped: {},
                    onWeeklyStatsTapped: {}
                )
            }
            .tabItem {
                Label("会議なし", systemImage: "calendar.badge.minus")
            }
        }
    }
}

// MARK: - Mock Repository

private class MockHomeRepository: HomeRepository {
    enum State {
        case success
        case loading
        case error
        case noNextMeeting
    }
    
    private let state: State
    
    private init(state: State) {
        self.state = state
        super.init()
    }
    
    static let success = MockHomeRepository(state: .success)
    static let loading = MockHomeRepository(state: .loading)
    static let error = MockHomeRepository(state: .error)
    static let noNextMeeting = MockHomeRepository(state: .noNextMeeting)
    
    override func fetchHomeSummary() async throws -> HomeSummary {
        switch state {
        case .success:
            return HomeSummary(
                todayMeetingsCount: 3,
                nextMeeting: Meeting(
                    id: "1",
                    title: "デザインレビュー",
                    startTime: Date().addingTimeInterval(30 * 60) // 30分後
                ),
                weeklyMeetingHours: 12.5,
                userName: "田中太郎"
            )
            
        case .loading:
            // 永遠にローディング
            try await Task.sleep(nanoseconds: 10_000_000_000) // 10秒
            throw NSError(domain: "timeout", code: 0)
            
        case .error:
            throw NSError(domain: "network", code: 500, userInfo: [
                NSLocalizedDescriptionKey: "ネットワークエラーが発生しました"
            ])
            
        case .noNextMeeting:
            return HomeSummary(
                todayMeetingsCount: 0,
                nextMeeting: nil,
                weeklyMeetingHours: 0,
                userName: "山田花子"
            )
        }
    }
}

// MARK: - Preview

#Preview("Home画面") {
    HomeScreenPreview()
        .environmentObject(AuthState.shared)
}

#Preview("通常状態") {
    NavigationView {
        HomeScreen(
            viewModel: HomeViewModel(repository: MockHomeRepository.success),
            onTodayMeetingsTapped: {
                print("今日の会議タップ")
            },
            onWeeklyStatsTapped: {
                print("今週の統計タップ")
            }
        )
    }
    .environmentObject(AuthState.shared)
}

#Preview("ダークモード") {
    NavigationView {
        HomeScreen(
            viewModel: HomeViewModel(repository: MockHomeRepository.success),
            onTodayMeetingsTapped: {},
            onWeeklyStatsTapped: {}
        )
    }
    .environmentObject(AuthState.shared)
    .preferredColorScheme(.dark)
}

#Preview("iPad") {
    NavigationView {
        HomeScreen(
            viewModel: HomeViewModel(repository: MockHomeRepository.success),
            onTodayMeetingsTapped: {},
            onWeeklyStatsTapped: {}
        )
    }
    .environmentObject(AuthState.shared)
    .previewDevice("iPad Pro (11-inch) (4th generation)")
}