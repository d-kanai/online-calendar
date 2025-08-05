import Foundation

// MARK: - Token Provider Protocol
@MainActor
public protocol TokenProvider {
    var currentToken: String? { get }
}