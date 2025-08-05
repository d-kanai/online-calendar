import SwiftUI

#if DEBUG
public struct PreviewCatalogScreen: View {
    @State private var searchText = ""
    
    public init() {}
    
    public var body: some View {
        List {
            meetingScreensSection
            meetingComponentsSection
            statsScreensSection
            statsComponentsSection
            authSection
            commonComponentsSection
        }
        .navigationTitle("🎨 Previewカタログ")
        .searchable(text: $searchText, prompt: "コンポーネントを検索")
    }
}

// MARK: - Sections
private extension PreviewCatalogScreen {
    var meetingScreensSection: some View {
        Section("会議画面") {
            NavigationLink("会議リスト - データあり") {
                MeetingListScreen(viewModel: MockMeetingListViewModel.withMeetings())
                    .environmentObject(MockAuthState())
            }
            
            NavigationLink("会議リスト - 空状態") {
                PreviewMeetingListScreen(viewModel: MockMeetingListViewModel.empty())
                    .environmentObject(MockAuthState())
            }
            
            NavigationLink("会議リスト - エラー") {
                MeetingListScreen(viewModel: MockMeetingListViewModel.withError())
                    .environmentObject(MockAuthState())
            }
            
            NavigationLink("会議リスト - ローディング") {
                MeetingListScreen(viewModel: MockMeetingListViewModel.loading())
                    .environmentObject(MockAuthState())
            }
        }
    }
    
    var meetingComponentsSection: some View {
        Section("会議コンポーネント") {
            NavigationLink("会議行 - 通常") {
                PreviewWrapper {
                    MeetingRowView(
                        meeting: sampleMeeting,
                        onTap: {}
                    )
                    .padding()
                }
            }
            
            NavigationLink("空状態表示") {
                PreviewWrapper {
                    MeetingEmptyStateView()
                }
            }
            
            NavigationLink("ローディング表示") {
                PreviewWrapper {
                    MeetingLoadingView()
                }
            }
            
            NavigationLink("エラー表示") {
                PreviewWrapper {
                    MeetingErrorView(message: "ネットワークエラーが発生しました")
                }
            }
        }
    }
    
    var statsScreensSection: some View {
        Section("統計画面") {
            NavigationLink("統計 - データあり") {
                MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.withData())
            }
            
            NavigationLink("統計 - 空状態") {
                MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.empty())
            }
            
            NavigationLink("統計 - エラー") {
                MeetingStatsScreen(viewModel: MockMeetingStatsViewModel.withError())
            }
        }
    }
    
    var statsComponentsSection: some View {
        Section("統計コンポーネント") {
            NavigationLink("平均時間カード") {
                PreviewWrapper {
                    AverageTimeCard(averageMinutes: 85.7)
                        .padding()
                }
            }
            
            NavigationLink("週間バーチャート") {
                PreviewWrapper {
                    SimpleBarChart(weeklyData: sampleWeeklyData)
                        .padding()
                }
            }
            
            NavigationLink("日別詳細カード") {
                PreviewWrapper {
                    DailyBreakdownCard(weeklyData: sampleWeeklyData)
                        .padding()
                }
            }
        }
    }
    
    var authSection: some View {
        Section("認証画面") {
            NavigationLink("サインイン画面") {
                SignInScreen()
            }
        }
    }
    
    var commonComponentsSection: some View {
        Section("共通コンポーネント") {
            NavigationLink("入力フィールド") {
                PreviewWrapper {
                    VStack(spacing: 20) {
                        InputField(
                            title: "メールアドレス",
                            text: .constant("test@example.com"),
                            placeholder: "メールアドレスを入力"
                        )
                        
                        InputField(
                            title: "パスワード",
                            text: .constant(""),
                            placeholder: "パスワードを入力",
                            isSecure: true
                        )
                    }
                    .padding()
                }
            }
            
            NavigationLink("ボタン") {
                PreviewWrapper {
                    VStack(spacing: 20) {
                        PrimaryButton(title: "有効なボタン", action: {})
                        PrimaryButton(title: "無効なボタン", action: {}, isEnabled: false)
                        PrimaryButton(title: "ローディング中", action: {}, isLoading: true)
                    }
                    .padding()
                }
            }
            
            NavigationLink("エラーメッセージ") {
                PreviewWrapper {
                    VStack(spacing: 20) {
                        ErrorMessage(message: "メールアドレスが無効です")
                        ErrorMessage(message: "パスワードは8文字以上必要です")
                    }
                    .padding()
                }
            }
        }
    }
    
    // サンプルデータ
    var sampleMeeting: Meeting {
        Meeting(
            id: "1",
            title: "週次チームミーティング",
            description: "チームの進捗確認",
            startDate: Date().addingTimeInterval(3600),
            endDate: Date().addingTimeInterval(5400),
            organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
            participants: [
                Participant(id: "p1", email: "sato@example.com", name: "佐藤花子")
            ]
        )
    }
    
    var sampleWeeklyData: [DailyMeetingMinutes] {
        [
            DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 120),
            DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 60),
            DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 180),
            DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 90),
            DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 150),
            DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 30),
            DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 45)
        ]
    }
}

