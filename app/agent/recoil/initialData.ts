import { Stage, Message, UserRequirement } from '../types';

// 初始化聊天消息
export const initialMessages: Message[] = [
  {
    type: 'bot',
    content: '欢迎来到 Product Innovation Workbench！让我们从了解您的目标市场开始。您想开发什么类型的产品？',
    timestamp: '09:00 AM'
  },
  {
    type: 'user',
    content: '我想开发一个高端巧克力产品系列。',
    timestamp: '09:01 AM'
  },
  {
    type: 'bot',
    content: '根据我们的数据分析，高端巧克力市场确实存在很大机会。从Popular Keywords中可以看到，"Premium"、"Organic"和"Luxury"都是当前市场的热点。',
    timestamp: '09:02 AM',
    dataSources: {
      keywords: ['Premium', 'Organic', 'Luxury'],
      products: [
        {
          name: 'Dark Chocolate Truffles',
          brand: 'Godiva',
          rating: 4.8
        }
      ],
      webSources: [
        {
          title: '高端巧克力市场分析报告',
          url: 'https://example.com/premium-chocolate-market',
          summary: '2024年高端巧克力市场预计增长15%，消费者更注重品质和独特性。'
        },
        {
          title: '有机巧克力消费趋势',
          url: 'https://example.com/organic-chocolate-trends',
          summary: '有机巧克力在高收入人群中的接受度提高，价格敏感度降低。'
        }
      ]
    }
  },
  {
    type: 'user',
    content: '对的，我想主打可持续发展的包装设计。',
    timestamp: '09:03 AM'
  },
  {
    type: 'bot',
    content: '很好的方向！我注意到"Sustainable"是一个重要的关键词。从市场数据来看，结合高端和可持续性的产品越来越受欢迎。Godiva和Lindt等品牌的高评分产品都采用了环保包装。',
    timestamp: '09:04 AM',
    dataSources: {
      insights: ['可持续包装', '高端市场', '环保理念'],
      marketTrends: {
        growth: '23%',
        category: '高端可持续包装'
      },
      webSources: [
        {
          title: '可持续包装在巧克力行业的应用',
          url: 'https://example.com/sustainable-packaging-chocolate',
          summary: '可生物降解材料在高端巧克力包装中的应用案例和消费者反馈。'
        },
        {
          title: '环保包装对品牌价值的影响',
          url: 'https://example.com/eco-packaging-brand-value',
          summary: '研究表明，环保包装能提升品牌形象，增加消费者忠诚度。'
        },
        {
          title: '2024巧克力包装设计趋势',
          url: 'https://example.com/chocolate-packaging-trends-2024',
          summary: '可持续性、极简主义和高级感是2024年巧克力包装的主要设计趋势。'
        }
      ]
    }
  },
  {
    type: 'user',
    content: '我想开发一个高端环保的巧克力产品',
    timestamp: '2023-06-20 10:30 AM'
  },
  {
    type: 'bot',
    content: '您的高端环保巧克力产品概念很有潜力。当前市场数据显示，高端巧克力市场正在增长，特别是具有环保特性的产品。我建议关注可持续包装、有机成分和公平贸易认证，这些元素对目标消费者很有吸引力。',
    timestamp: '2023-06-20 10:31 AM',
    dataSources: {
      keywords: ['高端巧克力', '环保包装', '有机', '可持续', '公平贸易', '奢侈品', 'Premium'],
      insights: ['可持续包装增加消费者购买意愿', '有机成分是高端市场关键因素'],
      marketTrends: {
        growth: '15%',
        category: '高端巧克力',
        periodChange: '较上年同期增长5%',
        trendDirection: 'up'
      },
      webSources: [
        {
          title: '有机巧克力市场分析报告2023',
          url: 'https://example.com/organic-chocolate-market-2023',
          summary: '有机巧克力市场预计在未来5年将以年均15%的速度增长，主要驱动因素包括消费者健康意识增强和环保意识提高。'
        },
        {
          title: '可持续包装在食品行业的应用',
          url: 'https://example.com/sustainable-packaging-food-industry',
          summary: '研究表明，78%的高端消费者愿意为环保包装支付溢价，这一趋势在巧克力等小奢侈品类别尤为明显。'
        }
      ],
      skuList: [
        {
          id: 'SKU001',
          name: 'Godiva 72%黑巧克力礼盒',
          image: 'https://example.com/images/godiva-chocolate.jpg',
          price: 268,
          brandName: 'Godiva',
          category: '高端巧克力',
          tags: ['礼盒', '黑巧克力']
        },
        {
          id: 'SKU002',
          name: 'Lindt瑞士莲可持续系列有机巧克力',
          image: 'https://example.com/images/lindt-organic.jpg',
          price: 168,
          brandName: 'Lindt',
          category: '有机巧克力',
          tags: ['有机', '可持续']
        },
        {
          id: 'SKU003',
          name: 'Theo有机公平贸易黑巧克力',
          image: 'https://example.com/images/theo-organic.jpg',
          price: 98,
          brandName: 'Theo',
          category: '有机巧克力',
          tags: ['有机', '公平贸易']
        }
      ],
      userCommentAnalysis: [
        {
          sentiment: 'positive',
          aspect: '包装设计',
          count: 325,
          examples: ['包装很高级，送礼特别有面子', '环保材质的包装让我很有购买欲望'],
          percentage: 87
        },
        {
          sentiment: 'positive',
          aspect: '巧克力品质',
          count: 412,
          examples: ['口感顺滑，回味悠长', '72%可可含量刚刚好，不会太苦也不会太甜'],
          percentage: 92
        },
        {
          sentiment: 'negative',
          aspect: '价格',
          count: 98,
          examples: ['价格偏高，虽然品质不错但性价比不高', '同类产品中价格偏贵'],
          percentage: 65
        }
      ]
    }
  },
  {
    type: 'user',
    content: '我想了解更多关于可持续包装的选项',
    timestamp: '2023-06-20 10:35 AM'
  },
  {
    type: 'bot',
    content: '关于可持续包装，您有多种环保选择。当前巧克力行业流行的可持续包装包括可生物降解的包装纸、可回收纸盒、甘蔗或竹纤维制成的托盘，以及玉米淀粉制成的内包装膜。数据显示，采用这些环保包装的品牌获得了更高的消费者好感度和忠诚度。',
    timestamp: '2023-06-20 10:36 AM',
    dataSources: {
      keywords: ['可持续包装', '生物降解', '环保材料', '回收纸盒', '竹纤维', '消费者好感度'],
      marketTrends: {
        growth: '23%',
        category: '可持续包装',
        trendDirection: 'up'
      },
      webSources: [
        {
          title: '2023年食品包装可持续发展报告',
          url: 'https://example.com/sustainable-food-packaging-2023',
          summary: '可持续包装在食品行业的应用正以每年23%的速度增长，其中巧克力和糖果类别增长最为迅速。'
        }
      ]
    }
  },
  {
    type: 'user',
    content: '能否提供一些高端巧克力的消费者反馈数据？',
    timestamp: '2023-06-20 10:40 AM'
  },
  {
    type: 'bot',
    content: '根据我们的消费者反馈分析，高端巧克力市场的消费者主要关注产品品质、风味独特性和包装设计。特别是在环保意识提升的背景下，可持续包装正成为消费者选择的重要因素。以下是消费者评论的细分分析：',
    timestamp: '2023-06-20 10:42 AM',
    dataSources: {
      userCommentAnalysis: [
        {
          sentiment: 'positive',
          aspect: '味道体验',
          count: 568,
          examples: ['丰富的口味层次，有果香和坚果的后调', '入口即化，口感丝滑'],
          percentage: 94
        },
        {
          sentiment: 'positive',
          aspect: '包装环保性',
          count: 432,
          examples: ['喜欢能完全降解的包装材料', '包装可以再利用，很实用'],
          percentage: 89
        },
        {
          sentiment: 'positive',
          aspect: '礼品价值',
          count: 387,
          examples: ['送礼非常有面子', '收到这样的礼物感觉很被重视'],
          percentage: 91
        },
        {
          sentiment: 'negative',
          aspect: '价格',
          count: 256,
          examples: ['虽然品质好，但价格太高了', '希望能有更多促销活动'],
          percentage: 72
        },
        {
          sentiment: 'negative',
          aspect: '产品保存',
          count: 148,
          examples: ['夏天容易融化', '保质期偏短'],
          percentage: 68
        }
      ]
    }
  },
  {
    type: 'user',
    content: '我想看看当前市场上表现最好的高端巧克力产品',
    timestamp: '2023-06-20 10:45 AM'
  },
  {
    type: 'bot',
    content: '根据我们的市场数据，以下是目前市场上表现最好的高端巧克力产品。这些产品在销量、评价和市场份额方面都表现出色。特别值得注意的是，采用环保包装和强调可持续理念的产品增长最为迅速，这与您的产品方向非常契合。',
    timestamp: '2023-06-20 10:47 AM',
    dataSources: {
      skuList: [
        {
          id: 'TOP001',
          name: 'Godiva臻选系列礼盒',
          image: 'https://example.com/images/godiva-selection.jpg',
          price: 398,
          brandName: 'Godiva',
          category: '高端礼盒',
          tags: ['畅销', '礼品']
        },
        {
          id: 'TOP002',
          name: 'Valrhona大师甄选70%黑巧克力',
          image: 'https://example.com/images/valrhona-master.jpg',
          price: 288,
          brandName: 'Valrhona',
          category: '单一产地',
          tags: ['法国', '顶级']
        },
        {
          id: 'TOP003',
          name: 'Amedei九号限量版巧克力条',
          image: 'https://example.com/images/amedei-nine.jpg',
          price: 258,
          brandName: 'Amedei',
          category: '限量版',
          tags: ['意大利', '稀有']
        },
        {
          id: 'TOP004',
          name: 'Pacari有机公平贸易巧克力礼盒',
          image: 'https://example.com/images/pacari-organic.jpg',
          price: 228,
          brandName: 'Pacari',
          category: '有机系列',
          tags: ['有机', '公平贸易']
        },
        {
          id: 'TOP005',
          name: 'Michel Cluizel可可庄园系列',
          image: 'https://example.com/images/cluizel-plantation.jpg',
          price: 368,
          brandName: 'Michel Cluizel',
          category: '庄园系列',
          tags: ['庄园', '追溯']
        },
        {
          id: 'TOP006',
          name: 'Neuhaus比利时皇家巧克力礼盒',
          image: 'https://example.com/images/neuhaus-royal.jpg',
          price: 458,
          brandName: 'Neuhaus',
          category: '豪华礼盒',
          tags: ['比利时', '皇家']
        }
      ],
      marketTrends: {
        growth: '18%',
        category: '高端巧克力市场',
        periodChange: '环保包装产品增长率高出平均水平12%',
        trendDirection: 'up'
      }
    }
  },
  {
    type: 'user',
    content: '目前市场上有哪些值得关注的巧克力消费趋势？',
    timestamp: '2023-06-20 10:50 AM'
  },
  {
    type: 'bot',
    content: '根据最新的市场研究，高端巧克力市场正在经历几个显著的消费趋势变化。单一产地巧克力、注重可持续发展的品牌以及结合当地文化元素的创新产品正在获得越来越多的关注。以下是我们观察到的主要趋势：',
    timestamp: '2023-06-20 10:52 AM',
    dataSources: {
      keywords: ['单一产地', '产地溯源', '可持续发展', '文化融合', '限量版', '季节限定', '健康意识'],
      marketTrends: {
        growth: '21%',
        category: '单一产地巧克力',
        periodChange: '过去两年增长率加速，从15%提升到21%',
        trendDirection: 'up'
      },
      webSources: [
        {
          title: '2023全球巧克力消费趋势报告',
          url: 'https://example.com/global-chocolate-trends-2023',
          summary: '消费者越来越重视产品的产地、生产方式和社会责任，这推动了单一产地巧克力和可持续发展品牌的崛起。'
        },
        {
          title: '新兴市场巧克力消费行为分析',
          url: 'https://example.com/emerging-markets-chocolate-consumption',
          summary: '亚洲市场对高端巧克力的需求增长迅速，特别是强调健康和可持续发展的产品。'
        },
        {
          title: '健康巧克力：新兴的市场机会',
          url: 'https://example.com/healthy-chocolate-market-opportunities',
          summary: '低糖、高可可含量和添加功能性成分(如超级食品)的巧克力产品市场份额正在扩大。'
        },
        {
          title: '数字化时代的巧克力营销策略',
          url: 'https://example.com/digital-marketing-chocolate-industry',
          summary: '社交媒体和网红营销正成为高端巧克力品牌触达年轻消费群体的关键渠道。'
        }
      ],
      userCommentAnalysis: [
        {
          sentiment: 'positive',
          aspect: '产地溯源',
          count: 423,
          examples: ['喜欢能追溯到具体产地的巧克力', '了解可可豆的来源让我更信任这个品牌'],
          percentage: 88
        },
        {
          sentiment: 'positive',
          aspect: '社会责任',
          count: 387,
          examples: ['支持有环保理念的品牌', '愿意为公平贸易认证多付一点钱'],
          percentage: 85
        }
      ]
    }
  },
  {
    type: 'user',
    content: '可以分享一些成功的高端巧克力包装设计案例吗？',
    timestamp: '2023-06-20 10:55 AM'
  },
  {
    type: 'bot',
    content: '高端巧克力的包装设计对产品成功至关重要，它不仅保护产品，还传达品牌价值和提升消费体验。以下是一些备受赞誉的包装设计案例，它们在美学、功能性和可持续性方面都有出色表现：',
    timestamp: '2023-06-20 10:57 AM',
    dataSources: {
      keywords: ['极简主义', '艺术合作', '可重复使用', '生物降解', '高级印刷', '互动元素', '手工制作'],
      webSources: [
        {
          title: 'Compartés艺术家合作系列包装案例研究',
          url: 'https://example.com/compartes-artist-collaboration',
          summary: 'Compartés与知名艺术家合作的限量版包装，将巧克力包装变成了艺术收藏品，显著提升了产品价值和社交媒体曝光。'
        },
        {
          title: 'Voilà Chocolat的环保革新包装',
          url: 'https://example.com/voila-eco-packaging',
          summary: '使用100%可生物降解材料的创新包装，在保持高端感的同时实现了零废弃，获得了多个包装设计奖项。'
        },
        {
          title: 'Dandelion Chocolate的日式极简包装',
          url: 'https://example.com/dandelion-minimalist-packaging',
          summary: '采用极简设计理念，使用单一原料纸质包装，通过精湛工艺和质感传达品质和纯粹。'
        }
      ],
      skuList: [
        {
          id: 'PACK001',
          name: 'Compartés x 村上隆艺术家合作款',
          image: 'https://example.com/images/compartes-murakami.jpg',
          price: 358,
          brandName: 'Compartés',
          category: '艺术系列',
          tags: ['艺术家合作', '限量版']
        },
        {
          id: 'PACK002',
          name: 'Casa Bosques手工木盒系列',
          image: 'https://example.com/images/casa-bosques.jpg',
          price: 438,
          brandName: 'Casa Bosques',
          category: '木盒系列',
          tags: ['手工木盒', '可重复使用']
        },
        {
          id: 'PACK003',
          name: 'Dandelion单一产地极简系列',
          image: 'https://example.com/images/dandelion-minimal.jpg',
          price: 248,
          brandName: 'Dandelion',
          category: '极简系列',
          tags: ['极简主义', '单一产地']
        },
        {
          id: 'PACK004',
          name: 'Voilà可降解环保礼盒',
          image: 'https://example.com/images/voila-eco.jpg',
          price: 298,
          brandName: 'Voilà Chocolat',
          category: '环保系列',
          tags: ['可降解', '环保先锋']
        }
      ],
      userCommentAnalysis: [
        {
          sentiment: 'positive',
          aspect: '包装设计',
          count: 512,
          examples: ['包装太精美了，舍不得扔掉', '整个拆包过程就像一场仪式'],
          percentage: 94
        },
        {
          sentiment: 'positive',
          aspect: '可重复使用',
          count: 347,
          examples: ['包装盒现在用来存首饰', '设计得很实用，可以做收纳盒'],
          percentage: 89
        },
        {
          sentiment: 'positive',
          aspect: '环保材质',
          count: 283,
          examples: ['喜欢可降解的包装理念', '使用植物纤维材质很有质感'],
          percentage: 86
        }
      ]
    }
  }
];


