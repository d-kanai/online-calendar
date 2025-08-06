import SwiftUI

#if DEBUG
struct DevTabView: View {
    var body: some View {
        NavigationView {
            PreviewCatalogScreen()
                .navigationTitle("🛠️ 開発ツール")
        }
    }
}
#endif