// Preview表示用のラッパー
private struct PreviewWrapper<Content: View>: View {
    let content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }
    
    var body: some View {
        ZStack {
            #if os(iOS)
            Color(UIColor.systemGroupedBackground)
                .ignoresSafeArea()
            #else
            Color(.gray).opacity(0.1)
                .ignoresSafeArea()
            #endif
            
            content()
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}

// MARK: - Mock Classes for Preview Catalog
@MainActor
private class MockAuthState: AuthState {
    override init() {
        super.init()
        self.isAuthenticated = true
    }
    
    override func clearSession() {}
}

// この実装はMeetingListScreen.swiftからのコピーですが、
// Previewカタログで使用するために必要です
@MainActor
private class MockMeetingListViewModel: MeetingListViewModel {
    private var shouldSkipLoading = false
    
    override init(repository: MeetingRepositoryProtocol = MockMeetingRepository()) {
        super.init(repository: repository)
    }
    
    static func withMeetings() -> MockMeetingListViewModel {
        let viewModel = MockMeetingListViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.meetings = [
            Meeting(
                id: "1",
                title: "週次チームミーティング",
                description: "チームの進捗確認と今後の計画について議論",
                startDate: Date().addingTimeInterval(3600),
                endDate: Date().addingTimeInterval(5400),
                organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
                participants: [
                    Participant(id: "p1", email: "sato@example.com", name: "佐藤花子"),
                    Participant(id: "p2", email: "suzuki@example.com", name: "鈴木次郎")
                ]
            ),
            Meeting(
                id: "2",
                title: "プロジェクト企画会議",
                description: "新プロジェクトの企画と方向性について議論",
                startDate: Date().addingTimeInterval(7200),
                endDate: Date().addingTimeInterval(9000),
                organizer: Organizer(id: "org2", name: "山田花子", email: "yamada@example.com"),
                participants: [
                    Participant(id: "p3", email: "takahashi@example.com", name: "高橋三郎")
                ]
            )
        ]
        return viewModel
    }
    
    override func loadMeetings() async {
        guard !shouldSkipLoading else { return }
        await super.loadMeetings()
    }
    
    static func empty() -> MockMeetingListViewModel {
        let viewModel = MockMeetingListViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.meetings = []
        return viewModel
    }
    
    static func withError() -> MockMeetingListViewModel {
        let viewModel = MockMeetingListViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.meetings = []
        viewModel.errorMessage = "ネットワークエラーが発生しました"
        return viewModel
    }
    
    static func loading() -> MockMeetingListViewModel {
        let viewModel = MockMeetingListViewModel()
        viewModel.meetings = []
        return viewModel
    }
}

private class MockMeetingRepository: MeetingRepositoryProtocol {
    func fetchMeetings() async throws -> [Meeting] { return [] }
    func fetchMeeting(id: String) async throws -> Meeting { 
        throw NSError(domain: "MockError", code: 404, userInfo: nil) 
    }
    func createMeeting(_ meeting: Meeting) async throws -> Meeting { return meeting }
    func updateMeeting(_ meeting: Meeting) async throws -> Meeting { return meeting }
    func acceptInvitation(meetingId: String) async throws {}
    func declineInvitation(meetingId: String) async throws {}
}

// Preview専用のMeetingListScreen（NavigationView無し版）
private struct PreviewMeetingListScreen: View {
    @ObservedObject var viewModel: MeetingListViewModel
    @EnvironmentObject private var authState: AuthState
    
    init(viewModel: MeetingListViewModel) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        List {
            if let error = viewModel.errorMessage {
                MeetingErrorView(message: error)
            } else if viewModel.meetings.isEmpty {
                MeetingEmptyStateView()
            } else {
                ForEach(viewModel.meetings) { meeting in
                    MeetingRowView(
                        meeting: meeting,
                        onTap: {
                            viewModel.selectMeeting(meeting)
                        }
                    )
                }
            }
        }
        .navigationTitle("会議一覧")
        .refreshable {
            await viewModel.refreshMeetings()
        }
    }
}

// MockMeetingStatsViewModel
@MainActor
private class MockMeetingStatsViewModel: MeetingStatsViewModel {
    private var shouldSkipLoading = false
    
    static func withData() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.averageDailyMinutes = 85.7
        viewModel.weeklyData = [
            DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 120),
            DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 60),
            DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 180),
            DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 90),
            DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 150),
            DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 30),
            DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 45)
        ]
        return viewModel
    }
    
    static func empty() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.averageDailyMinutes = 0
        viewModel.weeklyData = []
        return viewModel
    }
    
    static func withError() -> MockMeetingStatsViewModel {
        let viewModel = MockMeetingStatsViewModel()
        viewModel.shouldSkipLoading = true
        viewModel.errorMessage = "統計データの取得に失敗しました"
        return viewModel
    }
    
    override func loadStats() async {
        guard !shouldSkipLoading else { return }
        await super.loadStats()
    }
}

#endif