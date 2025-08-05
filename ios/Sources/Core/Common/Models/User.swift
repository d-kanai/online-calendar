import Foundation

public struct User: Codable {
    public let id: String
    public let email: String
    public let name: String
    
    public init(id: String, email: String, name: String) {
        self.id = id
        self.email = email
        self.name = name
    }
}