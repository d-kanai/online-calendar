#!/bin/bash

# iOS Xcode build script with verbose error reporting

set -e

echo "🔍 Running Xcode build with detailed error reporting..."

cd App

# Clean build first
echo "🧹 Cleaning build cache..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           clean

# Build for iOS Simulator with detailed output
echo "Building for iOS Simulator with verbose output..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           build \
           -verbose

echo "✅ Build completed successfully!"