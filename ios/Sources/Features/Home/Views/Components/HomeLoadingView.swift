import SwiftUI

struct HomeLoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text("データを読み込み中...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - SwiftUI Previews
#if DEBUG
#Preview("ローディング表示") {
    HomeLoadingView()
        .frame(height: 300)
        .padding()
}

#Preview("ダークモード") {
    HomeLoadingView()
        .frame(height: 300)
        .padding()
        .preferredColorScheme(.dark)
}
#endif