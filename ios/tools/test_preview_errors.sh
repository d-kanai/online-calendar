#!/bin/bash

# Test script to intentionally create and detect Preview errors

set -e

echo "🧪 Testing Preview error detection..."

cd App

# Try to build with SwiftUI Canvas preview compilation
echo "🖼️ Building with SwiftUI preview compilation enabled..."
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           -configuration Debug \
           build \
           SWIFT_ACTIVE_COMPILATION_CONDITIONS="SWIFT_PACKAGE DEBUG" \
           OTHER_SWIFT_FLAGS="-enable-library-evolution -emit-module-interface -emit-module-interface-path \$(DERIVED_FILE_DIR)/\$(MODULE_NAME).swiftinterface" \
           -verbose

echo "✅ Preview compilation test completed!"