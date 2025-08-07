import SwiftUI
import Core

public struct MeetingListScreen: View {
    @ObservedObject var viewModel: MeetingListViewModel
    @State private var loadMeetingsTask: Task<Void, Error>?
    @State private var showCreateModal = false
    @StateObject private var createMeetingViewModel = CreateMeetingViewModel()
    
    public init(viewModel: MeetingListViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        List {
            ContentView
        }
        .navigationTitle("会議一覧")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: {
                    showCreateModal = true
                }) {
                    Image(systemName: "plus")
                }
                .accessibilityIdentifier("addMeetingButton")
            }
        }
        .sheet(isPresented: $showCreateModal) {
            CreateMeetingModalView(
                viewModel: createMeetingViewModel,
                isPresented: $showCreateModal
            )
        }
        .task {
            loadMeetingsTask = Task {
                await viewModel.loadMeetings()
            }
        }
        .refreshable {
            await viewModel.refreshMeetings()
        }
        .onReceive(NotificationCenter.default.publisher(for: .meetingCreated)) { _ in
            Task {
                await viewModel.refreshMeetings()
            }
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
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("会議リスト表示") {
    MeetingListScreen(viewModel: MockMeetingListViewModel.withMeetings())
}

#Preview("空の状態") {
    PreviewMeetingListScreen(viewModel: MockMeetingListViewModel.empty())
}

#Preview("エラー状態") {
    MeetingListScreen(viewModel: MockMeetingListViewModel.withError())
}

#Preview("ローディング状態") {
    MeetingListScreen(viewModel: MockMeetingListViewModel.loading())
}

