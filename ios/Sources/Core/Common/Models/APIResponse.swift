import Foundation

// 汎用的なAPIレスポンスラッパー
public struct APIResponse<T: Decodable>: Decodable {
    public let success: Bool
    public let data: T
    public let error: String?
}