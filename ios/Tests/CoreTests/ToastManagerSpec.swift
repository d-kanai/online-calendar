import Testing
import SwiftUI
@testable import Core

@Suite("ToastManager振る舞いテスト")
struct ToastManagerSpec {
    
    @Test("成功トーストが正しく表示される")
    @MainActor
    func testSuccessToast() {
        // Given
        let manager = ToastManager()
        
        // When
        manager.showSuccess("会議を作成しました")
        
        // Then
        #expect(manager.showToast == true)
        #expect(manager.toastMessage == "会議を作成しました")
    }
    
    @Test("エラートーストが正しく表示される")
    @MainActor
    func testErrorToast() {
        // Given
        let manager = ToastManager()
        
        // When
        manager.showError("エラーが発生しました")
        
        // Then
        #expect(manager.showToast == true)
        #expect(manager.toastMessage == "エラーが発生しました")
    }
    
    @Test("情報トーストが正しく表示される")
    @MainActor
    func testInfoToast() {
        // Given
        let manager = ToastManager()
        
        // When
        manager.showInfo("お知らせがあります")
        
        // Then
        #expect(manager.showToast == true)
        #expect(manager.toastMessage == "お知らせがあります")
    }
    
    @Test("ローディングトーストが正しく表示される")
    @MainActor
    func testLoadingToast() {
        // Given
        let manager = ToastManager()
        
        // When
        manager.showLoading("処理中...")
        
        // Then
        #expect(manager.showToast == true)
        #expect(manager.toastMessage == "処理中...")
    }
    
    @Test("デフォルトローディングメッセージが設定される")
    @MainActor
    func testDefaultLoadingMessage() {
        // Given
        let manager = ToastManager()
        
        // When
        manager.showLoading()
        
        // Then
        #expect(manager.showToast == true)
        #expect(manager.toastMessage == "読み込み中...")
    }
    
    @Test("トーストを非表示にできる")
    @MainActor
    func testHideToast() {
        // Given
        let manager = ToastManager()
        manager.showSuccess("テスト")
        
        // When
        manager.hideToast()
        
        // Then
        #expect(manager.showToast == false)
    }
}