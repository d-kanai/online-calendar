// 汎用的なテストデータセットアップ (Maestro JavaScript)

// 環境変数から設定を取得
var API_URL = API_URL || 'http://localhost:3001';
var TABLE = TABLE;
var DATA = DATA;

console.log('Setting up test data for table: ' + TABLE);

// データセットアップAPIを呼び出す
var response = http.post(API_URL + '/api/v1/test-data/setup', {
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    table: TABLE,
    data: JSON.parse(DATA)
  })
});

console.log('Response status: ' + response.status);

if (response.status === 201) {
  console.log('✅ Test data created successfully');
  output.success = true;
} else if (response.status === 500 && response.body.includes('Unique constraint failed')) {
  console.log('✅ Test data already exists');
  output.success = true;
} else {
  console.log('❌ Failed to create test data (status: ' + response.status + ')');
  console.log('Response: ' + response.body);
  output.success = false;
}