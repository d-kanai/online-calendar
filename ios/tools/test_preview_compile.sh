#!/bin/bash

# Test SwiftUI Preview compilation specifically

set -e

echo "🖼️ Testing SwiftUI Preview compilation..."

cd App

# Try to build with Preview-specific flags
echo "Building with Preview compilation flags..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           -configuration Debug \
           build \
           OTHER_SWIFT_FLAGS="-enable-library-evolution -emit-module-interface -emit-module-interface-path \$(DERIVED_FILE_DIR)/\$(MODULE_NAME).swiftinterface" \
           -showBuildTimingSummary

echo "✅ Preview compilation test completed!"