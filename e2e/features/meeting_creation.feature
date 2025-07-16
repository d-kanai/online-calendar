Feature: 会議登録
  オーナーとして新しい会議を登録したい

  Rule: 会議作成時の必須項目チェック
    title, period, important flag は全て必須項目である

    Scenario: 必要項目をすべて入力して会議を作成する
      Given オーナーがログインしている
      When title "定例MTG", period "30分", important flag "false" で会議を作成する
      Then 会議が正常に作成される

    Scenario: 必要項目が未入力の場合エラーになる
      Given オーナーがログインしている
      When title, period, important flag のいずれかが未入力で会議を作成する
      Then "タイトルは必須項目です" エラーが表示される

  Rule: 会議の最小期間制限
    会議の期間は15分以上である必要がある

    @pending
    Scenario: 期間が15分未満の場合エラーになる
      Given オーナーがログインしている
      When period "10分" で会議を作成する
      Then "会議は15分以上で設定してください" エラーが表示される