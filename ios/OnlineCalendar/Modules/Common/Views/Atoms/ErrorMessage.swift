import SwiftUI

struct ErrorMessage: View {
    let message: String?
    var color: Color = .red
    var font: Font = .caption
    
    var body: some View {
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