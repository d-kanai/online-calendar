// E2Eテストユーザーを確認/作成 (Maestro JavaScript)

var API_URL = 'http://localhost:3001';
var EMAIL = 'test@example.com';
var PASSWORD = 'e2e-test-password';
var NAME = 'E2E Test User';

console.log('Setting up E2E test user: ' + EMAIL);

// httpライブラリを使用してAPIリクエスト
var response = http.post(API_URL + '/api/auth/signup', {
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
    name: NAME
  })
});

if (response.status === 201) {
  console.log('✅ Test user created successfully');
  output.success = true;
} else if (response.status === 409) {
  console.log('✅ Test user already exists');
  output.success = true;
} else {
  console.log('❌ Failed to create test user (status: ' + response.status + ')');
  output.success = false;
}