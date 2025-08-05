const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true
      // password は表示しない
    }
  });

  console.log('現在のデータベースのユーザー一覧:');
  console.log(JSON.stringify(users, null, 2));
  console.log(`\n合計: ${users.length} 人のユーザー`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });