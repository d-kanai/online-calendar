Feature: ユーザー認証機能
  新規ユーザーがアカウントを作成し、既存ユーザーがログインできるようにしたい

  Rule: サインアップ時のメールアドレスは一意である必要がある

    @pending
    Scenario: 新規ユーザーが正常にサインアップする
      Given まだ登録されていないメールアドレス "user@example.com" がある
      When そのメールアドレスとパスワード "password123" でサインアップする
      Then アカウントが作成される
      And 確認メールが "user@example.com" に送信される

    @pending
    Scenario: 既に登録済みのメールアドレスでサインアップしようとする
      Given 既に登録されているメールアドレス "existing@example.com" がある
      When そのメールアドレスでサインアップしようとする
      Then 「このメールアドレスは既に使用されています」というエラーが表示される
      And アカウントは作成されない

  Rule: サインインには正しいメールアドレスとパスワードが必要

    @pending
    Scenario: 正しい認証情報でサインインする
      Given 登録済みのユーザー "user@example.com" / "password123" がいる
      When そのメールアドレスとパスワードでサインインする
      Then ログインが成功する
      And カレンダーのメイン画面にリダイレクトされる

    @pending
    Scenario: 間違ったパスワードでサインインしようとする
      Given 登録済みのユーザー "user@example.com" がいる
      When 正しいメールアドレスと間違ったパスワードでサインインしようとする
      Then 「メールアドレスまたはパスワードが間違っています」というエラーが表示される
      And ログインは失敗する

    @pending
    Scenario: 存在しないメールアドレスでサインインしようとする
      Given 登録されていないメールアドレス "nonexistent@example.com" がある
      When そのメールアドレスでサインインしようとする
      Then 「メールアドレスまたはパスワードが間違っています」というエラーが表示される
      And ログインは失敗する


