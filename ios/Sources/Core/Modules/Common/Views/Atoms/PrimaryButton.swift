import SwiftUI

public struct PrimaryButton: View {
    public let title: String
    public let action: () -> Void
    public var isEnabled: Bool
    public var isLoading: Bool
    
    public init(title: String, action: @escaping () -> Void, isEnabled: Bool = true, isLoading: Bool = false) {
        self.title = title
        self.action = action
        self.isEnabled = isEnabled
        self.isLoading = isLoading
    }
    
    public var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Text(title)
                        .fontWeight(.semibold)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(isEnabled && !isLoading ? Color.blue : Color.gray)
        .foregroundColor(.white)
        .cornerRadius(10)
        .disabled(!isEnabled || isLoading)
        .animation(.easeInOut(duration: 0.2), value: isEnabled)
        .animation(.easeInOut(duration: 0.2), value: isLoading)
    }
}

#Preview {
    VStack(spacing: 20) {
        PrimaryButton(title: "サインイン", action: {})
        
        PrimaryButton(title: "サインイン", action: {}, isEnabled: false)
        
        PrimaryButton(title: "サインイン", action: {}, isLoading: true)
    }
    .padding()
}