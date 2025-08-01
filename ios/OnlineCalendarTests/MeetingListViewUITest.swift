
import XCTest
import SwiftUI
import ViewInspector
@testable import OnlineCalendar

final class MeetingListViewUITest: XCTestCase {

    @MainActor
    func testMeetingIsRenderedAfterTaskLoad() async throws {
        let viewModel = MeetingListViewModel(repository: SimpleMockMeetingRepository())
        XCTAssertNotNil(viewModel, "1. viewModel生成完了")

        let authManager = AuthManager.shared
        XCTAssertNotNil(authManager, "2. authManager取得完了")

        let view = MeetingListView(viewModel: viewModel)
            .environmentObject(authManager)
        XCTAssertNotNil(view, "3. View生成完了")

        do {
            let inspection = try view.inspect()
            XCTAssertNotNil(inspection, "4. view.inspect() 成功")
        } catch {
            XCTFail("4. view.inspect() でエラー: \(error)")
            throw error
        }

        // ViewInspector 0.10.2 では .task を直接トリガーできないため、
        // viewModel.loadMeetings() を手動で呼び出す
        XCTAssertTrue(viewModel.meetings.isEmpty, "5. loadMeetings 呼び出し前は meetings が空")
        
        await viewModel.loadMeetings()
        XCTAssertTrue(true, "6. loadMeetings 呼び出し完了")
        
        XCTAssertFalse(viewModel.meetings.isEmpty, "7. meetings 配列にデータがある: \(viewModel.meetings.count)件")
        XCTAssertEqual(viewModel.meetings.count, 1, "8. meetings 配列に1件のデータ")
        XCTAssertEqual(viewModel.meetings.first?.title, "テスト会議", "9. 最初の会議のタイトルが正しい")

        do {
            let inspection = try view.inspect()
            let foundView = try inspection.find(text: "テスト会議")
            XCTAssertNotNil(foundView, "10. テキスト 'テスト会議' をViewから発見")
            
            let text = try foundView.string()
            XCTAssertEqual(text, "テスト会議", "11. 表示されているテキストが期待通り")
        } catch {
            XCTFail("10-11. テキスト検索でエラー: \(error)")
            throw error
        }
    }
}

// モックリポジトリ
final class SimpleMockMeetingRepository: MeetingRepositoryProtocol {
    func fetchMeetings() async throws -> [Meeting] {
        return [
            Meeting(
                id: "1",
                title: "テスト会議",
                description: "テスト用の会議",
                startDate: Date(),
                endDate: Date().addingTimeInterval(3600),
                organizer: Organizer(id: "org1", name: "テスト主催者", email: "test@example.com"),
                participants: []
            )
        ]
    }
    
    func fetchMeeting(id: String) async throws -> Meeting {
        throw TestError.notImplemented
    }
    
    func createMeeting(_ meeting: Meeting) async throws -> Meeting {
        throw TestError.notImplemented
    }
    
    func updateMeeting(_ meeting: Meeting) async throws -> Meeting {
        throw TestError.notImplemented
    }
    
    func deleteMeeting(id: String) async throws {
        throw TestError.notImplemented
    }
    
    func acceptInvitation(meetingId: String) async throws {
        throw TestError.notImplemented
    }
    
    func declineInvitation(meetingId: String) async throws {
        throw TestError.notImplemented
    }
}

enum TestError: Error {
    case notImplemented
}
