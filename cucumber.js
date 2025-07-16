module.exports = {
  default: {
    require: ['e2e/steps/**/*.js', 'e2e/support/**/*.js'],
    format: ['progress'],
    timeout: 60000, // 60秒でタイムアウト
    exitAfterLast: true, // テスト終了後即座に終了
    dryRun: false
  }
};