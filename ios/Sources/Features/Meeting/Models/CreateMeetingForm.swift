import Foundation

/// 会議作成フォームのモデル
/// バリデーションロジックを含む
public class CreateMeetingForm: ObservableObject {
    @Published public var title: String = ""
    @Published public var periodMinutes: Int = 30
    @Published public var isImportant: Bool = false
    
    public init() {}
    
    // MARK: - Validation
    
    /// フォーム全体の有効性
    public var isValid: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        title.count <= 100 &&
        periodMinutes >= 15 &&
        periodMinutes <= 480
    }
    
    /// タイトルのエラーメッセージ
    public var titleError: String? {
        guard !title.isEmpty else {
            return nil // 初期状態ではエラーを表示しない
        }
        
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return "タイトルは必須項目です"
        }
        
        if title.count > 100 {
            return "タイトルは100文字以内で入力してください"
        }
        
        return nil
    }
    
    /// 期間のエラーメッセージ
    public var periodError: String? {
        if periodMinutes < 15 {
            return "会議は15分以上で設定してください"
        }
        
        if periodMinutes > 480 { // 8時間
            return "会議は8時間以内で設定してください"
        }
        
        return nil
    }
    
    /// バリデーションエラーの取得
    public func validate() -> [String] {
        var errors: [String] = []
        
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            errors.append("タイトルは必須項目です")
        }
        
        if let periodError = periodError {
            errors.append(periodError)
        }
        
        return errors
    }
    
    /// フォームのリセット
    public func reset() {
        title = ""
        periodMinutes = 30
        isImportant = false
    }
    
    /// API送信用のデータに変換
    public func toCreateMeetingRequest() -> Meeting.CreateMeetingRequest {
        let now = Date()
        let endTime = now.addingTimeInterval(TimeInterval(periodMinutes * 60))
        
        return Meeting.CreateMeetingRequest(
            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
            startTime: now,
            endTime: endTime,
            isImportant: isImportant
        )
    }
}

