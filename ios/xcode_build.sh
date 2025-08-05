#!/bin/bash

# iOS Xcode build script for compile and type checking

set -e

echo "🔍 Running Xcode build for type checking..."

cd App

# Clean build first to avoid cache issues
echo "🧹 Cleaning build cache..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           clean \
           -quiet

# Build for iOS Simulator to check compilation
echo "Building for iOS Simulator..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           build \
           -quiet

echo "✅ Build completed successfully - no compilation errors!"