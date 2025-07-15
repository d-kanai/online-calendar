Feature: 会議統計表示
  ユーザーとして自分の毎日の会議時間を閲覧したい

  Rule: 日次会議時間の平均表示
    過去1週間の会議を対象として1日あたりの平均会議時間を表示する
    オーナーとして作成した会議と参加者として"yes"で回答した会議が対象
    計算式: 総会議時間 ÷ 7日 = 1日あたりの平均時間

    @pending
    Scenario Outline: 具体的な会議データから平均時間を計算する
      Given 過去1週間に以下の会議がある:
        | 役割 | 回答 | 時間(分) |
        | オーナー | - | <owner_minutes> |
        | 参加者 | yes | <participant_yes_minutes> |
        | 参加者 | no | <participant_no_minutes> |
      When 会議統計画面を開く
      Then 1日あたりの平均会議時間は "<expected_average>" と表示される

      Examples:
        | owner_minutes | participant_yes_minutes | participant_no_minutes | expected_average |
        | 60            | 30                      | 20                     | 12.9分           |
        | 120           | 60                      | 0                      | 25.7分           |
        | 0             | 210                     | 60                     | 30.0分           |
        | 0             | 0                       | 90                     | 0.0分            |

    @pending
    Scenario: 週の途中での計算例
      Given 今日が水曜日である
      And 過去1週間に以下の会議がある:
        | 日 | 役割 | 回答 | 時間(分) |
        | 月 | オーナー | - | 60 |
        | 火 | 参加者 | yes | 30 |
        | 水 | 参加者 | no | 45 |
      When 会議統計画面を開く
      Then 1日あたりの平均会議時間は "12.9分" と表示される
      # 計算: (60 + 30) ÷ 7 = 12.857... ≈ 12.9分

    @pending
    Scenario: 同じ日に複数会議がある場合
      Given 過去1週間に月曜日に以下の会議がある:
        | 役割 | 回答 | 時間(分) |
        | オーナー | - | 30 |
        | オーナー | - | 45 |
        | 参加者 | yes | 60 |
      When 会議統計画面を開く
      Then 1日あたりの平均会議時間は "19.3分" と表示される
      # 計算: (30 + 45 + 60) ÷ 7 = 19.285... ≈ 19.3分