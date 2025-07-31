import Foundation

// 汎用的なAPIレスポンスラッパー
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T
    let error: String?
}