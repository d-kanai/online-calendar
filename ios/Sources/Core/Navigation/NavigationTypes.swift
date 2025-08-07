import Foundation

// MARK: - Navigation Actions

public enum NavigationAction {
    case todayMeetings
    case weeklyStats
    case home
    case createMeeting  // 新規会議作成モーダル
}

// MARK: - Navigation Handler Protocol

@MainActor
public protocol NavigationHandler {
    func navigate(to action: NavigationAction)
}