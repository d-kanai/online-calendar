import SwiftUI
import Core

@MainActor
public class HomeViewModel: ObservableObject {
    @Published public var summary: HomeSummary?
    @Published public var isLoading = false
    @Published public var errorMessage: String?
    
    private let repository: HomeRepository
    
    public init(repository: HomeRepository? = nil) {
        self.repository = repository ?? HomeRepository()
    }
    
    public func loadSummary() async {
        isLoading = true
        errorMessage = nil
        
        do {
            summary = try await repository.fetchHomeSummary()
        } catch {
            errorMessage = "ホーム画面の読み込みに失敗しました"
            print("❌ [HomeViewModel] Error loading summary: \(error)")
        }
        
        isLoading = false
    }
    
    public func refresh() async {
        await loadSummary()
    }
}