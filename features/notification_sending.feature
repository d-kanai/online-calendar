Feature: 通知の送信
  リマインドや招待が適切なチャネルで参加者へ配信されるようにしたい

  Scenario: メールでリマインドを送信する
    Given 参加者 "hanako@example.com" がメールチャネルを有効にしている
    And リマインドイベントがキューに入っている
    When 通知サービスがジョブを処理する
    Then "hanako@example.com" にメールが送信される
    And 送信ステータスが "SUCCESS" になる