// MARK: - Preview Mock Classes
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
            ),
            Meeting(
                id: "3",
                title: "四半期レビュー",
                description: "Q3の成果振り返りとQ4の計画策定",
                startDate: Date().addingTimeInterval(10800),
                endDate: Date().addingTimeInterval(14400),
                organizer: Organizer(id: "org3", name: "伊藤一郎", email: "ito@example.com"),
                participants: []
            ),
            Meeting(
                id: "4",
                title: "デイリースタンドアップ",
                description: "開発チームの日次進捗共有会議",
                startDate: Date().addingTimeInterval(18000),
                endDate: Date().addingTimeInterval(19800),
                organizer: Organizer(id: "org4", name: "鈴木二郎", email: "suzuki.j@example.com"),
                participants: [
                    Participant(id: "p4", email: "watanabe@example.com", name: "渡辺三郎"),
                    Participant(id: "p5", email: "nakamura@example.com", name: "中村五郎"),
                    Participant(id: "p6", email: "kobayashi@example.com", name: "小林六郎")
                ]
            ),
            Meeting(
                id: "5",
                title: "クライアント提案プレゼン",
                description: "新規クライアント向けのサービス提案とデモンストレーション",
                startDate: Date().addingTimeInterval(25200),
                endDate: Date().addingTimeInterval(28800),
                organizer: Organizer(id: "org5", name: "加藤美咲", email: "kato.m@example.com"),
                participants: [
                    Participant(id: "p7", email: "client@company.com", name: "クライアント担当者"),
                    Participant(id: "p8", email: "sales@example.com", name: "営業部長")
                ]
            ),
            Meeting(
                id: "6",
                title: "技術勉強会 - React最新動向",
                description: "React 19の新機能とパフォーマンス最適化について",
                startDate: Date().addingTimeInterval(32400),
                endDate: Date().addingTimeInterval(36000),
                organizer: Organizer(id: "org6", name: "佐々木健太", email: "sasaki.k@example.com"),
                participants: [
                    Participant(id: "p9", email: "frontend@example.com", name: "フロントエンドチーム"),
                    Participant(id: "p10", email: "designer@example.com", name: "デザインチーム")
                ]
            ),
            Meeting(
                id: "7",
                title: "月次売上報告会",
                description: "12月の売上実績と来月の目標設定",
                startDate: Date().addingTimeInterval(43200),
                endDate: Date().addingTimeInterval(46800),
                organizer: Organizer(id: "org7", name: "田村部長", email: "tamura@example.com"),
                participants: [
                    Participant(id: "p11", email: "sales1@example.com", name: "営業1課"),
                    Participant(id: "p12", email: "sales2@example.com", name: "営業2課"),
                    Participant(id: "p13", email: "marketing@example.com", name: "マーケティング部")
                ]
            ),
            Meeting(
                id: "8",
                title: "システムメンテナンス計画",
                description: "年末年始のシステムメンテナンススケジュール調整",
                startDate: Date().addingTimeInterval(50400),
                endDate: Date().addingTimeInterval(54000),
                organizer: Organizer(id: "org8", name: "システム管理者", email: "sysadmin@example.com"),
                participants: [
                    Participant(id: "p14", email: "infra@example.com", name: "インフラチーム"),
                    Participant(id: "p15", email: "security@example.com", name: "セキュリティ担当")
                ]
            ),
            Meeting(
                id: "9",
                title: "新入社員研修準備会",
                description: "来年度新入社員向けの研修カリキュラム検討",
                startDate: Date().addingTimeInterval(57600),
                endDate: Date().addingTimeInterval(61200),
                organizer: Organizer(id: "org9", name: "人事部", email: "hr@example.com"),
                participants: [
                    Participant(id: "p16", email: "training@example.com", name: "研修担当"),
                    Participant(id: "p17", email: "mentor@example.com", name: "メンター代表")
                ]
            ),
            Meeting(
                id: "10",
                title: "オフィス移転準備会議",
                description: "来年春のオフィス移転に向けた準備とスケジュール調整",
                startDate: Date().addingTimeInterval(64800),
                endDate: Date().addingTimeInterval(68400),
                organizer: Organizer(id: "org10", name: "総務部", email: "soumu@example.com"),
                participants: [
                    Participant(id: "p18", email: "facility@example.com", name: "施設管理"),
                    Participant(id: "p19", email: "it-support@example.com", name: "IT部門"),
                    Participant(id: "p20", email: "accounting@example.com", name: "経理部")
                ]
            ),
            Meeting(
                id: "11",
                title: "顧客満足度調査結果レビュー",
                description: "第4四半期の顧客満足度調査結果の分析と改善策検討",
                startDate: Date().addingTimeInterval(72000),
                endDate: Date().addingTimeInterval(75600),
                organizer: Organizer(id: "org11", name: "品質管理部", email: "quality@example.com"),
                participants: [
                    Participant(id: "p21", email: "cs@example.com", name: "カスタマーサポート"),
                    Participant(id: "p22", email: "product@example.com", name: "プロダクトマネージャー")
                ]
            ),
            Meeting(
                id: "12",
                title: "セキュリティ監査対応会議",
                description: "外部セキュリティ監査への対応状況確認と課題整理",
                startDate: Date().addingTimeInterval(79200),
                endDate: Date().addingTimeInterval(82800),
                organizer: Organizer(id: "org12", name: "セキュリティ責任者", email: "ciso@example.com"),
                participants: [
                    Participant(id: "p23", email: "legal@example.com", name: "法務部"),
                    Participant(id: "p24", email: "compliance@example.com", name: "コンプライアンス")
                ]
            )
        ]
        return viewModel
    }
    
    override func loadMeetings() async {
        guard !shouldSkipLoading else { 
            // 空状態やエラー状態のPreviewではloadingを発生させない
            return 
        }
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


// Preview専用のMeetingListScreen（.taskを実行しない）
private struct PreviewMeetingListScreen: View {
    @ObservedObject var viewModel: MeetingListViewModel
    
    init(viewModel: MeetingListViewModel) {
        self.viewModel = viewModel
    }
    
    var body: some View {
        NavigationView {
            List {
                ContentView
            }
            .navigationTitle("会議一覧")
            .refreshable {
                await viewModel.refreshMeetings()
            }
        }
    }
    
    // MeetingListScreenと同じView Components
    @ViewBuilder
    private var ContentView: some View {
        if let error = viewModel.errorMessage {
            MeetingErrorView(message: error)
        } else if viewModel.meetings.isEmpty {
            MeetingEmptyStateView()
        } else {
            MeetingsList
        }
    }
    
    private var MeetingsList: some View {
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

#endif
