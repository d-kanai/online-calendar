import Testing
import Foundation
@testable import Meeting

@Suite("CreateMeetingForm振る舞いテスト")
struct CreateMeetingFormSpec {
    
    @Test("フォームの初期値が正しい")
    func testInitialValues() {
        let form = CreateMeetingForm()
        
        #expect(form.title == "")
        #expect(form.periodMinutes == 30)
        #expect(form.isImportant == false)
        #expect(form.isValid == false)
    }
    
    @Test("タイトルのバリデーション")
    func testTitleValidation() {
        let form = CreateMeetingForm()
        
        // 空のタイトル
        form.title = ""
        #expect(form.titleError == nil) // 初期状態ではエラーを表示しない
        
        // 空白のみ
        form.title = "   "
        #expect(form.titleError == "タイトルは必須項目です")
        
        // 101文字（境界値テスト）
        form.title = String(repeating: "あ", count: 101)
        #expect(form.titleError == "タイトルは100文字以内で入力してください")
        
        // 100文字（境界値テスト）
        form.title = String(repeating: "あ", count: 100)
        #expect(form.titleError == nil)
        
        // 正常なタイトル
        form.title = "定例会議"
        #expect(form.titleError == nil)
    }
    
    @Test("期間のバリデーション")
    func testPeriodValidation() {
        let form = CreateMeetingForm()
        
        // 14分（境界値）
        form.periodMinutes = 14
        #expect(form.periodError == "会議は15分以上で設定してください")
        
        // 15分（境界値）
        form.periodMinutes = 15
        #expect(form.periodError == nil)
        
        // 480分（8時間、境界値）
        form.periodMinutes = 480
        #expect(form.periodError == nil)
        
        // 481分（8時間超、境界値）
        form.periodMinutes = 481
        #expect(form.periodError == "会議は8時間以内で設定してください")
    }
    
    @Test("フォーム全体の有効性")
    func testFormValidity() {
        let form = CreateMeetingForm()
        
        // 初期状態（無効）
        #expect(form.isValid == false)
        
        // タイトルのみ入力（無効）
        form.title = "会議"
        form.periodMinutes = 10
        #expect(form.isValid == false)
        
        // 期間を有効にする
        form.periodMinutes = 30
        #expect(form.isValid == true)
        
        // タイトルを無効にする
        form.title = ""
        #expect(form.isValid == false)
    }
    
    @Test("validate()メソッドがエラーを返す")
    func testValidateMethod() {
        let form = CreateMeetingForm()
        
        // すべて無効
        form.title = ""
        form.periodMinutes = 10
        
        let errors = form.validate()
        #expect(errors.count == 2)
        #expect(errors.contains("タイトルは必須項目です"))
        #expect(errors.contains("会議は15分以上で設定してください"))
        
        // タイトルのみ無効
        form.title = "   "
        form.periodMinutes = 30
        
        let errors2 = form.validate()
        #expect(errors2.count == 1)
        #expect(errors2.first == "タイトルは必須項目です")
        
        // すべて有効
        form.title = "定例会議"
        form.periodMinutes = 60
        
        let errors3 = form.validate()
        #expect(errors3.isEmpty)
    }
    
    @Test("フォームのリセット")
    func testReset() {
        let form = CreateMeetingForm()
        
        // 値を設定
        form.title = "テスト会議"
        form.periodMinutes = 90
        form.isImportant = true
        
        // リセット
        form.reset()
        
        // 初期値に戻る
        #expect(form.title == "")
        #expect(form.periodMinutes == 30)
        #expect(form.isImportant == false)
    }
    
    @Test("API送信用データへの変換")
    func testToCreateMeetingRequest() {
        let form = CreateMeetingForm()
        
        // フォームに値を設定
        form.title = "  テスト会議  " // 前後に空白
        form.periodMinutes = 60
        form.isImportant = true
        
        let request = form.toCreateMeetingRequest()
        
        // タイトルがトリムされる
        #expect(request.title == "テスト会議")
        
        // 重要フラグが正しい
        #expect(request.isImportant == true)
        
        // ISO8601形式の文字列として保存されていることを確認
        #expect(request.startTime.contains("T"))
        #expect(request.endTime.contains("T"))
    }
    
    @Test("重要フラグの切り替え")
    func testImportantFlag() {
        let form = CreateMeetingForm()
        
        // デフォルトはfalse
        #expect(form.isImportant == false)
        
        // true に設定
        form.isImportant = true
        #expect(form.isImportant == true)
        
        // false に戻す
        form.isImportant = false
        #expect(form.isImportant == false)
    }
}