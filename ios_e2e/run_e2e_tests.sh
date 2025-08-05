#!/bin/bash

# Maestro E2Eテスト実行スクリプト

# 環境変数を受け取る（デフォルト: http://localhost:3001）
API_URL="${API_URL:-http://localhost:3001}"

# ローカルの Maestro を使用
MAESTRO_BIN="./maestro_cli/maestro/bin/maestro"

# Maestro がインストールされているか確認
if [ ! -f "$MAESTRO_BIN" ]; then
    echo "⚠️  Maestro がインストールされていません。インストールを実行します..."
    ./install_maestro_local.sh
fi

echo "🧪 E2Eテストを実行します... (API_URL: $API_URL)"

# E2Eテストユーザーのセットアップはマエストロで実行

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

# 最新のビルドを使用するオプション（環境変数で制御）
if [ "${FORCE_BUILD}" = "true" ] || [ ! -d /Users/d.kanai/Library/Developer/Xcode/DerivedData/OnlineCalendar-* ]; then
    echo "🔨 アプリをビルドします..."
    cd ../ios/App
    xcodebuild -project OnlineCalendar.xcodeproj -scheme OnlineCalendar -destination 'platform=iOS Simulator,name=iPhone 16' -configuration Debug clean build -quiet
    BUILD_EXIT_CODE=$?
    cd ../../ios_e2e
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        echo "❌ ビルドに失敗しました (exit code: $BUILD_EXIT_CODE)"
        echo "⚠️  ビルドエラーのため、テストを中止します"
        exit 1
    fi
    
    echo "✅ ビルド完了"
    
    echo "📱 アプリをシミュレータにインストールします..."
    # ビルドされたアプリのパスを探す
    APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "OnlineCalendar.app" -type d | grep "Build/Products/Debug-iphonesimulator" | head -1)
    
    if [ -z "$APP_PATH" ]; then
        echo "❌ ビルドされたアプリが見つかりません"
        exit 1
    fi
    
    xcrun simctl install "iPhone 16" "$APP_PATH"
    INSTALL_EXIT_CODE=$?
    
    if [ $INSTALL_EXIT_CODE -ne 0 ]; then
        echo "❌ アプリのインストールに失敗しました (exit code: $INSTALL_EXIT_CODE)"
        exit 1
    fi
    
    echo "✅ インストール完了"
else
    echo "ℹ️  既存のビルドを使用します (最新ビルドを使用するには FORCE_BUILD=true を設定してください)"
fi

# テスト実行関数
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo ""
    echo "📱 テスト実行: $test_name"
    echo "================================="
    
    # Maestroコマンドの構築
    local maestro_cmd="$MAESTRO_BIN test $test_file -e API_URL='$API_URL' --format junit --output $RESULTS_DIR/${test_name}_${TIMESTAMP}.xml"
    
    # タグが指定されている場合は追加
    if [ -n "$TEST_TAGS" ]; then
        maestro_cmd="$maestro_cmd --include-tags=$TEST_TAGS"
    fi
    
    # テスト実行（エラーログを含む詳細出力）
    eval "$maestro_cmd 2>&1" | tee $RESULTS_DIR/${test_name}_${TIMESTAMP}.log
    
    # PIPESTATUSを使ってmaestroコマンドの実際の終了コードを取得
    local exit_code=${PIPESTATUS[0]}
    
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

# タグが指定されている場合は表示
if [ -n "$TEST_TAGS" ]; then
    echo "🏷️  タグ指定: $TEST_TAGS"
fi

# 全体の成功/失敗を判定するフラグ
all_passed=true

# タグが指定されている場合は、featuresディレクトリ全体を一度に実行
if [ -n "$TEST_TAGS" ]; then
    # Maestroのタグフィルタリングは、ディレクトリ単位で動作
    $MAESTRO_BIN test features/ \
        -e API_URL="$API_URL" \
        --include-tags=$TEST_TAGS \
        --format junit \
        --output $RESULTS_DIR/test_${TIMESTAMP}.xml \
        2>&1 | tee $RESULTS_DIR/test_${TIMESTAMP}.log
    
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        all_passed=false
    fi
else
    # タグ指定がない場合は、従来通り個別に実行
    for test_file in features/*.yaml; do
        if [ -f "$test_file" ]; then
            test_name=$(basename "$test_file" .yaml)
            run_test "$test_name" "$test_file"
            if [ $? -ne 0 ]; then
                all_passed=false
            fi
        fi
    done
fi

# 結果サマリー
echo ""
echo "📊 テスト結果サマリー"
echo "================================="
echo "詳細ログ: $RESULTS_DIR/"
echo ""

# テストが成功した場合のみ0を返す
if [ "$all_passed" = true ]; then
    echo "🎉 すべてのテストが成功しました！"
    exit 0
else
    echo "⚠️  一部のテストが失敗しました"
    exit 1
fi