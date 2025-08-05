import Foundation

extension DateFormatter {
    /// 日本語ロケールの日時フォーマッター（キャッシュ済み）
    static let japaneseMediumDateTime: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter
    }()
    
    /// 日本語ロケールの時刻フォーマッター
    static let japaneseTime: DateFormatter = {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter
    }()
    
    /// 日本語ロケールの日付フォーマッター
    static let japaneseDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter
    }()
}

// MARK: - Date Extension for Formatting
extension Date {
    /// 日本語形式の日時文字列を返す
    var japaneseMediumDateTime: String {
        DateFormatter.japaneseMediumDateTime.string(from: self)
    }
    
    /// 日本語形式の時刻文字列を返す
    var japaneseTime: String {
        DateFormatter.japaneseTime.string(from: self)
    }
    
    /// 日本語形式の日付文字列を返す
    var japaneseDate: String {
        DateFormatter.japaneseDate.string(from: self)
    }
    
    /// 2つの日付間の時間を日本語形式で返す
    func duration(to endDate: Date) -> String {
        let duration = endDate.timeIntervalSince(self)
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60
        
        if hours > 0 {
            return "\(hours)時間\(minutes)分"
        } else {
            return "\(minutes)分"
        }
    }
}