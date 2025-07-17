const { Given } = require('@cucumber/cucumber');
const { PrismaClient } = require('@prisma/client');
const { UserFactory, MeetingFactory } = require('../support/factories');

const prisma = new PrismaClient();

// データ準備用の共通Givenステップ（純粋なDB操作のみ）
Given('会議 {string} を作成済み', async function (title) {
  const owner = this.currentUser;
  
  // 明日の14:00-15:00の会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(15, 0, 0, 0);
  
  const meeting = await MeetingFactory.createTomorrow(owner.id, { title });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
});

Given('時間帯 {string} の会議を作成済み', async function (timeRange) {
  const owner = this.currentUser;
  
  // timeRangeから開始時刻と終了時刻を抽出（例: "10:00-11:00"）
  const [startTimeStr, endTimeStr] = timeRange.split('-');
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);
  
  // 明日の日付で指定された時刻の会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const meeting = await prisma.meeting.create({
    data: {
      title: '既存会議',
      startTime: tomorrow,
      endTime: endTime,
      isImportant: false,
      ownerId: owner.id
    }
  });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
});

Given('重要会議 {string} を作成済み', async function (title) {
  const owner = this.currentUser;
  
  // 明日の16:00-17:00の重要会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(17, 0, 0, 0);
  
  const meeting = await MeetingFactory.createTomorrow(owner.id, { 
    title,
    isImportant: true 
  });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
});

Given('会議 {string} に参加者 {string} を追加済み', async function (meetingTitle, participantEmail) {
  // 会議を取得
  const meeting = await prisma.meeting.findFirst({
    where: { title: meetingTitle }
  });
  
  if (!meeting) {
    throw new Error(`Meeting with title "${meetingTitle}" not found`);
  }
  
  // 参加者ユーザーを作成または取得
  let participant = await prisma.user.findFirst({
    where: { email: participantEmail }
  });
  
  if (!participant) {
    participant = await UserFactory.create({
      email: participantEmail,
      name: participantEmail.split('@')[0]
    });
  }
  
  // 参加者を会議に追加
  await prisma.meetingParticipant.create({
    data: {
      meetingId: meeting.id,
      userId: participant.id
    }
  });
});

Given('昨日の会議 {string} を作成済み', async function (title) {
  const owner = this.currentUser;
  
  // 昨日の14:00-15:00の会議を作成
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(14, 0, 0, 0);
  
  const endTime = new Date(yesterday);
  endTime.setHours(15, 0, 0, 0);
  
  const meeting = await MeetingFactory.createYesterday(owner.id, { title });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
});

Given('参加者がいる会議がある', async function () {
  const owner = this.currentUser;
  
  // 明日の14:00-15:00の会議を作成
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(15, 0, 0, 0);
  
  const meeting = await MeetingFactory.createTomorrow(owner.id, {
    title: '参加者がいる会議'
  });
  
  // 参加者ユーザーを作成
  const participant = await UserFactory.createWithName('participant');
  
  // 参加者を会議に追加
  const meetingParticipant = await prisma.meetingParticipant.create({
    data: {
      meetingId: meeting.id,
      userId: participant.id
    }
  });
  
  // 他のステップで使用するため保存
  this.createdMeeting = meeting;
  this.createdParticipant = participant;
  this.createdMeetingParticipant = meetingParticipant;
});

Given('ユーザー {string} が登録済み', async function (email) {
  // 指定されたメールアドレスのユーザーを作成
  const user = await UserFactory.create({
    email: email,
    name: email.split('@')[0]
  });
  
  // 他のステップで使用するため保存
  this.inviteeUser = user;
});