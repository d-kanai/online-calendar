Feature: 会議統計表示
  ユーザーとして自分の毎日の会議時間を閲覧したい

  Background:
    Given ユーザー"Daiki"でログイン

  Rule: 日次会議時間の平均表示
    過去1週間の各日の会議時間合計を算出し、その平均を表示する
    オーナーとして作成した会議と参加者として"yes"で回答した会議が対象
    会議がない日は0分として扱う
    計算式: (day1合計 + day2合計 + ... + day7合計) ÷ 7日 = 1日あたりの平均時間

    Scenario Outline: 過去7日間の会議データから平均時間を計算する
      Given 過去7日間の会議時間が以下の通りである:
        | 日前 | 合計時間(分) |
        | 7   | <day1> |
        | 6   | <day2> |
        | 5   | <day3> |
        | 4   | <day4> |
        | 3   | <day5> |
        | 2   | <day6> |
        | 1   | <day7> |
      When 会議統計画面を開く
      Then 1日あたりの平均会議時間は "<expected_average>" と表示される

      Examples:
        | day1 | day2 | day3 | day4 | day5 | day6 | day7 | expected_average |
        | 60   | 30   | 90   | 0    | 45   | 0    | 120  | 49.3分           |
        | 30   | 60   | 30   | 0    | 0    | 0    | 0    | 17.1分           |
        | 120  | 120  | 120  | 120  | 120  | 0    | 0    | 85.7分           |
        | 0    | 0    | 0    | 0    | 0    | 0    | 0    | 0.0分            |

    @pending
    Scenario: 同じ日に複数会議がある場合の日別合計
      Given 過去1週間に月曜日に以下の会議がある:
        | 役割 | 回答 | 時間(分) |
        | オーナー | - | 30 |
        | オーナー | - | 45 |
        | 参加者 | yes | 60 |
        | 参加者 | no | 20 |
      And 火曜日に以下の会議がある:
        | 役割 | 回答 | 時間(分) |
        | 参加者 | yes | 90 |
      And 水曜日から日曜日まで会議がない
      When 会議統計画面を開く
      Then 1日あたりの平均会議時間は "32.1分" と表示される
      # 計算: 月曜135分(30+45+60) + 火曜90分 + 水木金土日0分 = (135+90+0+0+0+0+0) ÷ 7 = 32.14... ≈ 32.1分

    @pending
    Scenario: 参加者として"no"で回答した会議は除外される
      Given 過去1週間に月曜日に以下の会議がある:
        | 役割 | 回答 | 時間(分) |
        | オーナー | - | 60 |
        | 参加者 | yes | 30 |
        | 参加者 | no | 90 |
      And 火曜日から日曜日まで会議がない
      When 会議統計画面を開く
      Then 1日あたりの平均会議時間は "12.9分" と表示される
      # 計算: 月曜90分(60+30) + 火水木金土日0分 = (90+0+0+0+0+0+0) ÷ 7 = 12.857... ≈ 12.9分