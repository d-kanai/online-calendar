import Foundation
import Core

// MARK: - Navigation State

public class NavigationState: ObservableObject, NavigationHandler {
    @Published public var selectedTab: Int = 0
    
    public init() {}
    
    public func navigate(to action: NavigationAction) {
        switch action {
        case .home:
            selectedTab = 0
        case .todayMeetings:
            selectedTab = 1
        case .weeklyStats:
            selectedTab = 2
        }
    }
    
}