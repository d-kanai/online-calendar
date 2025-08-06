import Foundation

// MARK: - Navigation Actions

public enum NavigationAction {
    case todayMeetings
    case weeklyStats
    case home
}

// MARK: - Navigation Handler Protocol

public protocol NavigationHandler {
    func navigate(to action: NavigationAction)
}