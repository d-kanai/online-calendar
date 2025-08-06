# Figma MCP Components

このディレクトリには、Figma MCPサーバーから取得したコンポーネントを格納します。

## 使用方法

1. Figmaデスクトップアプリを起動
2. Dev Modeを有効化
3. MCPサーバーが接続されていることを確認（`claude mcp list`）
4. Figmaファイルを開いてコンポーネントを取得

## 現在のコンポーネント

### Screens
- `screens/Splashscreen.tsx` - スプラッシュスクリーン画面（TODOアプリ紹介）
- `screens/Registration.tsx` - ユーザー登録画面（名前、メール、パスワード）
- `screens/LoginScreen.tsx` - ログイン画面（メール、パスワード）

### Components
- `components/Shape.tsx` - 背景装飾用の円形シェイプ
- `components/Notification.tsx` - ステータスバー（時刻、WiFi、バッテリー）
- `components/Button.tsx` - 汎用ボタンコンポーネント
- `components/InputField.tsx` - テキスト入力フィールド

## 注意事項

- 画像アセットは`http://localhost:3845/assets/`から配信されます
- Figmaデスクトップアプリが起動している必要があります
- 本番環境では画像をローカルに保存する必要があります