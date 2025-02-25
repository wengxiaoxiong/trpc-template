import { Stage, Message } from '../types';

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
  }
];

// 简化的初始阶段数据
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
                  // 省略更深层次的概念数据以简化示例
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
        nextStage: null
      }
    ]
  }
]; 