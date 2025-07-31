#!/bin/bash

# Maestro をプロジェクトローカルにインストール

MAESTRO_VERSION="1.41.0"
INSTALL_DIR="./maestro_cli"

echo "📦 Maestro をプロジェクトローカルにインストールします..."

# ディレクトリ作成
mkdir -p $INSTALL_DIR

# Maestro をダウンロード
echo "⬇️  Maestro v$MAESTRO_VERSION をダウンロード中..."
curl -Ls "https://github.com/mobile-dev-inc/maestro/releases/download/cli-$MAESTRO_VERSION/maestro.zip" -o maestro.zip

# 解凍
echo "📂 解凍中..."
unzip -q maestro.zip -d $INSTALL_DIR
rm maestro.zip

# 実行権限を付与
chmod +x $INSTALL_DIR/maestro/bin/maestro

echo "✅ インストール完了！"
echo ""
echo "使い方:"
echo "  ./maestro_cli/maestro/bin/maestro test signin_test.yaml"
echo ""
echo "または run_e2e_tests.sh を使用してください"