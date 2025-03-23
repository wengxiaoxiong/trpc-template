import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始更新用户存储空间使用量...');

  // 获取所有用户
  const users = await prisma.user.findMany();

  for (const user of users) {
    // 计算每个用户的文件总大小
    const userFiles = await prisma.userFile.findMany({
      where: { ownerId: user.id },
      select: { size: true }
    });

    const totalStorageUsed = userFiles.reduce((sum, file) => sum + file.size, 0);

    // 更新用户存储空间使用量
    await prisma.user.update({
      where: { id: user.id },
      data: { storageUsed: BigInt(totalStorageUsed) }
    });

    console.log(`用户 ${user.username} (ID: ${user.id}) 存储使用量已更新: ${totalStorageUsed} 字节`);
  }

  console.log('所有用户存储空间使用量更新完成!');
}

main()
  .catch(e => {
    console.error('更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 