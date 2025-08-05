import SwiftUI

public struct MeetingStatsScreen: View {
    @ObservedObject private var viewModel: MeetingStatsViewModel
    
    public init(viewModel: MeetingStatsViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        NavigationView {
            ZStack {
                #if os(iOS)
                Color(UIColor.systemGroupedBackground)
                    .ignoresSafeArea()
                #else
                Color(.gray).opacity(0.1)
                    .ignoresSafeArea()
                #endif
                
                if viewModel.isLoading {
                    ProgressView("読み込み中...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    VStack(spacing: 20) {
                        statsCard
                        
                        if let errorMessage = viewModel.errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .padding()
                        }
                        
                        Spacer()
                    }
                    .padding()
                }
            }
            .navigationTitle("会議統計")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.large)
            #endif
        }
        .task {
            await viewModel.loadStats()
        }
    }
    
    private var statsCard: some View {
        VStack(spacing: 16) {
            Text("1日あたりの平均会議時間")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text(viewModel.averageDailyMinutesText)
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
        }
        .padding(30)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
    }
}