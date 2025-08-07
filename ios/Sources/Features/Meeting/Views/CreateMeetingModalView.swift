import SwiftUI

public struct CreateMeetingModalView: View {
    @ObservedObject var viewModel: CreateMeetingViewModel
    @Binding var isPresented: Bool
    
    // 外部からViewModelを受け取る
    public init(viewModel: CreateMeetingViewModel, isPresented: Binding<Bool>) {
        self.viewModel = viewModel
        self._isPresented = isPresented
    }
    
    // 後方互換性のため、ViewModelを内部で作成するイニシャライザも残す
    public init(isPresented: Binding<Bool>) {
        self.viewModel = CreateMeetingViewModel()
        self._isPresented = isPresented
    }
    
    public var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // ヘッダー
                HeaderView
                
                // フォーム
                ScrollView {
                    VStack(spacing: 20) {
                        TitleSection
                        PeriodSection
                        ImportantFlagSection
                    }
                    .padding()
                }
                
                // 作成ボタン
                CreateButtonSection
            }
            .navigationTitle("新規会議作成")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") {
                        isPresented = false
                    }
                }
            }
            .alert("エラー", isPresented: $viewModel.showAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }
}

// MARK: - View Components
private extension CreateMeetingModalView {
    var HeaderView: some View {
        EmptyView()
    }
    
    var TitleSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("タイトル")
                .font(.headline)
            
            TextField("会議のタイトルを入力", text: $viewModel.form.title)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .accessibilityIdentifier("titleField")
            
            if let error = viewModel.form.titleError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
    
    var PeriodSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("期間")
                .font(.headline)
            
            Picker("期間", selection: $viewModel.form.periodMinutes) {
                Text("15分").tag(15)
                Text("30分").tag(30)
                Text("45分").tag(45)
                Text("60分").tag(60)
                Text("90分").tag(90)
                Text("120分").tag(120)
            }
            #if os(iOS)
            .pickerStyle(WheelPickerStyle())
            .frame(height: 120)
            #else
            .pickerStyle(MenuPickerStyle())
            #endif
            .accessibilityIdentifier("periodPicker")
            
            if let error = viewModel.form.periodError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
    
    var ImportantFlagSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Toggle("重要な会議", isOn: $viewModel.form.isImportant)
                .accessibilityIdentifier("importantToggle")
            
            Text("重要な会議として設定すると、リマインダーが自動的に設定されます")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
    
    var CreateButtonSection: some View {
        VStack {
            Button(action: {
                Task {
                    await handleCreateMeeting()
                }
            }) {
                if viewModel.createTask != nil {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                } else {
                    Text("作成")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(viewModel.form.isValid ? Color.blue : Color.gray)
                        .cornerRadius(10)
                }
            }
            .disabled(viewModel.createTask != nil || !viewModel.form.isValid)
            .padding()
        }
        #if os(iOS)
        .background(Color(UIColor.systemBackground))
        #else
        .background(Color(NSColor.windowBackgroundColor))
        #endif
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: -2)
    }
    
    @MainActor
    func handleCreateMeeting() async {
        viewModel.createTask?.cancel()
        viewModel.createTask = Task {
            do {
                try await viewModel.createMeeting()
                isPresented = false
            } catch {
                // エラーはViewModelで処理済み
            }
            viewModel.createTask = nil
        }
    }
}

// MARK: - Preview
struct CreateMeetingModalView_Previews: PreviewProvider {
    static var previews: some View {
        CreateMeetingModalView(isPresented: .constant(true))
    }
}