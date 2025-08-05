#!/bin/bash

# iOS Xcode build script for SwiftUI Preview testing

set -e

echo "🔍 Running Xcode build for SwiftUI Preview testing..."

cd App

# Clean build first
echo "🧹 Cleaning build cache..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           clean \
           -quiet

# Build with preview testing enabled
echo "📱 Building with SwiftUI Preview support..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           -configuration Debug \
           -derivedDataPath ./DerivedData \
           build \
           -quiet

# Check for Preview-specific issues by building for PreviewProvider
echo "🖼️ Testing Preview compilation..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           -configuration Debug \
           -derivedDataPath ./DerivedData \
           build-for-testing \
           -quiet

echo "✅ SwiftUI Preview build completed successfully!"