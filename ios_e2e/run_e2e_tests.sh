#!/bin/bash

# Maestro E2Eテスト実行スクリプト

# 環境変数を受け取る
API_URL="${API_URL:-http://localhost:3001}"

# ローカルの Maestro を使用
MAESTRO_BIN="./maestro_cli/maestro/bin/maestro"

# Maestro がインストールされているか確認
if [ ! -f "$MAESTRO_BIN" ]; then
    echo "⚠️  Maestro がインストールされていません。インストールを実行します..."
    ./install_maestro_local.sh
fi

echo "🧪 E2Eテストを実行します... (API_URL: $API_URL)"

# E2Eテストユーザーのセットアップ
echo "👤 E2Eテストユーザーをセットアップ中..."
if ./setup_e2e_user.sh; then
    echo "✅ ユーザーセットアップ完了"
else
    echo "❌ ユーザーセットアップに失敗しました"
    exit 1
fi

# 結果を保存するディレクトリ
RESULTS_DIR="results"
mkdir -p $RESULTS_DIR

# テスト実行時刻
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# エラーログとスクリーンショットを保存
export MAESTRO_DRIVER_STARTUP_TIMEOUT=60000

# iPhone 16 シミュレータが起動していることを確認
if ! xcrun simctl list devices booted | grep -q "iPhone 16"; then
    echo "⚠️  iPhone 16 シミュレータが起動していません。起動します..."
    xcrun simctl boot "iPhone 16"
    sleep 3
    open -a Simulator
    sleep 5
fi

# アプリがビルドされていることを確認
if ! ls /Users/d.kanai/Library/Developer/Xcode/DerivedData/OnlineCalendar-* >/dev/null 2>&1; then
    echo "⚠️  アプリがビルドされていません。ビルドを実行します..."
    cd ../ios
    xcodebuild -project OnlineCalendar.xcodeproj -scheme OnlineCalendar -destination 'platform=iOS Simulator,name=iPhone 16' build -quiet
    cd ../ios_e2e
fi

# テスト実行関数
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo ""
    echo "📱 テスト実行: $test_name"
    echo "================================="
    
    # テスト実行（エラーログを含む詳細出力）
    $MAESTRO_BIN test $test_file \
        -e API_URL="$API_URL" \
        --format junit \
        --output $RESULTS_DIR/${test_name}_${TIMESTAMP}.xml \
        2>&1 | tee $RESULTS_DIR/${test_name}_${TIMESTAMP}.log
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "✅ $test_name: 成功"
    else
        echo "❌ $test_name: 失敗 (exit code: $exit_code)"
        echo "   ログ: $RESULTS_DIR/${test_name}_${TIMESTAMP}.log"
        
        # エラー詳細を表示
        echo ""
        echo "📋 エラー詳細:"
        grep -E "ERROR|FAILED|Exception|Error:|Failed:" $RESULTS_DIR/${test_name}_${TIMESTAMP}.log | tail -20
    fi
    
    return $exit_code
}

# 各テストを実行
echo "🚀 テストスイートを開始..."

# テストケース実行
run_test "signin" "features/signin_test.yaml"
signin_result=$?

run_test "meeting" "features/meeting_test.yaml"
meeting_result=$?

# 結果サマリー
echo ""
echo "📊 テスト結果サマリー"
echo "================================="
echo "サインインテスト: $([ $signin_result -eq 0 ] && echo "✅ 成功" || echo "❌ 失敗")"
echo "会議一覧テスト: $([ $meeting_result -eq 0 ] && echo "✅ 成功" || echo "❌ 失敗")"
echo ""
echo "詳細ログ: $RESULTS_DIR/"
echo ""

# テストが成功した場合のみ0を返す
if [ $signin_result -eq 0 ] && [ $meeting_result -eq 0 ]; then
    echo "🎉 テストが成功しました！"
    exit 0
else
    echo "⚠️  テストが失敗しました"
    exit 1
fi