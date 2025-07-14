const { setDefaultTimeout } = require('@cucumber/cucumber');

// デフォルトタイムアウトを30秒に設定
setDefaultTimeout(30 * 1000);

module.exports = {
  default: {
    require: [
      'e2e/steps/**/*.js',
      'e2e/support/**/*.js'
    ],
    format: [
      'pretty',
      'html:e2e/reports/cucumber-report.html',
      'json:e2e/reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};