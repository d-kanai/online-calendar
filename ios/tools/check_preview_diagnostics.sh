#!/bin/bash

# Check for SwiftUI Preview diagnostics and compilation issues

set -e

echo "🔍 Checking SwiftUI Preview diagnostics..."

cd App

# Check for Preview-specific compilation issues
echo "📱 Testing Preview compilation with diagnostics..."

# Build with detailed diagnostics for Preview issues
xcodebuild -project OnlineCalendar.xcodeproj \
           -scheme OnlineCalendar \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           -configuration Debug \
           build \
           -verbose 2>&1 | tee /tmp/xcode_build.log

# Check for Preview-specific errors in the log
echo "🔍 Checking for Preview-related errors..."
if grep -q "Could not load object file during preview" /tmp/xcode_build.log; then
    echo "❌ Found Preview object file loading error"
    exit 1
fi

if grep -q "Cannot preview in this file" /tmp/xcode_build.log; then
    echo "❌ Found Preview compilation error"
    exit 1
fi

if grep -q "Active scheme does not build this file" /tmp/xcode_build.log; then
    echo "❌ Found Preview scheme configuration error"
    exit 1
fi

echo "✅ No Preview-specific errors detected in build log"

# Check derived data for potential issues
DERIVED_DATA_PATH="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED_DATA_PATH" ]; then
    echo "🧹 Checking for stale derived data..."
    find "$DERIVED_DATA_PATH" -name "*OnlineCalendar*" -type d | head -5
fi

echo "✅ Preview diagnostics check completed!"