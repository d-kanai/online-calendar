Feature: 参加者管理
  オーナーとして会議の参加者を管理したい

  Background:
    Given ユーザー"Daiki"でログイン

  Rule: 参加者招待
    オーナーは会議に参加者を招待できる

    Scenario: オーナーが参加者を招待する
      Given ユーザー "hanako@example.com" が登録済み
      And 会議 "チームミーティング" を作成済み
      When カレンダー画面で会議詳細を開く
      And オーナーが新しい参加者を招待する
      Then 参加者が正常に追加される

  Rule: 招待への返信
    招待されたユーザーは会議への参加可否を返信できる

    @develop @pending
    Scenario: 招待されたユーザーが会議に参加返信する
      Given ユーザー"Daiki"から会議"チームミーティング"に招待されている
      And ユーザー"hanako@example.com"でログイン
      When カレンダー画面で招待された会議詳細を開く
      And 参加承諾ボタンをクリックする
      Then 参加ステータスが"参加"に更新される

  Rule: 参加者削除
    オーナーは参加者を削除できる

    Scenario: オーナーが参加者を削除する
      Given 参加者がいる会議がある
      When オーナーが参加者を削除する
      Then 参加者が正常に削除される