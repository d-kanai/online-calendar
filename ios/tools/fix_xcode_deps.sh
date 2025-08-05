#!/bin/bash

# Fix Xcode project dependencies to include all SPM modules

cd "$(dirname "$0")/../App"

# Use xcodebuild to resolve packages
xcodebuild -resolvePackageDependencies -project OnlineCalendar.xcodeproj -scheme OnlineCalendar

echo "✅ Package dependencies resolved"