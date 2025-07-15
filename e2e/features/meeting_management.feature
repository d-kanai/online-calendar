Feature: 会議編集
  オーナーとして既存の会議を編集したい

  Rule: 会議編集可能項目
    オーナーは title と period を編集できる

    @pending
    Scenario: オーナーがtitleとperiodを更新する
      Given オーナーが作成した未来の会議がある
      When オーナーが title と period を更新する
      Then 会議が正常に更新される

  Rule: 会議編集権限制限
    会議を編集できるのはオーナーのみである

    @pending
    Scenario: オーナー以外は会議を更新できない
      Given 他のユーザーが作成した会議がある
      When 参加者が会議を更新しようとする
      Then "オーナーのみが会議を編集できます" エラーが表示される

  Rule: 開始済み会議の編集制限
    開始済みまたは終了済みの会議は編集できない

    @pending
    Scenario: 開始済みの会議は更新できない
      Given オーナーが作成した開始済みの会議がある
      When オーナーが会議を更新しようとする
      Then "開始済みの会議は編集できません" エラーが表示される