// 全てのテストデータをリセット (Maestro JavaScript)

// 環境変数から設定を取得
var API_URL = API_URL || 'http://localhost:3001';

console.log('Resetting all test data...');

// テストデータリセットAPIを呼び出す
var response = http.post(API_URL + '/api/v1/test-data/reset', {
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

if (response.status === 200) {
  console.log('✅ All test data reset successfully');
  var responseData = JSON.parse(response.body);
  console.log('Deleted counts:');
  console.log('  - MeetingParticipant: ' + responseData.counts.meetingParticipant);
  console.log('  - Meeting: ' + responseData.counts.meeting);
  console.log('  - User: ' + responseData.counts.user);
  output.success = true;
} else {
  console.log('❌ Failed to reset test data (status: ' + response.status + ')');
  console.log('Response: ' + response.body);
  output.success = false;
}