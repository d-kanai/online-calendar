import SwiftUI

public struct ErrorMessage: View {
    public let message: String?
    public var color: Color = .red
    public var font: Font = .caption
    
    public init(message: String?, color: Color = .red, font: Font = .caption) {
        self.message = message
        self.color = color
        self.font = font
    }
    
    public var body: some View {
        if let message = message {
            Text(message)
                .foregroundColor(color)
                .font(font)
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        ErrorMessage(message: "エラーが発生しました")
        
        ErrorMessage(message: "警告メッセージ", color: .orange)
        
        ErrorMessage(message: "大きなエラー", font: .body)
        
        ErrorMessage(message: nil)
    }
    .padding()
}