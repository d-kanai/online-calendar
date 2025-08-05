// 会議統計テスト用のデータセットアップ

var API_URL = API_URL || 'http://localhost:3001';

console.log('Setting up meeting stats test data...');

// 現在の日時を取得
var now = new Date();

// 過去7日間の会議データを作成
// 7日前: 60分
// 6日前: 30分
// 5日前: 90分
// 4日前: 0分（会議なし）
// 3日前: 45分
// 2日前: 0分（会議なし）
// 1日前: 120分
// 合計: 345分 / 7日 = 49.3分

var meetings = [];

// 7日前: 60分の会議
var date7 = new Date(now);
date7.setDate(date7.getDate() - 7);
date7.setHours(10, 0, 0, 0);
meetings.push({
  id: 'meeting-stats-7days-ago',
  title: 'Meeting 7 days ago',
  startTime: date7.toISOString(),
  endTime: new Date(date7.getTime() + 60 * 60 * 1000).toISOString(),
  ownerId: 'e2e-test-user'
});

// 6日前: 30分の会議
var date6 = new Date(now);
date6.setDate(date6.getDate() - 6);
date6.setHours(14, 0, 0, 0);
meetings.push({
  id: 'meeting-stats-6days-ago',
  title: 'Meeting 6 days ago',
  startTime: date6.toISOString(),
  endTime: new Date(date6.getTime() + 30 * 60 * 1000).toISOString(),
  ownerId: 'e2e-test-user'
});

// 5日前: 90分の会議
var date5 = new Date(now);
date5.setDate(date5.getDate() - 5);
date5.setHours(9, 0, 0, 0);
meetings.push({
  id: 'meeting-stats-5days-ago',
  title: 'Meeting 5 days ago',
  startTime: date5.toISOString(),
  endTime: new Date(date5.getTime() + 90 * 60 * 1000).toISOString(),
  ownerId: 'e2e-test-user'
});

// 3日前: 45分の会議
var date3 = new Date(now);
date3.setDate(date3.getDate() - 3);
date3.setHours(15, 30, 0, 0);
meetings.push({
  id: 'meeting-stats-3days-ago',
  title: 'Meeting 3 days ago',
  startTime: date3.toISOString(),
  endTime: new Date(date3.getTime() + 45 * 60 * 1000).toISOString(),
  ownerId: 'e2e-test-user'
});

// 1日前: 120分の会議
var date1 = new Date(now);
date1.setDate(date1.getDate() - 1);
date1.setHours(13, 0, 0, 0);
meetings.push({
  id: 'meeting-stats-1day-ago',
  title: 'Meeting 1 day ago',
  startTime: date1.toISOString(),
  endTime: new Date(date1.getTime() + 120 * 60 * 1000).toISOString(),
  ownerId: 'e2e-test-user'
});

// 各会議を作成
var allSuccess = true;
for (var i = 0; i < meetings.length; i++) {
  var meeting = meetings[i];
  console.log('Creating meeting: ' + meeting.title);
  
  var response = http.post(API_URL + '/api/v1/test-data/setup', {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      table: 'meeting',
      data: meeting
    })
  });
  
  if (response.status === 201) {
    console.log('✅ Meeting created: ' + meeting.title);
  } else if (response.status === 500 && response.body.includes('Unique constraint failed')) {
    console.log('✅ Meeting already exists: ' + meeting.title);
  } else {
    console.log('❌ Failed to create meeting: ' + meeting.title);
    console.log('Response: ' + response.body);
    allSuccess = false;
  }
}

if (allSuccess) {
  console.log('✅ All meeting stats test data created successfully');
  output.success = true;
} else {
  console.log('❌ Some meetings failed to create');
  output.success = false;
}