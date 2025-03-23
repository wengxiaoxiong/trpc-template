const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 创建默认配置项
  const siteConfigs = [
    {
      key: 'site.title',
      value: '模版项目',
      description: '站点标题',
    },
    {
      key: 'site.description',
      value: '这是一个基于 Next.js + tRPC + Prisma + Minio + Tailwind CSS 的现代化 Web 应用模版。您可以基于此模版快速开发您的项目。',
      description: '站点描述',
    },
    {
      key: 'site.footer.copyright',
      value: '© 2025 模版项目. All rights reserved.',
      description: '页脚版权信息',
    },
    {
      key: 'site.footer.slogan',
      value: '创新 · 高效 · 专业',
      description: '页脚标语',
    },
    {
      key: 'site.year',
      value: '2025',
      description: '版权年份',
    },
    {
      key: 'site.logo.url',
      value: 'https://www.example.com/logo.png',
      description: '版权年份',
    },
    {
      key: 'user.storage.max',
      value: '2147483648', // 2GB = 2 * 1024 * 1024 * 1024 = 2147483648 Bytes
      description: '用户最大网盘空间(字节)',
    },
  ];

  console.log('开始创建配置项...');
  
  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config,
    });
  }

  console.log('配置项创建完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 