export const initialStages: Stage[] = [
  {
      id: 1,
      name: '市场洞察阶段',
      description: '分析市场数据，识别产品机会',
      status: 'completed',
      order: 1,
      completionCriteria: '选择一个市场分析方向继续',
      estimatedTimeInMinutes: 45,
      currentConceptId: null,
      concepts: [
          {
              id: 101,
              name: '高端巧克力市场分析',
              description: '专注于高端消费者市场的巧克力需求分析',
              score: 88,
              metrics: {
                  marketPotential: 92,
                  feasibility: 85,
                  innovationLevel: 80,
                  costEfficiency: 75
              },
              tags: ['高端市场', '奢侈品', '增长潜力'],
              dataPoints: [
                  { type: '水晶球', description: '2024Q2高端巧克力市场增长率18%', confidence: 92 }
              ],
              selected: false,
              nextStage: {
                  id: 2,
                  name: '概念开发阶段',
                  description: '基于市场洞察开发产品概念',
                  status: 'current',
                  order: 2,
                  completionCriteria: '选择一个产品概念进行原型开发',
                  estimatedTimeInMinutes: 60,
                  currentConceptId: null,
                  concepts: [
                      {
                          id: 201,
                          name: '手工艺术礼盒系列',
                          description: '高端手工制作巧克力礼盒，采用可持续包装',
                          score: 92,
                          metrics: {
                              marketPotential: 95,
                              feasibility: 85,
                              innovationLevel: 90,
                              costEfficiency: 75
                          },
                          tags: ['礼盒', '手工', '可持续'],
                          dataPoints: [
                              { type: '水晶球', description: '节日礼盒销售同比增长35%', confidence: 90 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 301,
                                      name: '精致木盒包装原型',
                                      description: '使用可持续木材制作的高端礼盒，内部分隔设计',
                                      score: 89,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 80,
                                          innovationLevel: 85,
                                          costEfficiency: 70
                                      },
                                      tags: ['木质包装', '可持续', '分隔设计'],
                                      dataPoints: [
                                          { type: '水晶球', description: '木质包装在高端礼品市场接受度高', confidence: 85 }
                                      ],
                                      selected: false,
                                      nextStage: {
                                          id: 4,
                                          name: '实施阶段',
                                          description: '将设计转化为可实际生产的方案',
                                          status: 'pending',
                                          order: 4,
                                          completionCriteria: '确定最终生产方案并准备投产',
                                          estimatedTimeInMinutes: 180,
                                          currentConceptId: null,
                                          concepts: [
                                              {
                                                  id: 401,
                                                  name: '小批量手工生产方案',
                                                  description: '与本地木匠合作，小批量手工制作高端礼盒',
                                                  score: 88,
                                                  metrics: {
                                                      marketPotential: 85,
                                                      feasibility: 90,
                                                      innovationLevel: 80,
                                                      costEfficiency: 75
                                                  },
                                                  tags: ['手工制作', '本地合作', '高端定制'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '手工制作可提高产品溢价45%', confidence: 90 },
                                                      { type: '外网', description: '小红书上手工制作礼盒相关内容增长150%', confidence: 85 },
                                                      { type: 'PIM', description: '现有同类手工产品售罄率达92%', confidence: 88 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              },
                                              {
                                                  id: 402,
                                                  name: '模块化自动化生产方案',
                                                  description: '设计标准化模块，利用自动化设备批量生产',
                                                  score: 85,
                                                  metrics: {
                                                      marketPotential: 80,
                                                      feasibility: 95,
                                                      innovationLevel: 75,
                                                      costEfficiency: 90
                                                  },
                                                  tags: ['模块化', '自动化', '规模化'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '自动化生产可降低单位成本32%', confidence: 92 },
                                                      { type: '外网', description: '知乎讨论自动化生产提高一致性的案例增加180%', confidence: 88 },
                                                      { type: 'PIM', description: '同类自动化生产产品利润率提升25%', confidence: 90 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              },
                                              {
                                                  id: 403,
                                                  name: '混合生产定制方案',
                                                  description: '核心部分自动化生产，细节部分手工处理，兼顾规模和品质',
                                                  score: 92,
                                                  metrics: {
                                                      marketPotential: 90,
                                                      feasibility: 85,
                                                      innovationLevel: 85,
                                                      costEfficiency: 85
                                                  },
                                                  tags: ['混合生产', '平衡方案', '定制化'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '混合生产模式满意度比单一模式高24%', confidence: 88 },
                                                      { type: '外网', description: '微博上混合生产方式的讨论热度上升210%', confidence: 86 },
                                                      { type: 'PIM', description: '混合生产方式的产品复购率高出纯手工产品15%', confidence: 90 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              }
                                          ]
                                      }
                                  },
                                  {
                                      id: 302,
                                      name: '可生物降解材料原型',
                                      description: '采用最新可生物降解材料制作的环保包装，具有奢华质感',
                                      score: 92,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 75,
                                          innovationLevel: 95,
                                          costEfficiency: 65
                                      },
                                      tags: ['可降解', '环保', '创新材料'],
                                      dataPoints: [
                                          { type: '水晶球', description: '生物可降解包装符合消费者环保预期', confidence: 92 }
                                      ],
                                      selected: false,
                                      nextStage: {
                                          id: 4,
                                          name: '实施阶段',
                                          description: '将设计转化为可实际生产的方案',
                                          status: 'pending',
                                          order: 4,
                                          completionCriteria: '确定最终生产方案并准备投产',
                                          estimatedTimeInMinutes: 180,
                                          currentConceptId: null,
                                          concepts: [
                                              {
                                                  id: 404,
                                                  name: '专业材料供应链方案',
                                                  description: '与专业环保材料供应商建立合作，确保材料品质和供应稳定性',
                                                  score: 90,
                                                  metrics: {
                                                      marketPotential: 92,
                                                      feasibility: 85,
                                                      innovationLevel: 90,
                                                      costEfficiency: 75
                                                  },
                                                  tags: ['专业供应商', '稳定供应', '品质保证'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '专业供应链可降低材料不合格率20%', confidence: 88 },
                                                      { type: '外网', description: 'B站关于环保材料创新应用视频播放量增长300%', confidence: 95 },
                                                      { type: 'PIM', description: '环保材料产品正面评价率高于传统材料35%', confidence: 90 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              },
                                              {
                                                  id: 405,
                                                  name: '自研材料工艺方案',
                                                  description: '投资研发部门，开发专有材料配方和工艺，创造独特竞争优势',
                                                  score: 95,
                                                  metrics: {
                                                      marketPotential: 95,
                                                      feasibility: 70,
                                                      innovationLevel: 98,
                                                      costEfficiency: 60
                                                  },
                                                  tags: ['自主研发', '专利保护', '高壁垒'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '专利材料可提升品牌价值和溢价能力', confidence: 92 },
                                                      { type: '外网', description: '小红书上独特包装材质相关内容互动率提高250%', confidence: 88 },
                                                      { type: 'PIM', description: '自研材料产品平均售价高出同类产品40%', confidence: 90 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              },
                                              {
                                                  id: 406,
                                                  name: '合作研发实施方案',
                                                  description: '与高校研究机构合作，共同开发和应用新型环保材料',
                                                  score: 88,
                                                  metrics: {
                                                      marketPotential: 85,
                                                      feasibility: 80,
                                                      innovationLevel: 92,
                                                      costEfficiency: 78
                                                  },
                                                  tags: ['产学研合作', '资源整合', '持续创新'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '合作研发可降低研发成本30%并加快上市时间', confidence: 85 },
                                                      { type: '外网', description: '知乎上关于产学研合作案例的讨论增长180%', confidence: 82 },
                                                      { type: 'PIM', description: '产学研背景的产品品牌信任度提升25%', confidence: 88 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              }
                                          ]
                                      }
                                  },
                                  {
                                      id: 303,
                                      name: '复合材料混合原型',
                                      description: '结合多种材料的优点，打造既环保又奢华的包装方案',
                                      score: 87,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 80,
                                          innovationLevel: 90,
                                          costEfficiency: 75
                                      },
                                      tags: ['混合材料', '创新', '平衡方案'],
                                      dataPoints: [
                                          { type: '水晶球', description: '混合材料方案可兼顾多方需求', confidence: 88 }
                                      ],
                                      selected: false,
                                      nextStage: {
                                          id: 4,
                                          name: '实施阶段',
                                          description: '将设计转化为可实际生产的方案',
                                          status: 'pending',
                                          order: 4,
                                          completionCriteria: '确定最终生产方案并准备投产',
                                          estimatedTimeInMinutes: 180,
                                          currentConceptId: null,
                                          concepts: [
                                              {
                                                  id: 407,
                                                  name: '多供应商整合方案',
                                                  description: '整合多家材料供应商的优质资源，确保各类材料的最佳品质',
                                                  score: 86,
                                                  metrics: {
                                                      marketPotential: 85,
                                                      feasibility: 88,
                                                      innovationLevel: 82,
                                                      costEfficiency: 80
                                                  },
                                                  tags: ['供应商整合', '资源优化', '品质控制'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '多供应商策略可降低供应风险40%', confidence: 85 },
                                                      { type: '外网', description: '抖音上复合材料包装创意视频点赞量增长220%', confidence: 88 },
                                                      { type: 'PIM', description: '混合材料产品客户满意度高于单一材料20%', confidence: 87 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              },
                                              {
                                                  id: 408,
                                                  name: '模块化生产方案',
                                                  description: '将不同材料部分模块化设计和生产，最后统一组装，提高生产效率',
                                                  score: 90,
                                                  metrics: {
                                                      marketPotential: 88,
                                                      feasibility: 92,
                                                      innovationLevel: 85,
                                                      costEfficiency: 88
                                                  },
                                                  tags: ['模块化', '标准化', '高效生产'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '模块化生产可提高生产效率35%', confidence: 90 },
                                                      { type: '外网', description: '微博上模块化设计理念相关讨论增加195%', confidence: 85 },
                                                      { type: 'PIM', description: '模块化产品缺陷率低于传统工艺30%', confidence: 92 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              },
                                              {
                                                  id: 409,
                                                  name: '柔性生产线方案',
                                                  description: '建立柔性生产线，适应不同材料组合的灵活生产需求',
                                                  score: 89,
                                                  metrics: {
                                                      marketPotential: 87,
                                                      feasibility: 83,
                                                      innovationLevel: 90,
                                                      costEfficiency: 82
                                                  },
                                                  tags: ['柔性生产', '快速调整', '个性化定制'],
                                                  dataPoints: [
                                                      { type: '水晶球', description: '柔性生产线可支持30%以上的产品个性化需求', confidence: 87 },
                                                      { type: '外网', description: '知乎上柔性生产线相关专业讨论增长160%', confidence: 85 },
                                                      { type: 'PIM', description: '柔性生产线产品对市场变化响应速度提升40%', confidence: 89 }
                                                  ],
                                                  selected: false,
                                                  nextStage: null
                                              }
                                          ]
                                      }
                                  }
                              ]
                          }
                      },
                      {
                          id: 202,
                          name: '单一产地系列',
                          description: '展示不同产地特色风味的高端巧克力系列',
                          score: 85,
                          metrics: {
                              marketPotential: 85,
                              feasibility: 90,
                              innovationLevel: 75,
                              costEfficiency: 80
                          },
                          tags: ['单一产地', '风味特色', '追溯性'],
                          dataPoints: [
                              { type: '水晶球', description: '单一产地巧克力价格溢价可达40%', confidence: 88 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 304,
                                      name: '透明视窗包装原型',
                                      description: '透明部分展示巧克力外观，配以产地地图和故事',
                                      score: 84,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 90,
                                          innovationLevel: 70,
                                          costEfficiency: 85
                                      },
                                      tags: ['透明包装', '视觉吸引', '产地故事'],
                                      dataPoints: [
                                          { type: '水晶球', description: '透明包装可提高产品货架吸引力', confidence: 85 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 305,
                                      name: '地图主题包装原型',
                                      description: '包装设计融入产地地图元素，直观展示产地特色',
                                      score: 86,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 90,
                                          innovationLevel: 80,
                                          costEfficiency: 80
                                      },
                                      tags: ['地图设计', '直观展示', '教育意义'],
                                      dataPoints: [
                                          { type: '水晶球', description: '地图元素能强化产地感知', confidence: 86 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 306,
                                      name: '产地主题书型盒原型',
                                      description: '仿古书籍设计，每一页对应一个产地的巧克力和故事',
                                      score: 90,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 80,
                                          innovationLevel: 95,
                                          costEfficiency: 70
                                      },
                                      tags: ['书型包装', '收藏价值', '沉浸式体验'],
                                      dataPoints: [
                                          { type: '水晶球', description: '创新包装形式提升产品溢价空间', confidence: 92 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      },
                      {
                          id: 203,
                          name: '季节限定系列',
                          description: '每季度推出限定口味和设计的高端巧克力系列',
                          score: 90,
                          metrics: {
                              marketPotential: 95,
                              feasibility: 85,
                              innovationLevel: 90,
                              costEfficiency: 75
                          },
                          tags: ['季节限定', '收藏性', '稀缺性'],
                          dataPoints: [
                              { type: '水晶球', description: '限定系列产品平均售价高出常规产品35%', confidence: 90 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 307,
                                      name: '节气主题包装原型',
                                      description: '基于中国传统二十四节气设计的系列包装',
                                      score: 88,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 85,
                                          innovationLevel: 85,
                                          costEfficiency: 80
                                      },
                                      tags: ['节气', '传统文化', '系列设计'],
                                      dataPoints: [
                                          { type: '水晶球', description: '传统节气元素在年轻消费者中受欢迎', confidence: 85 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 308,
                                      name: '艺术家合作包装原型',
                                      description: '每季度与不同艺术家合作设计限定版包装',
                                      score: 94,
                                      metrics: {
                                          marketPotential: 95,
                                          feasibility: 80,
                                          innovationLevel: 95,
                                          costEfficiency: 70
                                      },
                                      tags: ['艺术家合作', '艺术收藏', '跨界'],
                                      dataPoints: [
                                          { type: '水晶球', description: '艺术家合作产品具有收藏价值', confidence: 95 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 309,
                                      name: '季节主题金属盒原型',
                                      description: '使用高端金属材质，打造季节主题限定收藏包装',
                                      score: 91,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 85,
                                          innovationLevel: 85,
                                          costEfficiency: 75
                                      },
                                      tags: ['金属包装', '高端质感', '收藏价值'],
                                      dataPoints: [
                                          { type: '水晶球', description: '金属盒包装增加产品保存期和复用价值', confidence: 90 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      }
                  ]
              }
          },
          {
              id: 102,
              name: '可持续环保趋势分析',
              description: '研究环保和可持续发展在食品行业的应用趋势',
              score: 83,
              metrics: {
                  marketPotential: 90,
                  feasibility: 80,
                  innovationLevel: 85,
                  costEfficiency: 70
              },
              tags: ['可持续', '环保', '消费趋势'],
              dataPoints: [
                  { type: '水晶球', description: '环保包装产品消费者支付意愿提高20%', confidence: 85 }
              ],
              selected: false,
              nextStage: {
                  id: 2,
                  name: '概念开发阶段',
                  description: '基于市场洞察开发产品概念',
                  status: 'current',
                  order: 2,
                  completionCriteria: '选择一个产品概念进行原型开发',
                  estimatedTimeInMinutes: 60,
                  currentConceptId: null,
                  concepts: [
                      {
                          id: 204,
                          name: '零废弃包装概念',
                          description: '完全可堆肥或可回收的零废弃巧克力包装设计',
                          score: 89,
                          metrics: {
                              marketPotential: 90,
                              feasibility: 75,
                              innovationLevel: 95,
                              costEfficiency: 70
                          },
                          tags: ['零废弃', '可堆肥', '环保先锋'],
                          dataPoints: [
                              { type: '水晶球', description: '零废弃概念对环保消费者吸引力强', confidence: 92 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 310,
                                      name: '可降解纸质包装原型',
                                      description: '使用特殊处理的可完全降解纸质材料制作的包装',
                                      score: 87,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 90,
                                          innovationLevel: 80,
                                          costEfficiency: 85
                                      },
                                      tags: ['纸质包装', '可降解', '成本效益'],
                                      dataPoints: [
                                          { type: '水晶球', description: '纸质包装具有最高的消费者接受度', confidence: 92 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 311,
                                      name: '植物纤维模塑包装原型',
                                      description: '由植物纤维模塑成型的创新环保包装',
                                      score: 91,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 85,
                                          innovationLevel: 95,
                                          costEfficiency: 75
                                      },
                                      tags: ['植物纤维', '模塑技术', '全降解'],
                                      dataPoints: [
                                          { type: '水晶球', description: '植物纤维包装在环保认证中评分最高', confidence: 94 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 312,
                                      name: '可食用包装原型',
                                      description: '内层采用可食用材料制作，外层使用最少的保护材料',
                                      score: 88,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 70,
                                          innovationLevel: 98,
                                          costEfficiency: 65
                                      },
                                      tags: ['可食用', '零浪费', '创新技术'],
                                      dataPoints: [
                                          { type: '水晶球', description: '可食用包装引发消费者高度关注和讨论', confidence: 90 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      },
                      {
                          id: 205,
                          name: '多功能再利用包装',
                          description: '包装设计为可重复使用的收纳盒或装饰品',
                          score: 92,
                          metrics: {
                              marketPotential: 95,
                              feasibility: 85,
                              innovationLevel: 90,
                              costEfficiency: 75
                          },
                          tags: ['再利用', '功能性', '增值设计'],
                          dataPoints: [
                              { type: '水晶球', description: '可重复使用包装提高品牌记忆度', confidence: 90 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 313,
                                      name: '多功能首饰盒原型',
                                      description: '巧克力包装可转化为精美首饰收纳盒',
                                      score: 93,
                                      metrics: {
                                          marketPotential: 95,
                                          feasibility: 85,
                                          innovationLevel: 90,
                                          costEfficiency: 80
                                      },
                                      tags: ['首饰盒', '二次使用', '增值'],
                                      dataPoints: [
                                          { type: '水晶球', description: '多功能包装增加消费者保留意愿', confidence: 95 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 314,
                                      name: '盆栽种植盒原型',
                                      description: '包装可转化为小型盆栽种植盒，附带种子和土壤',
                                      score: 90,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 80,
                                          innovationLevel: 95,
                                          costEfficiency: 75
                                      },
                                      tags: ['种植盒', '生态友好', '互动体验'],
                                      dataPoints: [
                                          { type: '水晶球', description: '种植体验增加产品互动性和分享率', confidence: 88 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 315,
                                      name: '桌面收纳原型',
                                      description: '转化为办公或家用的多功能桌面收纳盒',
                                      score: 87,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 90,
                                          innovationLevel: 80,
                                          costEfficiency: 85
                                      },
                                      tags: ['办公收纳', '实用主义', '日常使用'],
                                      dataPoints: [
                                          { type: '水晶球', description: '实用性收纳功能提高消费频率', confidence: 89 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      },
                      {
                          id: 206,
                          name: '环保材质包装概念',
                          description: '探索新型环保材料在高端包装中的应用',
                          score: 86,
                          metrics: {
                              marketPotential: 90,
                              feasibility: 80,
                              innovationLevel: 90,
                              costEfficiency: 75
                          },
                          tags: ['新材料', '环保科技', '高端感'],
                          dataPoints: [
                              { type: '水晶球', description: '创新环保材料能提升品牌科技形象', confidence: 88 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 316,
                                      name: '菌丝体包装原型',
                                      description: '使用真菌菌丝体生长形成的全生物降解包装',
                                      score: 92,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 75,
                                          innovationLevel: 98,
                                          costEfficiency: 70
                                      },
                                      tags: ['菌丝体', '生物技术', '全降解'],
                                      dataPoints: [
                                          { type: '水晶球', description: '菌丝体材料是包装领域最前沿的生物技术', confidence: 92 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 317,
                                      name: '海藻基材料原型',
                                      description: '利用海藻提取物制作的可食用或快速降解包装',
                                      score: 89,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 80,
                                          innovationLevel: 95,
                                          costEfficiency: 75
                                      },
                                      tags: ['海藻材料', '海洋保护', '创新'],
                                      dataPoints: [
                                          { type: '水晶球', description: '海藻基材料能在家庭环境下完全降解', confidence: 90 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 318,
                                      name: '咖啡渣复合材料原型',
                                      description: '利用回收咖啡渣与可降解树脂结合的创新材料',
                                      score: 86,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 85,
                                          innovationLevel: 90,
                                          costEfficiency: 80
                                      },
                                      tags: ['咖啡渣', '循环经济', '废物利用'],
                                      dataPoints: [
                                          { type: '水晶球', description: '咖啡渣材料符合循环经济理念，故事性强', confidence: 88 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      }
                  ]
              }
          },
          {
              id: 103,
              name: '定制化巧克力市场分析',
              description: '研究个性化定制在高端食品市场的潜力',
              score: 79,
              metrics: {
                  marketPotential: 85,
                  feasibility: 70,
                  innovationLevel: 90,
                  costEfficiency: 65
              },
              tags: ['定制化', '个性化', '高端市场'],
              dataPoints: [
                  { type: '水晶球', description: '定制产品溢价空间可达普通产品的2-3倍', confidence: 85 }
              ],
              selected: false,
              nextStage: {
                  id: 2,
                  name: '概念开发阶段',
                  description: '基于市场洞察开发产品概念',
                  status: 'current',
                  order: 2,
                  completionCriteria: '选择一个产品概念进行原型开发',
                  estimatedTimeInMinutes: 60,
                  currentConceptId: null,
                  concepts: [
                      {
                          id: 207,
                          name: '个人定制礼盒概念',
                          description: '根据客户喜好定制巧克力口味和包装的高端礼盒',
                          score: 90,
                          metrics: {
                              marketPotential: 95,
                              feasibility: 75,
                              innovationLevel: 85,
                              costEfficiency: 70
                          },
                          tags: ['个人定制', '礼品市场', '定制体验'],
                          dataPoints: [
                              { type: '水晶球', description: '个人定制礼盒在重要节日销量高', confidence: 92 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 319,
                                      name: '在线定制平台原型',
                                      description: '开发线上平台让用户自主设计巧克力礼盒',
                                      score: 91,
                                      metrics: {
                                          marketPotential: 95,
                                          feasibility: 80,
                                          innovationLevel: 85,
                                          costEfficiency: 75
                                      },
                                      tags: ['在线平台', '用户参与', '数字体验'],
                                      dataPoints: [
                                          { type: '水晶球', description: '线上平台可提高客户参与度和满意度', confidence: 90 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 320,
                                      name: '专属顾问服务原型',
                                      description: '为高端客户提供一对一顾问服务，定制专属礼盒',
                                      score: 88,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 85,
                                          innovationLevel: 80,
                                          costEfficiency: 70
                                      },
                                      tags: ['顾问服务', '高端体验', '一对一'],
                                      dataPoints: [
                                          { type: '水晶球', description: '专属顾问服务能提高高净值客户忠诚度', confidence: 93 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 321,
                                      name: '线下定制工作室原型',
                                      description: '设立线下体验店，客户现场参与巧克力定制过程',
                                      score: 93,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 75,
                                          innovationLevel: 85,
                                          costEfficiency: 65
                                      },
                                      tags: ['线下体验', '互动参与', '沉浸式'],
                                      dataPoints: [
                                          { type: '水晶球', description: '线下参与式体验可创造高转化率', confidence: 94 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      },
                      {
                          id: 208,
                          name: '企业定制礼品概念',
                          description: '为企业客户提供带有企业标识的高端定制巧克力礼品',
                          score: 85,
                          metrics: {
                              marketPotential: 90,
                              feasibility: 85,
                              innovationLevel: 75,
                              costEfficiency: 80
                          },
                          tags: ['企业礼品', 'B2B市场', '品牌定制'],
                          dataPoints: [
                              { type: '水晶球', description: '企业礼品市场规模每年增长15%', confidence: 88 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 322,
                                      name: '企业标识巧克力原型',
                                      description: '将企业标志直接印制在巧克力表面的定制方案',
                                      score: 84,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 90,
                                          innovationLevel: 70,
                                          costEfficiency: 85
                                      },
                                      tags: ['标志印制', '直观展示', '定制简便'],
                                      dataPoints: [
                                          { type: '水晶球', description: '直接印制方案生产效率高，适合大批量', confidence: 90 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 323,
                                      name: '企业文化主题原型',
                                      description: '根据企业文化和价值观定制的主题巧克力礼盒',
                                      score: 88,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 85,
                                          innovationLevel: 85,
                                          costEfficiency: 80
                                      },
                                      tags: ['文化主题', '价值观', '深度定制'],
                                      dataPoints: [
                                          { type: '水晶球', description: '文化主题定制能提升企业认同感', confidence: 87 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 324,
                                      name: '企业定制订阅服务原型',
                                      description: '为企业客户提供长期订阅的定制巧克力服务',
                                      score: 86,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 80,
                                          innovationLevel: 80,
                                          costEfficiency: 90
                                      },
                                      tags: ['订阅服务', '长期合作', '稳定收入'],
                                      dataPoints: [
                                          { type: '水晶球', description: '订阅模式可提供稳定收入和客户粘性', confidence: 89 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      },
                      {
                          id: 209,
                          name: '纪念日定制概念',
                          description: '为特殊纪念日打造的定制巧克力与包装解决方案',
                          score: 87,
                          metrics: {
                              marketPotential: 90,
                              feasibility: 80,
                              innovationLevel: 85,
                              costEfficiency: 75
                          },
                          tags: ['纪念日', '情感营销', '特殊时刻'],
                          dataPoints: [
                              { type: '水晶球', description: '情感关联产品的客户忠诚度高', confidence: 91 }
                          ],
                          selected: false,
                          nextStage: {
                              id: 3,
                              name: '原型开发阶段',
                              description: '开发产品原型并进行初步测试',
                              status: 'pending',
                              order: 3,
                              completionCriteria: '完成原型并准备进入测试阶段',
                              estimatedTimeInMinutes: 120,
                              currentConceptId: null,
                              concepts: [
                                  {
                                      id: 325,
                                      name: '纪念日倒计时原型',
                                      description: '包含倒计时机制的创意纪念日巧克力礼盒',
                                      score: 89,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 80,
                                          innovationLevel: 90,
                                          costEfficiency: 75
                                      },
                                      tags: ['倒计时', '仪式感', '惊喜体验'],
                                      dataPoints: [
                                          { type: '水晶球', description: '倒计时设计增加产品期待感和仪式感', confidence: 88 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 326,
                                      name: '时间胶囊原型',
                                      description: '融入时间胶囊概念的纪念日巧克力礼盒',
                                      score: 92,
                                      metrics: {
                                          marketPotential: 90,
                                          feasibility: 75,
                                          innovationLevel: 95,
                                          costEfficiency: 70
                                      },
                                      tags: ['时间胶囊', '珍藏', '情感链接'],
                                      dataPoints: [
                                          { type: '水晶球', description: '时间胶囊概念激发消费者保存和分享行为', confidence: 93 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  },
                                  {
                                      id: 327,
                                      name: '定制故事卡片原型',
                                      description: '包含定制故事卡片的纪念日巧克力礼盒',
                                      score: 86,
                                      metrics: {
                                          marketPotential: 85,
                                          feasibility: 90,
                                          innovationLevel: 80,
                                          costEfficiency: 85
                                      },
                                      tags: ['故事卡片', '个性化内容', '情感表达'],
                                      dataPoints: [
                                          { type: '水晶球', description: '个性化内容能强化情感连接', confidence: 90 }
                                      ],
                                      selected: false,
                                      nextStage: null
                                  }
                              ]
                          }
                      }
                  ]
              }
          }
      ]
  }
];

// 初始化用户需求和喜好
export const initialUserRequirements: UserRequirement[] = [
  {
    id: 1,
    content: "我想开发一种高端环保的巧克力产品线，针对年轻的高收入消费者",
    confidence: 95,
    timestamp: "2023-06-20 10:30 AM",
    edited: false
  },
  {
    id: 2,
    content: "产品应该采用可持续包装，强调有机成分和公平贸易",
    confidence: 85,
    timestamp: "2023-06-20 10:32 AM",
    edited: true
  },
  {
    id: 3,
    content: "希望能够通过社交媒体和网红推广，主要定位25-40岁的都市白领",
    confidence: 90,
    timestamp: "2023-06-20 10:35 AM",
    edited: false
  }
];
