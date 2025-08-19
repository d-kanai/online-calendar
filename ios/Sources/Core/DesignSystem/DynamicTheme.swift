import SwiftUI

// MARK: - Theme Configuration
public struct ThemeConfig: Codable, Equatable {
    public let id: String
    public let name: String
    public let colors: ColorConfig
    public let spacing: SpacingConfig
    public let typography: TypographyConfig
    public let radius: RadiusConfig
    
    // MARK: - Color Configuration
    public struct ColorConfig: Codable, Equatable {
        public let primary: String
        public let primaryDark: String?
        public let secondary: String
        public let secondaryDark: String?
        public let background: String
        public let backgroundDark: String?
        public let surface: String
        public let surfaceDark: String?
        public let error: String
        public let success: String
        public let warning: String
        public let info: String
        
        func color(for key: String, scheme: ColorScheme) -> Color {
            let isDark = scheme == .dark
            switch key {
            case "primary": return Color(hex: isDark && primaryDark != nil ? primaryDark! : primary)
            case "secondary": return Color(hex: isDark && secondaryDark != nil ? secondaryDark! : secondary)
            case "background": return Color(hex: isDark && backgroundDark != nil ? backgroundDark! : background)
            case "surface": return Color(hex: isDark && surfaceDark != nil ? surfaceDark! : surface)
            case "error": return Color(hex: error)
            case "success": return Color(hex: success)
            case "warning": return Color(hex: warning)
            case "info": return Color(hex: info)
            default: return Color.gray
            }
        }
    }
    
    // MARK: - Spacing Configuration
    public struct SpacingConfig: Codable, Equatable {
        public let scale: Double // 1.0 = default, 1.2 = 120%
        
        public var xxSmall: CGFloat { 2 * scale }
        public var xSmall: CGFloat { 4 * scale }
        public var small: CGFloat { 8 * scale }
        public var medium: CGFloat { 16 * scale }
        public var large: CGFloat { 24 * scale }
        public var xLarge: CGFloat { 32 * scale }
        public var xxLarge: CGFloat { 48 * scale }
    }
    
    // MARK: - Typography Configuration
    public struct TypographyConfig: Codable, Equatable {
        public let fontFamily: String?
        public let scale: Double // 1.0 = default size
        
        public func font(_ style: Font.TextStyle) -> Font {
            let baseFont = Font.system(style)
            // カスタムフォントファミリーがある場合は適用
            // スケールファクターで調整
            return baseFont
        }
    }
    
    // MARK: - Radius Configuration
    public struct RadiusConfig: Codable, Equatable {
        public let scale: Double
        
        public var small: CGFloat { 4 * scale }
        public var medium: CGFloat { 8 * scale }
        public var large: CGFloat { 12 * scale }
        public var xLarge: CGFloat { 16 * scale }
    }
}

// MARK: - Default Themes
public extension ThemeConfig {
    static let `default` = ThemeConfig(
        id: "default",
        name: "Default",
        colors: ColorConfig(
            primary: "#007AFF",
            primaryDark: "#0A84FF",
            secondary: "#5856D6",
            secondaryDark: "#5E5CE6",
            background: "#F2F2F7",
            backgroundDark: "#000000",
            surface: "#FFFFFF",
            surfaceDark: "#1C1C1E",
            error: "#FF3B30",
            success: "#34C759",
            warning: "#FF9500",
            info: "#5AC8FA"
        ),
        spacing: SpacingConfig(scale: 1.0),
        typography: TypographyConfig(fontFamily: nil, scale: 1.0),
        radius: RadiusConfig(scale: 1.0)
    )
    
}

// MARK: - Theme Provider
public class ThemeProvider: ObservableObject {
    @Published public private(set) var currentTheme: ThemeConfig
    @Published public private(set) var isLoading = false
    
    public static let shared = ThemeProvider()
    
    private init() {
        self.currentTheme = .default
    }
    
    // MARK: - Public Methods
    
    /// ブランドIDに基づいてテーマを設定
    public func setTheme(for brandId: String) {
        currentTheme = .default
    }
}

// MARK: - Environment Key
private struct DynamicThemeKey: EnvironmentKey {
    static let defaultValue: ThemeConfig = .default
}

extension EnvironmentValues {
    public var dynamicTheme: ThemeConfig {
        get { self[DynamicThemeKey.self] }
        set { self[DynamicThemeKey.self] = newValue }
    }
}

// MARK: - View Extension
public extension View {
    func withDynamicTheme() -> some View {
        self
            .environmentObject(ThemeProvider.shared)
            .environment(\.dynamicTheme, ThemeProvider.shared.currentTheme)
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}