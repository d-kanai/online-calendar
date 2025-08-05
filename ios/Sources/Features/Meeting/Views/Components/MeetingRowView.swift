import SwiftUI

public struct MeetingRowView: View {
    public let meeting: Meeting
    public let onTap: () -> Void
    
    public init(meeting: Meeting, onTap: @escaping () -> Void) {
        self.meeting = meeting
        self.onTap = onTap
    }
    
    public var body: some View {
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

// MARK: - Components
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

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("通常の会議") {
    MeetingRowView(
        meeting: Meeting(
            id: "1",
            title: "週次チームミーティング",
            description: "チームの進捗確認と今後の計画について議論",
            startDate: Date().addingTimeInterval(3600),
            endDate: Date().addingTimeInterval(5400),
            organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
            participants: []
        ),
        onTap: {}
    )
    .padding()
}

#Preview("長いタイトルの会議") {
    MeetingRowView(
        meeting: Meeting(
            id: "2",
            title: "とても重要で長いタイトルの会議：新プロジェクトの企画と方向性について詳細に議論するための月次ミーティング",
            description: "詳細な説明...",
            startDate: Date().addingTimeInterval(7200),
            endDate: Date().addingTimeInterval(9000),
            organizer: Organizer(id: "org2", name: "山田花子", email: "yamada@example.com"),
            participants: []
        ),
        onTap: {}
    )
    .padding()
}

#Preview("今日の会議") {
    MeetingRowView(
        meeting: Meeting(
            id: "3",
            title: "緊急対応ミーティング",
            description: "システム障害の対応について",
            startDate: Date(),
            endDate: Date().addingTimeInterval(1800),
            organizer: Organizer(id: "org3", name: "佐藤次郎", email: "sato@example.com"),
            participants: []
        ),
        onTap: {}
    )
    .padding()
}

#Preview("過去の会議") {
    MeetingRowView(
        meeting: Meeting(
            id: "4",
            title: "プロジェクト振り返り",
            description: "完了したプロジェクトの振り返りセッション",
            startDate: Date().addingTimeInterval(-86400),
            endDate: Date().addingTimeInterval(-82800),
            organizer: Organizer(id: "org4", name: "鈴木花子", email: "suzuki@example.com"),
            participants: []
        ),
        onTap: {}
    )
    .padding()
}

#Preview("参加者の多い会議") {
    MeetingRowView(
        meeting: Meeting(
            id: "5",
            title: "全社総会",
            description: "四半期の業績報告と来期計画の発表",
            startDate: Date().addingTimeInterval(172800),
            endDate: Date().addingTimeInterval(176400),
            organizer: Organizer(id: "org5", name: "代表取締役", email: "ceo@example.com"),
            participants: [
                Participant(id: "p1", email: "emp1@example.com", name: "従業員1"),
                Participant(id: "p2", email: "emp2@example.com", name: "従業員2"),
                Participant(id: "p3", email: "emp3@example.com", name: "従業員3")
            ]
        ),
        onTap: {}
    )
    .padding()
}

#Preview("リスト表示") {
    List {
        MeetingRowView(
            meeting: Meeting(
                id: "1",
                title: "朝会",
                description: "",
                startDate: Date().addingTimeInterval(3600),
                endDate: Date().addingTimeInterval(5400),
                organizer: Organizer(id: "org1", name: "チームリード", email: "lead@example.com"),
                participants: []
            ),
            onTap: {}
        )
        
        MeetingRowView(
            meeting: Meeting(
                id: "2",
                title: "設計レビュー",
                description: "",
                startDate: Date().addingTimeInterval(7200),
                endDate: Date().addingTimeInterval(9000),
                organizer: Organizer(id: "org2", name: "アーキテクト", email: "architect@example.com"),
                participants: []
            ),
            onTap: {}
        )
    }
}

#endif