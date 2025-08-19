import SwiftUI

// MARK: - Property Wrapper for Theme
@propertyWrapper
public struct Themed: DynamicProperty {
    @Environment(\.dynamicTheme) private var theme
    @Environment(\.colorScheme) private var colorScheme
    
    public init() {}
    
    public var wrappedValue: ThemeValues {
        ThemeValues(theme: theme, colorScheme: colorScheme)
    }
}

// MARK: - Theme Values Container
public struct ThemeValues {
    private let theme: ThemeConfig
    private let colorScheme: ColorScheme
    
    init(theme: ThemeConfig, colorScheme: ColorScheme) {
        self.theme = theme
        self.colorScheme = colorScheme
    }
    
    // MARK: - Colors
    public var primaryColor: Color {
        theme.colors.color(for: "primary", scheme: colorScheme)
    }
    
    public var secondaryColor: Color {
        theme.colors.color(for: "secondary", scheme: colorScheme)
    }
    
    public var backgroundColor: Color {
        theme.colors.color(for: "background", scheme: colorScheme)
    }
    
    public var surfaceColor: Color {
        theme.colors.color(for: "surface", scheme: colorScheme)
    }
    
    public var errorColor: Color {
        theme.colors.color(for: "error", scheme: colorScheme)
    }
    
    public var successColor: Color {
        theme.colors.color(for: "success", scheme: colorScheme)
    }
    
    public var warningColor: Color {
        theme.colors.color(for: "warning", scheme: colorScheme)
    }
    
    public var infoColor: Color {
        theme.colors.color(for: "info", scheme: colorScheme)
    }
    
    // MARK: - Spacing
    public var spacing: ThemeConfig.SpacingConfig {
        theme.spacing
    }
    
    // MARK: - Typography
    public func font(_ style: Font.TextStyle) -> Font {
        theme.typography.font(style)
    }
    
    // MARK: - Radius
    public var radius: ThemeConfig.RadiusConfig {
        theme.radius
    }
}