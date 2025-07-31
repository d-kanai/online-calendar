import SwiftUI

// MARK: - Task State Extension
extension Task {
    var isRunning: Bool {
        !isCancelled
    }
}

// MARK: - View Extension for Task
extension View {
    func loadingOverlay<T>(_ task: Task<T, Error>?) -> some View {
        self
            .overlay {
                if task != nil {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                        .overlay {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(1.5)
                        }
                }
            }
            .disabled(task != nil)
            .animation(.easeInOut(duration: 0.2), value: task != nil)
    }
}