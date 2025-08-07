import SwiftUI
import AlertToast

// MARK: - Toast Manager

public class ToastManager: ObservableObject {
    @Published public var showToast = false
    @Published public var toastType: AlertToast.AlertType = .complete(.green)
    @Published public var toastMessage = ""
    
    public init() {}
    
    public func showSuccess(_ message: String) {
        toastMessage = message
        toastType = .complete(.green)
        showToast = true
    }
    
    public func showError(_ message: String) {
        toastMessage = message
        toastType = .error(.red)
        showToast = true
    }
    
    public func showInfo(_ message: String) {
        toastMessage = message
        toastType = .systemImage("info.circle.fill", .blue)
        showToast = true
    }
    
    public func showLoading(_ message: String = "読み込み中...") {
        toastMessage = message
        toastType = .loading
        showToast = true
    }
    
    public func hideToast() {
        showToast = false
    }
}

// MARK: - Toast Modifier Extension

public extension View {
    func toastManager(_ manager: ToastManager) -> some View {
        self.toast(isPresenting: Binding(
            get: { manager.showToast },
            set: { manager.showToast = $0 }
        )) {
            AlertToast(
                displayMode: .banner(.slide),
                type: manager.toastType,
                title: manager.toastMessage
            )
        }
    }
}