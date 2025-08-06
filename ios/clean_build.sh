#!/bin/bash

echo "🧹 iOS Clean Build Script"
echo "========================"

# Change to iOS directory
cd "$(dirname "$0")"

# 1. Clean SPM build artifacts
echo "📦 Cleaning Swift Package Manager build artifacts..."
rm -rf .build/
swift package clean 2>/dev/null || true

# 2. Clean Xcode build artifacts
echo "🔨 Cleaning Xcode build artifacts..."
if [ -d "App/OnlineCalendar.xcodeproj" ]; then
    xcodebuild clean -project App/OnlineCalendar.xcodeproj -scheme OnlineCalendar -quiet 2>/dev/null || true
fi

# 3. Clean DerivedData (optional - commented out by default)
# echo "🗑️  Cleaning DerivedData..."
# rm -rf ~/Library/Developer/Xcode/DerivedData/OnlineCalendar-*

# 4. Clean other generated files
echo "🔧 Cleaning other generated files..."
rm -rf build/
rm -rf .swiftpm/
rm -rf Package.resolved

echo "✅ Clean complete!"
echo ""
echo "You can now run:"
echo "  - swift build          # For SPM build"
echo "  - swift test           # For SPM tests"
echo "  - xcodebuild           # For Xcode build"