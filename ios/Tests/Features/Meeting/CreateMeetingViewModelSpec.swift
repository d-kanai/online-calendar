import Testing
import Foundation
@testable import Meeting
@testable import Core

@Suite("CreateMeetingViewModel振る舞いテスト")
struct CreateMeetingViewModelSpec {
    
    @Test("会議作成フォームの初期値が正しい")
    @MainActor
    func testInitialFormValues() {
        let viewModel = CreateMeetingViewModel()
        
        #expect(viewModel.form.title == "")
        #expect(viewModel.form.periodMinutes == 30)
        #expect(viewModel.form.isImportant == false)
        #expect(viewModel.form.isValid == false)
    }
    
    @Test("タイトル入力時のバリデーション")
    @MainActor
    func testTitleValidation() {
        let viewModel = CreateMeetingViewModel()
        
        // 空のタイトル
        viewModel.form.title = ""
        #expect(viewModel.form.titleError == nil) // 初期状態ではエラー表示しない
        #expect(viewModel.form.isValid == false)
        
        // 空白のみのタイトル
        viewModel.form.title = "   "
        #expect(viewModel.form.titleError == "タイトルは必須項目です")
        #expect(viewModel.form.isValid == false)
        
        // 有効なタイトル
        viewModel.form.title = "定例MTG"
        #expect(viewModel.form.titleError == nil)
        #expect(viewModel.form.isValid == true)
    }
    
    @Test("期間のバリデーション")
    @MainActor
    func testPeriodValidation() {
        let viewModel = CreateMeetingViewModel()
        viewModel.form.title = "テスト会議"
        
        // 15分未満
        viewModel.form.periodMinutes = 10
        #expect(viewModel.form.periodError == "会議は15分以上で設定してください")
        #expect(viewModel.form.isValid == false)
        
        // 15分（境界値）
        viewModel.form.periodMinutes = 15
        #expect(viewModel.form.periodError == nil)
        #expect(viewModel.form.isValid == true)
        
        // 30分（正常値）
        viewModel.form.periodMinutes = 30
        #expect(viewModel.form.periodError == nil)
        #expect(viewModel.form.isValid == true)
        
        // 8時間超
        viewModel.form.periodMinutes = 481
        #expect(viewModel.form.periodError == "会議は8時間以内で設定してください")
        #expect(viewModel.form.isValid == false)
    }
    
    @Test("有効な入力で会議が作成される")
    @MainActor
    func testCreateMeetingWithValidInput() async throws {
        let mockRepository = MockCreateMeetingRepository()
        let viewModel = CreateMeetingViewModel(repository: mockRepository)
        
        // フォームに入力
        viewModel.form.title = "週次定例会"
        viewModel.form.periodMinutes = 60
        viewModel.form.isImportant = true
        
        // 会議作成
        try await viewModel.createMeeting()
        
        // 検証
        #expect(mockRepository.createMeetingCalled == true)
        #expect(mockRepository.lastCreatedMeetingRequest?.title == "週次定例会")
        #expect(mockRepository.lastCreatedMeetingRequest?.isImportant == true)
        
        // フォームがリセットされる
        #expect(viewModel.form.title == "")
        #expect(viewModel.form.periodMinutes == 30)
        #expect(viewModel.form.isImportant == false)
    }
    
    @Test("無効な入力でエラーが表示される")
    @MainActor
    func testCreateMeetingWithInvalidInput() async {
        let mockRepository = MockCreateMeetingRepository()
        let viewModel = CreateMeetingViewModel(repository: mockRepository)
        
        // 無効な入力（タイトル未入力）
        viewModel.form.title = ""
        viewModel.form.periodMinutes = 30
        
        do {
            try await viewModel.createMeeting()
            Issue.record("バリデーションエラーが発生するはず")
        } catch {
            // エラーが発生することを確認
            #expect(viewModel.showAlert == true)
            #expect(viewModel.errorMessage == "タイトルは必須項目です")
            #expect(mockRepository.createMeetingCalled == false)
        }
    }
    
    @Test("API呼び出し用リクエストが正しく生成される")
    @MainActor
    func testCreateMeetingRequestGeneration() {
        let viewModel = CreateMeetingViewModel()
        
        viewModel.form.title = "  テスト会議  " // 前後に空白
        viewModel.form.periodMinutes = 45
        viewModel.form.isImportant = false
        
        let request = viewModel.form.toCreateMeetingRequest()
        
        #expect(request.title == "テスト会議") // trimされる
        #expect(request.isImportant == false)
        
        // ISO8601形式の文字列として保存されていることを確認
        #expect(request.startTime.contains("T"))
        #expect(request.endTime.contains("T"))
    }
}

// MARK: - Mock Repository
@MainActor
private class MockCreateMeetingRepository: MeetingRepository {
    var createMeetingCalled = false
    var lastCreatedMeetingRequest: Meeting.CreateMeetingRequest?
    var shouldThrowError = false
    
    override init() {
        super.init()
    }
    
    override func createMeeting(_ request: Meeting.CreateMeetingRequest) async throws {
        createMeetingCalled = true
        lastCreatedMeetingRequest = request
        
        if shouldThrowError {
            throw TestError.mockError
        }
    }
}

enum TestError: Error {
    case mockError
}