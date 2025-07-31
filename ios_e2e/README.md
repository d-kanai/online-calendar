# iOS E2Eテスト (Maestro)

## セットアップ

### 初回セットアップ
```bash
# Maestro をプロジェクトローカルにインストール
./install_maestro_local.sh

# または npm/yarn を使用
npm install
```

## テスト実行

### 全テストを実行
```bash
./run_e2e_tests.sh

# または npm/yarn を使用
npm test
```

### 個別のテストを実行
```bash
# サインインテスト
./maestro_cli/maestro/bin/maestro test signin_test.yaml
# または
npm run test:signin
```

### デバッグモードで実行
```bash
./maestro_cli/maestro/bin/maestro test signin_test.yaml --debug-output debug
```

## エラーログの確認

テスト実行後、以下の場所にログが保存されます：
- `results/` - テスト結果とログ

## トラブルシューティング

### よくあるエラーと対処法

1. **要素が見つからない**
   - `assertVisible` のタイムアウトを増やす
   - テキストが正確に一致しているか確認

2. **タップできない**
   - `hideKeyboard` を追加
   - 要素が画面内に表示されているか確認

3. **テキスト入力できない**
   - フィールドをタップしてからinputText
   - clearTextを使用して既存のテキストをクリア