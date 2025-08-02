#!/bin/bash

# E2Eテスト用ユーザーのセットアップスクリプト
# バックエンドDBにテストユーザーを登録する

API_URL="${API_URL:-http://localhost:3001}"

echo "🔧 E2Eテスト用ユーザーをセットアップします..."

# バックエンドの起動確認（認証エンドポイントで確認）
echo "🔍 バックエンドの起動を確認中..."
if ! curl -s -X GET "${API_URL}/api/v1/auth/signin" -o /dev/null -w "%{http_code}" | grep -q "405\|404\|200"; then
    echo "⚠️  バックエンドが起動していません (${API_URL})"
    echo "   以下のコマンドでバックエンドを起動してください："
    echo "   yarn back:dev"
    exit 1
fi
echo "✅ バックエンドが起動しています"

# E2Eテストユーザーの情報（OnlineCalendarApp.swiftと一致させる）
USER_ID="e2e-test-user"
EMAIL="test@example.com"
PASSWORD="e2e-test-password"
NAME="E2E Test User"

# まず既存ユーザーをサインインで確認（既に存在する場合はスキップ）
signin_response=$(curl -s -X POST \
  "${API_URL}/api/v1/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
  -w "\n%{http_code}")

http_code=$(echo "$signin_response" | tail -1)
response_body=$(echo "$signin_response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
  echo "✅ E2Eテストユーザーは既に存在します"
  exit 0
fi

# ユーザーが存在しない場合は新規登録
echo "📝 E2Eテストユーザーを新規登録します..."

signup_response=$(curl -s -X POST \
  "${API_URL}/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"name\":\"${NAME}\"}" \
  -w "\n%{http_code}")

http_code=$(echo "$signup_response" | tail -1)
response_body=$(echo "$signup_response" | sed '$d')

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
  echo "✅ E2Eテストユーザーの登録が完了しました"
  echo "   Email: ${EMAIL}"
  echo "   Name: ${NAME}"
elif [ "$http_code" -eq 400 ] && echo "$response_body" | grep -q "既に登録されています"; then
  echo "✅ E2Eテストユーザーは既に登録されています"
  echo "   Email: ${EMAIL}"
else
  echo "❌ E2Eテストユーザーの登録に失敗しました"
  echo "   HTTPステータス: ${http_code}"
  echo "   レスポンス: ${response_body}"
  exit 1
fi