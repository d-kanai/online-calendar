#!/bin/bash
set -e

echo "🧪 Running Swift tests with coverage..."

# テスト実行（Releaseモードでビルドしてデバッグコードを除外）
swift test --enable-code-coverage

# カバレッジレポート生成
echo -e "\n📊 Coverage Report:\n"

# 除外するファイルパターン：
# - .build: ビルドディレクトリ
# - Tests: テストコード
# - Repository\.swift: Repository実装（プロトコルは含まない）
# - APIClient\.swift: APIClient実装
# - RootView\.swift: RootViewとMainTabView
# - Mock.*: モックファイル
# - Preview.*: Previewで使用されるモッククラス

PROFDATA=".build/arm64-apple-macosx/debug/codecov/default.profdata"
BINARY=".build/arm64-apple-macosx/debug/OnlineCalendarPackageTests.xctest/Contents/MacOS/OnlineCalendarPackageTests"

# 複数の除外パターンを組み合わせ
IGNORE_PATTERNS=(
    ".build"
    "Tests"
    "Repository\.swift"
    "APIClient\.swift"
    "RootView\.swift"
    "Mock[A-Za-z]*\.swift"
    "Preview[A-Za-z]*"
)

# パターンを|で結合
IGNORE_REGEX=$(IFS='|'; echo "${IGNORE_PATTERNS[*]}")

# テキスト形式でカバレッジ率を表示
xcrun llvm-cov export \
    -instr-profile="$PROFDATA" \
    "$BINARY" \
    -ignore-filename-regex="$IGNORE_REGEX" \
    -format=text | jq -r '.data[0].totals | 
    "  Line Coverage: " + (.lines.percent | tostring | .[0:5]) + "%\n" +
    "  Functions: " + (.functions.percent | tostring | .[0:5]) + "%\n" +
    "  Covered Lines: " + (.lines.covered | tostring) + "/" + (.lines.count | tostring)'

# HTML形式のレポート生成
echo -e "\n🎨 Generating HTML Coverage Report..."

xcrun llvm-cov show \
    -instr-profile="$PROFDATA" \
    -format=html \
    -output-dir=coverage \
    "$BINARY" \
    -ignore-filename-regex="$IGNORE_REGEX" \
    -use-color \
    -show-region-summary=false \
    -show-line-counts-or-regions

# 詳細レポートを生成
echo -e "\n📝 Detailed coverage by file:"

xcrun llvm-cov report \
    -instr-profile="$PROFDATA" \
    "$BINARY" \
    -ignore-filename-regex="$IGNORE_REGEX" \
    -show-region-summary=false | head -30

echo -e "\n✅ HTML Coverage Report: ios/coverage/index.html"

# HTMLレポートを開く
if [[ "$OSTYPE" == "darwin"* ]]; then
    open coverage/index.html
fi