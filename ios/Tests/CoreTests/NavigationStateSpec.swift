import Testing
import Foundation
@testable import Core

@Suite("NavigationState振る舞いテスト")
struct NavigationStateSpec {
    
    @Test("createMeetingアクションでモーダルフラグが立つ")
    @MainActor
    func testCreateMeetingActionShowsModal() {
        // Given
        let navigationState = NavigationState()
        #expect(navigationState.showCreateMeetingModal == false)
        
        // When
        navigationState.navigate(to: .createMeeting)
        
        // Then
        #expect(navigationState.showCreateMeetingModal == true)
        #expect(navigationState.selectedTab == 0) // タブは変わらない
    }
    
    @Test("todayMeetingsアクションでタブが切り替わる")
    @MainActor
    func testTodayMeetingsActionSwitchesTab() {
        // Given
        let navigationState = NavigationState()
        navigationState.selectedTab = 0
        
        // When
        navigationState.navigate(to: .todayMeetings)
        
        // Then
        #expect(navigationState.selectedTab == 1)
        #expect(navigationState.showCreateMeetingModal == false)
    }
    
    @Test("weeklyStatsアクションでタブが切り替わる")
    @MainActor
    func testWeeklyStatsActionSwitchesTab() {
        // Given
        let navigationState = NavigationState()
        navigationState.selectedTab = 0
        
        // When
        navigationState.navigate(to: .weeklyStats)
        
        // Then
        #expect(navigationState.selectedTab == 2)
        #expect(navigationState.showCreateMeetingModal == false)
    }
    
    @Test("homeアクションでホームタブに戻る")
    @MainActor
    func testHomeActionSwitchesToHomeTab() {
        // Given
        let navigationState = NavigationState()
        navigationState.selectedTab = 2
        
        // When
        navigationState.navigate(to: .home)
        
        // Then
        #expect(navigationState.selectedTab == 0)
        #expect(navigationState.showCreateMeetingModal == false)
    }
    
    @Test("モーダルフラグの初期値はfalse")
    @MainActor
    func testInitialModalState() {
        // Given/When
        let navigationState = NavigationState()
        
        // Then
        #expect(navigationState.showCreateMeetingModal == false)
        #expect(navigationState.selectedTab == 0)
    }
}