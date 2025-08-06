import Foundation

// Navigation State for cross-module navigation
public class NavigationState: ObservableObject {
    @Published public var selectedTab: Int = 0
    
    public init() {}
    
    public func navigateToTodayMeetings() {
        selectedTab = 1 // Meeting tab
    }
    
    public func navigateToWeeklyStats() {
        selectedTab = 2 // Stats tab
    }
}