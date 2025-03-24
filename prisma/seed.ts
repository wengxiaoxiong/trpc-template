const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 创建默认配置项 - 中文
  const zhSiteConfigs = [
    {
      key: 'site.title',
      value: '模版项目',
      description: '站点标题',
      locale: 'zh'
    },
    {
      key: 'site.description',
      value: '这是一个基于 Next.js + tRPC + Prisma + Minio + Tailwind CSS 的现代化 Web 应用模版。您可以基于此模版快速开发您的项目。',
      description: '站点描述',
      locale: 'zh'
    },
    {
      key: 'site.footer.copyright',
      value: '© 2025 模版项目. All rights reserved.',
      description: '页脚版权信息',
      locale: 'zh'
    },
    {
      key: 'site.footer.slogan',
      value: '创新 · 高效 · 专业',
      description: '页脚标语',
      locale: 'zh'
    },
    {
      key: 'site.year',
      value: '2025',
      description: '版权年份',
      locale: 'zh'
    },
    {
      key: 'site.logo.url',
      value: '',
      description: 'LOGO',
      locale: 'zh'
    },
    {
      key: 'user.storage.max',
      value: '2147483648', // 2GB = 2 * 1024 * 1024 * 1024 = 2147483648 Bytes
      description: '用户最大网盘空间(字节)',
      locale: 'zh'
    },
  ];

  // 英文配置
  const enSiteConfigs = [
    {
      key: 'site.title',
      value: 'Template Project',
      description: 'Site title',
      locale: 'en'
    },
    {
      key: 'site.description',
      value: 'This is a modern web application template based on Next.js + tRPC + Prisma + Minio + Tailwind CSS. You can quickly develop your project based on this template.',
      description: 'Site description',
      locale: 'en'
    },
    {
      key: 'site.footer.copyright',
      value: '© 2025 Template Project. All rights reserved.',
      description: 'Footer copyright',
      locale: 'en'
    },
    {
      key: 'site.footer.slogan',
      value: 'Innovation · Efficiency · Professionalism',
      description: 'Footer slogan',
      locale: 'en'
    },
    {
      key: 'site.year',
      value: '2025',
      description: 'Copyright year',
      locale: 'en'
    },
    {
      key: 'site.logo.url',
      value: '',
      description: 'LOGO',
      locale: 'en'
    },
    {
      key: 'user.storage.max',
      value: '2147483648',
      description: 'User max storage space (bytes)',
      locale: 'en'
    },
  ];

  // 日语配置
  const jaSiteConfigs = [
    {
      key: 'site.title',
      value: 'テンプレートプロジェクト',
      description: 'サイトタイトル',
      locale: 'ja'
    },
    {
      key: 'site.description',
      value: 'これはNext.js + tRPC + Prisma + Minio + Tailwind CSSに基づくモダンなWebアプリケーションテンプレートです。このテンプレートに基づいて、プロジェクトを素早く開発できます。',
      description: 'サイトの説明',
      locale: 'ja'
    },
    {
      key: 'site.footer.copyright',
      value: '© 2025 テンプレートプロジェクト. All rights reserved.',
      description: 'フッターの著作権',
      locale: 'ja'
    },
    {
      key: 'site.footer.slogan',
      value: '革新 · 効率 · プロフェッショナル',
      description: 'フッターのスローガン',
      locale: 'ja'
    },
    {
      key: 'site.year',
      value: '2025',
      description: '著作権の年',
      locale: 'ja'
    },
    {
      key: 'site.logo.url',
      value: '',
      description: 'LOGO',
      locale: 'ja'
    },
    {
      key: 'user.storage.max',
      value: '2147483648',
      description: 'ユーザーの最大ストレージスペース（バイト）',
      locale: 'ja'
    },
  ];

  console.log('开始创建配置项...');
  
  // 合并所有配置
  const allConfigs = [...zhSiteConfigs, ...enSiteConfigs, ...jaSiteConfigs];
  
  for (const config of allConfigs) {
    await prisma.siteConfig.upsert({
      where: { 
        key_locale: {
          key: config.key, 
          locale: config.locale
        }
      },
      update: { 
        value: config.value, 
        description: config.description 
      },
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