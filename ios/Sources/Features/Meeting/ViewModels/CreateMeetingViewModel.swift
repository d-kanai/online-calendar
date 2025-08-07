import Foundation
import Combine

@MainActor
public class CreateMeetingViewModel: ObservableObject {
    @Published public var form = CreateMeetingForm()
    @Published public var errorMessage: String = ""
    @Published public var showAlert: Bool = false
    @Published public var createTask: Task<Void, Error>?
    
    private let repository: MeetingRepository
    private var cancellables = Set<AnyCancellable>()
    
    public init(repository: MeetingRepository = MeetingRepository.shared) {
        self.repository = repository
        setupFormObservers()
    }
    
    /// フォームの変更を監視
    private func setupFormObservers() {
        // フォームの変更時にエラーをクリア
        form.$title
            .sink { [weak self] _ in
                self?.clearError()
            }
            .store(in: &cancellables)
        
        form.$periodMinutes
            .sink { [weak self] _ in
                self?.clearError()
            }
            .store(in: &cancellables)
    }
    
    /// エラーをクリア
    private func clearError() {
        errorMessage = ""
        showAlert = false
    }
    
    /// 会議を作成
    public func createMeeting() async throws {
        // バリデーション
        let errors = form.validate()
        if !errors.isEmpty {
            errorMessage = errors.first ?? "入力内容を確認してください"
            showAlert = true
            throw ValidationError.invalid(errors)
        }
        
        do {
            // APIリクエストを作成
            let request = form.toCreateMeetingRequest()
            
            // リポジトリ経由で会議を作成
            try await repository.createMeeting(request)
            
            // 成功したらフォームをリセット
            form.reset()
            
            // 会議一覧を更新
            NotificationCenter.default.post(
                name: .meetingCreated,
                object: nil
            )
        } catch {
            // エラー処理
            handleError(error)
            throw error
        }
    }
    
    /// エラーハンドリング
    private func handleError(_ error: Error) {
        if let validationError = error as? ValidationError {
            switch validationError {
            case .invalid(let errors):
                errorMessage = errors.first ?? "入力内容を確認してください"
            }
        } else {
            errorMessage = "会議の作成に失敗しました: \(error.localizedDescription)"
        }
        showAlert = true
    }
}

// MARK: - Error Types
public enum ValidationError: LocalizedError {
    case invalid([String])
    
    public var errorDescription: String? {
        switch self {
        case .invalid(let errors):
            return errors.first
        }
    }
}

// MARK: - Notifications
public extension Notification.Name {
    static let meetingCreated = Notification.Name("meetingCreated")
}