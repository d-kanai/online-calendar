import Testing
import SwiftUI
import ViewInspector
@testable import Home
@testable import Core

@Suite("HomeScreen会議作成ボタン振る舞いテスト")
struct HomeScreenNavigationSpec {
    
    @Test("会議作成ボタンが表示される")
    @MainActor
    func testCreateMeetingButtonIsVisible() throws {
        // Given
        let viewModel = HomeViewModel()
        let navigationHandler = MockNavigationHandler()
        viewModel.summary = HomeSummary(
            userName: "テストユーザー",
            todayMeetingsCount: 2,
            weeklyMeetingHours: 10.5,
            nextMeeting: nil
        )
        
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: navigationHandler
        )
        
        // When
        let inspection = try view.inspect()
        
        // Then - 会議作成ボタンが表示される
        let button = try inspection.find(button: "新規会議作成")
        #expect(button != nil)
    }
    
    @Test("会議作成ボタンが正しいアクセシビリティIDを持つ")
    @MainActor
    func testCreateMeetingButtonAccessibilityId() throws {
        // Given
        let viewModel = HomeViewModel()
        let navigationHandler = MockNavigationHandler()
        viewModel.summary = HomeSummary(
            userName: "テストユーザー",
            todayMeetingsCount: 2,
            weeklyMeetingHours: 10.5,
            nextMeeting: nil
        )
        
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: navigationHandler
        )
        
        // When
        let inspection = try view.inspect()
        
        // Then - アクセシビリティIDが設定されている
        let buttons = inspection.findAll(ViewType.Button.self)
        let hasCorrectId = buttons.contains { button in
            (try? button.accessibilityIdentifier()) == "createMeetingButtonHome"
        }
        #expect(hasCorrectId == true)
    }
    
    @Test("会議作成ボタンをタップするとnavigateが呼ばれる")
    @MainActor
    func testCreateMeetingButtonTapCallsNavigate() throws {
        // Given
        let viewModel = HomeViewModel()
        let navigationHandler = MockNavigationHandler()
        viewModel.summary = HomeSummary(
            userName: "テストユーザー",
            todayMeetingsCount: 2,
            weeklyMeetingHours: 10.5,
            nextMeeting: nil
        )
        
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: navigationHandler
        )
        
        // When
        let inspection = try view.inspect()
        let button = try inspection.find(viewWithAccessibilityIdentifier: "createMeetingButtonHome")
        try button.button().tap()
        
        // Then
        #expect(navigationHandler.navigateCalled == true)
        #expect(navigationHandler.lastNavigationAction == .createMeeting)
    }
    
    @Test("会議作成ボタンにプラスアイコンが表示される")
    @MainActor
    func testCreateMeetingButtonShowsPlusIcon() throws {
        // Given
        let viewModel = HomeViewModel()
        let navigationHandler = MockNavigationHandler()
        viewModel.summary = HomeSummary(
            userName: "テストユーザー",
            todayMeetingsCount: 2,
            weeklyMeetingHours: 10.5,
            nextMeeting: nil
        )
        
        let view = HomeScreen(
            viewModel: viewModel,
            navigationHandler: navigationHandler
        )
        
        // When
        let inspection = try view.inspect()
        
        // Then - プラスアイコンが表示される
        let images = inspection.findAll(ViewType.Image.self)
        let hasPlusIcon = images.contains { image in
            (try? image.actualImage().name()) == "plus.circle.fill"
        }
        #expect(hasPlusIcon == true)
    }
}

// MARK: - Mock NavigationHandler
@MainActor
private class MockNavigationHandler: NavigationHandler {
    var navigateCalled = false
    var lastNavigationAction: NavigationAction?
    
    func navigate(to action: NavigationAction) {
        navigateCalled = true
        lastNavigationAction = action
    }
}