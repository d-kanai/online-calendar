import Foundation

// MARK: - Home Modal Types

public enum HomeModal: Identifiable {
    case createMeeting
    // 将来的に追加可能
    // case settings
    // case profile
    // case notifications
    
    public var id: String {
        switch self {
        case .createMeeting:
            return "createMeeting"
        }
    }
}