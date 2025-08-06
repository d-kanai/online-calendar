import SwiftUI
import Core
import Auth
import Meeting
import Stats

#if DEBUG
public struct PreviewCatalogScreen: View {
    @State private var searchText = ""
    
    public init() {}
    
    public var body: some View {
        List {
            homeScreensSection
            homeComponentsSection
            meetingScreensSection
            meetingComponentsSection
            statsScreensSection
            statsComponentsSection
            authSection
            commonComponentsSection
        }
        .navigationTitle("🎨 Previewカタログ")
        .searchable(text: $searchText, prompt: "コンポーネントを検索")
    }
}

// MARK: - Sections
private extension PreviewCatalogScreen {
    var homeScreensSection: some View {
        Section("ホーム画面") {
            NavigationLink("ホーム画面 - 通常状態") {
                Text("HomeScreen - 通常状態")
                    .padding()
            }
            
            NavigationLink("ホーム画面 - ローディング") {
                Text("HomeScreen - ローディング中")
                    .padding()
            }
            
            NavigationLink("ホーム画面 - エラー") {
                Text("HomeScreen - エラー")
                    .padding()
            }
            
            NavigationLink("ホーム画面 - 会議なし") {
                Text("HomeScreen - 次の会議なし")
                    .padding()
            }
        }
    }
    
    var homeComponentsSection: some View {
        Section("ホームコンポーネント") {
            NavigationLink("次の会議カード - 30分後") {
                PreviewWrapper {
                    Text("NextMeetingCard - 30分後")
                        .padding()
                }
            }
            
            NavigationLink("次の会議カード - 開催中") {
                PreviewWrapper {
                    Text("NextMeetingCard - 開催中")
                        .padding()
                }
            }
            
            NavigationLink("次の会議カード - まもなく") {
                PreviewWrapper {
                    Text("NextMeetingCard - まもなく")
                        .padding()
                }
            }
            
            NavigationLink("次の会議カード - 2時間後") {
                PreviewWrapper {
                    Text("NextMeetingCard - 2時間後")
                        .padding()
                }
            }
        }
    }
    
    var meetingScreensSection: some View {
        Section("会議画面") {
            NavigationLink("会議リスト - データあり") {
                Text("MeetingListScreen - with data")
                    .padding()
            }
            
            NavigationLink("会議リスト - 空状態") {
                Text("MeetingListScreen - empty")
                    .padding()
            }
            
            NavigationLink("会議リスト - エラー") {
                Text("MeetingListScreen - error")
                    .padding()
            }
            
            NavigationLink("会議リスト - ローディング") {
                Text("MeetingListScreen - loading")
                    .padding()
            }
        }
    }
    
    var meetingComponentsSection: some View {
        Section("会議コンポーネント") {
            NavigationLink("会議行 - 通常") {
                PreviewWrapper {
                    MeetingRowView(
                        meeting: sampleMeeting,
                        onTap: {}
                    )
                    .padding()
                }
            }
            
            NavigationLink("空状態表示") {
                PreviewWrapper {
                    MeetingEmptyStateView()
                }
            }
            
            NavigationLink("ローディング表示") {
                PreviewWrapper {
                    Text("MeetingLoadingView - Core module")
                }
            }
            
            NavigationLink("エラー表示") {
                PreviewWrapper {
                    MeetingErrorView(message: "ネットワークエラーが発生しました")
                }
            }
        }
    }
    
    var statsScreensSection: some View {
        Section("統計画面") {
            NavigationLink("統計 - データあり") {
                Text("MeetingStatsScreen - with data")
                    .padding()
            }
            
            NavigationLink("統計 - 空状態") {
                Text("MeetingStatsScreen - empty")
                    .padding()
            }
            
            NavigationLink("統計 - エラー") {
                Text("MeetingStatsScreen - error")
                    .padding()
            }
        }
    }
    
    var statsComponentsSection: some View {
        Section("統計コンポーネント") {
            NavigationLink("平均時間カード") {
                PreviewWrapper {
                    Text("AverageTimeCard - Stats module")
                        .padding()
                }
            }
            
            NavigationLink("週間バーチャート") {
                PreviewWrapper {
                    Text("SimpleBarChart - Stats module")
                        .padding()
                }
            }
            
            NavigationLink("日別詳細カード") {
                PreviewWrapper {
                    Text("DailyBreakdownCard - Stats module")
                        .padding()
                }
            }
        }
    }
    
    var authSection: some View {
        Section("認証画面") {
            NavigationLink("サインイン画面") {
                SignInScreen()
            }
        }
    }
    
    var commonComponentsSection: some View {
        Section("共通コンポーネント") {
            NavigationLink("入力フィールド") {
                PreviewWrapper {
                    VStack(spacing: 20) {
                        InputField(
                            title: "メールアドレス",
                            text: .constant("test@example.com"),
                            placeholder: "メールアドレスを入力"
                        )
                        
                        InputField(
                            title: "パスワード",
                            text: .constant(""),
                            placeholder: "パスワードを入力",
                            isSecure: true
                        )
                    }
                    .padding()
                }
            }
            
            NavigationLink("ボタン") {
                PreviewWrapper {
                    VStack(spacing: 20) {
                        PrimaryButton(title: "有効なボタン", action: {})
                        PrimaryButton(title: "無効なボタン", action: {}, isEnabled: false)
                        PrimaryButton(title: "ローディング中", action: {}, isLoading: true)
                    }
                    .padding()
                }
            }
            
            NavigationLink("エラーメッセージ") {
                PreviewWrapper {
                    VStack(spacing: 20) {
                        ErrorMessage(message: "メールアドレスが無効です")
                        ErrorMessage(message: "パスワードは8文字以上必要です")
                    }
                    .padding()
                }
            }
        }
    }
    
    // サンプルデータ
    var sampleMeeting: Meeting {
        Meeting(
            id: "1",
            title: "週次チームミーティング",
            description: "チームの進捗確認",
            startDate: Date().addingTimeInterval(3600),
            endDate: Date().addingTimeInterval(5400),
            organizer: Organizer(id: "org1", name: "田中太郎", email: "tanaka@example.com"),
            participants: [
                Participant(id: "p1", email: "sato@example.com", name: "佐藤花子")
            ]
        )
    }
    
    var sampleWeeklyData: [DailyMeetingMinutes] {
        [
            DailyMeetingMinutes(date: "2024-12-30", dayName: "月", totalMinutes: 120),
            DailyMeetingMinutes(date: "2024-12-31", dayName: "火", totalMinutes: 60),
            DailyMeetingMinutes(date: "2025-01-01", dayName: "水", totalMinutes: 180),
            DailyMeetingMinutes(date: "2025-01-02", dayName: "木", totalMinutes: 90),
            DailyMeetingMinutes(date: "2025-01-03", dayName: "金", totalMinutes: 150),
            DailyMeetingMinutes(date: "2025-01-04", dayName: "土", totalMinutes: 30),
            DailyMeetingMinutes(date: "2025-01-05", dayName: "日", totalMinutes: 45)
        ]
    }
}

// Preview表示用のラッパー
private struct PreviewWrapper<Content: View>: View {
    let content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }
    
    var body: some View {
        ZStack {
            #if os(iOS)
            Color(UIColor.systemGroupedBackground)
                .ignoresSafeArea()
            #else
            Color(.gray).opacity(0.1)
                .ignoresSafeArea()
            #endif
            
            content()
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}


#endif