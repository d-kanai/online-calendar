Feature: 参加者管理
  オーナーとして会議の参加者を管理したい

  Background:
    Given ユーザー"Daiki"でログイン

  Rule: 参加者招待
    オーナーは会議に参加者を招待できる

    @develop
    Scenario: オーナーが参加者を招待する
      Given 作成した会議がある
      When オーナーが新しい参加者を招待する
      Then 参加者が正常に追加される

  Rule: 参加者削除
    オーナーは参加者を削除できる

    @pending
    Scenario: オーナーが参加者を削除する
      Given 参加者がいる会議がある
      When オーナーが参加者を削除する
      Then 参加者が正常に削除される