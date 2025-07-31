#!/bin/bash

# Maestro E2Eテスト実行スクリプト

# ローカルの Maestro を使用
MAESTRO_BIN="./maestro_cli/maestro/bin/maestro"

# Maestro がインストールされているか確認
if [ ! -f "$MAESTRO_BIN" ]; then
    echo "⚠️  Maestro がインストールされていません。インストールを実行します..."
    ./install_maestro_local.sh
fi

echo "🧪 E2Eテストを実行します..."

# 結果を保存するディレクトリ
RESULTS_DIR="results"
mkdir -p $RESULTS_DIR

# テスト実行時刻
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# エラーログとスクリーンショットを保存
export MAESTRO_DRIVER_STARTUP_TIMEOUT=60000

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
run_test "signin" "signin_test.yaml"
signin_result=$?

# 結果サマリー
echo ""
echo "📊 テスト結果サマリー"
echo "================================="
echo "サインインテスト: $([ $signin_result -eq 0 ] && echo "✅ 成功" || echo "❌ 失敗")"
echo ""
echo "詳細ログ: $RESULTS_DIR/"
echo ""

# テストが成功した場合のみ0を返す
if [ $signin_result -eq 0 ]; then
    echo "🎉 テストが成功しました！"
    exit 0
else
    echo "⚠️  テストが失敗しました"
    exit 1
fi