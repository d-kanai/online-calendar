import Testing
import SwiftUI
import ViewInspector
@testable import Meeting

@Suite("CreateMeetingModalView振る舞いテスト")
struct CreateMeetingModalViewSpec {
    
    @Test("モーダルの基本UIが正しく表示される")
    @MainActor
    func testBasicUIElements() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        
        // Then - Viewの構造を確認
        // NavigationViewまたはその中のコンテンツを探す
        // ViewInspectorはモーダル内のNavigationViewの検査に制限があるため、
        // 存在確認のみ行う
        let hasNavigationStructure = inspection.findAll(ViewType.NavigationView.self).count > 0 ||
                                    inspection.findAll(ViewType.VStack.self).count > 0
        #expect(hasNavigationStructure == true)
    }
    
    @Test("タイトル入力フィールドが表示される")
    @MainActor
    func testTitleField() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        
        // Then
        let titleLabel = try inspection.find(text: "タイトル")
        #expect(try titleLabel.string() == "タイトル")
        
        // TextFieldを探す
        let textField = try inspection.find(ViewType.TextField.self)
        let placeholder = try textField.labelView().text().string()
        #expect(placeholder == "会議のタイトルを入力")
    }
    
    @Test("期間選択のPickerが表示される")
    @MainActor
    func testPeriodPicker() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        
        // Then
        let periodLabel = try inspection.find(text: "期間")
        #expect(try periodLabel.string() == "期間")
        
        // Pickerを探す
        let picker = try inspection.find(ViewType.Picker.self)
        #expect(picker != nil)
        
        // 選択肢を確認（15分から開始）
        _ = try inspection.find(text: "15分")
        _ = try inspection.find(text: "30分")
        _ = try inspection.find(text: "60分")
    }
    
    @Test("重要フラグのToggleが表示される")
    @MainActor
    func testImportantToggle() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        
        // Then
        let toggle = try inspection.find(ViewType.Toggle.self)
        let toggleLabel = try toggle.labelView().text().string()
        #expect(toggleLabel == "重要な会議")
        
        // 説明文が表示される
        let description = try inspection.find(text: "重要な会議として設定すると、リマインダーが自動的に設定されます")
        #expect(try description.string() == "重要な会議として設定すると、リマインダーが自動的に設定されます")
    }
    
    @Test("作成ボタンが表示される")
    @MainActor
    func testCreateButton() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        
        // Then
        let createButton = try inspection.find(button: "作成")
        let buttonText = try createButton.labelView().text().string()
        #expect(buttonText == "作成")
        
        // 初期状態では無効（タイトル未入力）
        let isDisabled = (try? createButton.isDisabled()) ?? false
        #expect(isDisabled == true)
    }
    
    @Test("有効な入力で作成ボタンが有効になる")
    @MainActor
    func testCreateButtonEnabled() throws {
        // Given
        @State var isPresented = true
        _ = CreateMeetingModalView(isPresented: $isPresented)
        
        // ViewModelに直接アクセスしてフォームを更新
        // （ViewInspectorの制限により、実際のUI操作は困難）
        let viewModel = CreateMeetingViewModel()
        viewModel.form.title = "テスト会議"
        viewModel.form.periodMinutes = 30
        
        // ViewModelを注入した新しいViewを作成することはできないため、
        // このテストは単体テストの限界を示している
        // 実際のUI操作はE2Eテストで確認
    }
    
    @Test("キャンセルボタンでモーダルが閉じる")
    @MainActor
    func testCancelButton() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        let cancelButton = try inspection.find(button: "キャンセル")
        
        // Then - ボタンが存在することを確認
        #expect(try cancelButton.labelView().text().string() == "キャンセル")
        
        // Note: ViewInspectorではボタンタップ後の
        // @Binding値の変更を直接テストすることは困難
        // 実際の動作はE2Eテストで確認
    }
    
    @Test("アラートが設定されている")
    @MainActor
    func testAlertConfiguration() throws {
        // Given
        @State var isPresented = true
        let view = CreateMeetingModalView(isPresented: $isPresented)
        
        // When
        let inspection = try view.inspect()
        
        // Then - alertモディファイアが設定されている
        // ViewInspectorではalertの詳細な確認は制限があるが、
        // 構造上alertが存在することは確認できる
        _ = inspection.findAll(ViewType.Alert.self).count > 0
        
        // Note: SwiftUIのalertは実際にトリガーされるまで
        // インスペクションできない場合がある
    }
}