import DataSources from '../components/DataSources';
import { Stage, Message, UserRequirement } from '../types';

// 初始化聊天消息
export const initialMessages: Message[] = [
  {
    type: 'bot',
    content: '欢迎来到产品创新工作台，让我们从了解您的目标市场开始。您想开发什么类型的产品？',
    timestamp: '09:00 AM'
  },
  {
    type: 'user',
    content: '我想开发一个巧克力产品系列。',
    timestamp: '09:01 AM'
  },
  {
    type: 'bot',
    content: '好的，让我们从了解您的目标市场开始。您想开发什么类型的产品？',
    timestamp: '09:00 AM'
  },
  {
    type: 'user',
    content: '我想要做一款受小朋友和家长欢迎的巧克力产品，有什么灵感？',
    timestamp: '09:01 AM'
  },
  {
    type: 'bot',
    thoughtProcess:[" 好，我现在需要帮用户设计一款受小朋友和家长欢迎的巧克力产品。用户之前已经提供了一些数据，包括家长和小朋友的核心需求，以及社媒的洞察和巧克力品类的关键词分析。根据用户最近的反馈，他们似乎对之前的建议不太满意，所以需要更深入地结合数据来调整灵感。",
        "首先，家长的核心需求是健康、营养和安全。从用户提供的小红书评论来看，家长非常关注配料表的干净程度，比如提到“营养丰富”、“添加剂太多”和“安全健康”。因此，产品必须强调天然成分、低糖或无添加，并且可能添加额外的营养元素，如维生素或钙。",
        "小朋友的需求集中在互动性、多模态体验、游戏化机制和搭建反馈。用户提到的关键词如“哪吒”、“我的世界”、“乐高”表明孩子们喜欢动手制作、具有创造性和游戏化的元素。因此，产品需要具备互动性和趣味性，比如DIY套装、拼图或故事情节。",
        `社媒数据方面，TikTok上的热门话题如“甜品治愈一切”、“少女心爆棚”和“萌娃内容”提示产品需要有高颜值和分享价值，适合拍照和短视频传播。同时，巧克力品类关键词如“酥脆”、“丝滑”、“有机”和“礼物”说明口感和品质也很重要。`,
        "接下来，分析用户之前提供的三个灵感：魔法厨房、故事盲盒和可持续星球。这些概念都结合了互动和教育元素，但可能需要更紧密地结合家长的健康关注点。例如，在魔法厨房中强调低糖和益生菌，或者在可持续星球中使用有机材料，这样既能满足家长的需求，又能吸引孩子。",
        `用户之前提到需要平衡家长和孩子的需求，所以新的灵感应该在这两方面找到结合点。例如，设计一个DIY套装，不仅有趣，还能教育孩子营养知识，同时确保所有材料都是健康安全的。此外，包装设计要方便保存，避免受潮，解决用户提到的“容易受潮”问题。`,
        `考虑到社媒传播，产品需要具备视觉吸引力，比如可爱的造型或可定制的装饰，鼓励用户在平台上分享他们的创作。同时，价格策略上要兼顾性价比，因为用户数据中提到“划算”和“平价”是高频词，可能推出不同价位的套装以适应市场需求。`,
        `最后，参考同品类SKU中表现好的产品，如健达巧克力的儿童零食定位和士力架的能量补充，可以借鉴他们的成功元素，比如便携包装或营养强化，但加入更多互动元素。例如，推出带有拼图或建造元素的巧克力，既好吃又好玩，同时强调健康成分。`,
        `总结，新的产品灵感需要整合健康营养、互动趣味、社媒友好和价格合理，确保同时满足家长和孩子的需求，并在市场中脱颖而出。`,
    ],
    content: `
### **基于数据洞察的巧克力产品概念设计灵感**  
结合家长核心需求（健康/营养/安全）、儿童核心需求（互动/多模态/游戏化）及社媒关键词趋势，提出以下3个差异化概念：

---

#### **灵感1：营养建筑师·巧克力积木工坊**  
**核心卖点**：**可拼搭的巧克力积木 + 营养可视化**  
- **产品设计**：  
  - **模块化巧克力块**：  
    - 将巧克力制成乐高式积木造型，每块对应不同营养属性（如黄色=维生素D强化牛奶巧、绿色=菠菜粉混合抹茶巧）。  
    - 积木接口采用可食用糯米纸连接，儿童可自由搭建城堡/动物等造型。  
  - **营养任务卡**：  
    - 家长通过任务卡引导孩子搭建“营养金字塔”（如“用3块黄色积木补充钙质”），融入饮食教育。  
- **健康背书**：  
  - 使用菊粉替代50%蔗糖，添加益生元；积木表面印刷可食用级营养成分图标（如钙、铁符号）。  
- **社媒传播点**：  
  - TikTok挑战赛：#巧克力建筑师大赛，鼓励分享创意造型+营养知识讲解视频。  
  - 小红书种草：突出“玩着学营养”，家长晒娃作品时自动传播健康属性。  

---

#### **灵感2：妖怪巧克力盲盒·哪吒降魔记**  
**核心卖点**：**国潮IP联动 + 多感官游戏化体验**  
- **产品设计**：  
  - **盲盒式包装**：  
    - 每盒含哪吒/龙王等神话角色造型巧克力（如哪吒=草莓味红甲造型、龙王=海盐蓝纹巧克力）。  
    - 附赠“降魔法宝”配件：可食用金箍棒糖棍、乾坤圈造型脆米饼。  
  - **AR互动机制**：  
    - 扫描巧克力包装触发AR小游戏（如用手机“击败龙王拯救陈塘关”），通关解锁电子版营养知识勋章。  
- **健康策略**：  
  - 使用天然色素（甜菜根粉/蝶豆花粉）上色，避免人工添加剂争议。  
- **社媒传播点**：  
  - 结合TikTok热门国潮话题#哪吒重生，发起“哪吒巧克力变装挑战”。  
  - 家长端传播关键词：“文化自信零食”“吃出神话英雄”。  

---

#### **灵感3：巧克力科学胶囊·我的世界实验室**  
**核心卖点**：**STEM教育融合 + 可控甜度设计**  
- **产品设计**：  
  - **实验套装**：  
    - 基础包：可可脂胶囊、冻干果粉试管、天然甜味剂颗粒（赤藓糖醇/罗汉果糖）。  
    - 工具包：硅胶模具（化学仪器造型）、滴管、温度感应勺（超过40℃变色防烫伤）。  
  - **玩法设计**：  
    - 孩子通过调配不同比例原料制作“专属巧克力”，观察融化/凝固过程（如“为什么可可脂35℃会融化？”）。  
- **家长端价值**：  
  - 甜度自主控制：家长可决定添加0%-100%甜味剂，解决“太甜”差评痛点。  
  - 成分透明化：每颗胶囊标注可可含量、膳食纤维比例。  
- **社媒传播点**：  
  - 教育类KOL合作：推出“食物科学亲子课”系列短视频，植入产品实验场景。  
  - 小红书关键词：#戒糖妈妈首选 #玩出来的理科思维  

---

### **数据验证与落地策略**  
1. **健康需求落地**：  
   - 家长评论高频词“营养”“添加剂太多”→使用清洁标签（无防腐剂/人工香精）+添加功能性成分（益生元/钙）。  
   - 差评痛点“太甜”→提供甜度自主调控方案（如甜味剂分装包）。  

2. **儿童兴趣匹配**：  
   - 儿童偏好“乐高/我的世界”→积木化造型+沙盒式自由创作。  
   - 社媒声量词“酥脆”“好看”→设计多层次口感（脆米夹心）+高饱和度色彩。  

3. **价格与渠道**：  
   - 基础款定价39元（1次实验量），满足“平价”需求；  
   - 高端礼盒129元（含AR卡片+IP周边），覆盖节日送礼场景。  

**差异化总结**：通过**游戏化营养教育、国潮IP沉浸体验、可控健康参数**，同时满足家长端“安全透明”与儿童端“好玩创造”需求，精准匹配小红书/TikTok“知识型萌娃内容”传播趋势。
`,
    timestamp: '09:02 AM',
    dataSources: {
        "keywords": ["口味绝佳", "包装可爱", "营养丰富", "造型有趣", "添加剂", "价格实惠", "易用性", "创意设计"],
        
        "insights": ["卡通包装增加儿童产品吸引力", "造型设计影响儿童食用体验", "父母关注配料表的清洁度", "易开启包装是实用亮点"],
        
        "marketTrends": {
          "growth": "18%",
          "category": "儿童食品市场",
          "periodChange": "营养价值导向产品增长率高出平均水平9%",
          "trendDirection": "up"
        },
        
        "webSources": [
          {
            "title": "2024年儿童食品消费趋势分析",
            "url": "https://example.com/children-food-trends-2024",
            "summary": "调查显示，85%的父母在选购儿童食品时会优先考虑营养成分，其次是包装的趣味性和便利性。"
          },
          {
            "title": "卡通包装如何影响儿童食品选择",
            "url": "https://example.com/cartoon-packaging-influence",
            "summary": "研究表明，具有卡通形象的食品包装能提高儿童对产品的接受度，增加产品识别度和记忆点。"
          }
        ],
        
        "userCommentAnalysis": [
          {
            "sentiment": "positive",
            "aspect": "口味体验",
            "count": 486,
            "examples": ["打开包装奶香味就扑鼻而来，吃起来酥酥脆脆", "酸酸甜甜的很开胃"],
            "percentage": 92
          },
          {
            "sentiment": "positive",
            "aspect": "包装设计",
            "count": 412,
            "examples": ["包装上印着各种可爱的卡通形象", "设计了易撕口，宝宝自己就能轻松打开"],
            "percentage": 89
          },
          {
            "sentiment": "positive", 
            "aspect": "互动性",
            "count": 325,
            "examples": ["做成了各种小动物的造型，宝宝吃的时候还能认识不同动物", "做成了拼图的形状，宝宝吃之前还能先玩一会拼图"],
            "percentage": 87
          },
          {
            "sentiment": "negative",
            "aspect": "添加成分",
            "count": 267,
            "examples": ["看了配料表，添加剂有点多", "味道是不错，酸酸甜甜的，就是太甜了"],
            "percentage": 78
          },
          {
            "sentiment": "negative",
            "aspect": "口感适配性",
            "count": 198,
            "examples": ["口感有点太Q弹了，对于我家年纪小的宝宝来说，不太好咀嚼", "发现不太好消化，宝宝吃完后有点积食"],
            "percentage": 72
          }
        ]
      }
  },

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
                          nextStage: null,
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
                          nextStage: null,
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
              nextStage: null,
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
              nextStage: null,
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


export const exampleMessages: Message[] = [
    {
      type: 'bot',
      content: '欢迎来到产品创新工作台，让我们从了解您的目标市场开始。您想开发什么类型的产品？',
      timestamp: '09:00 AM'
    },
    {
      type: 'user',
      content: '我想开发一个巧克力产品系列。',
      timestamp: '09:01 AM'
    },
    {
      type: 'bot',
      content: '好的，让我们从了解您的目标市场开始。您想开发什么类型的产品？',
      timestamp: '09:00 AM'
    },
    {
      type: 'user',
      content: '我想要做一款受小朋友和家长欢迎的巧克力产品，有什么灵感？',
      timestamp: '09:01 AM'
    },
    {
      type: 'bot',
      content: `差异化总结：通过游戏化营养教育、国潮IP沉浸体验、可控健康参数，同时满足家长端“安全透明”与儿童端“好玩创造”需求，精准匹配小红书/TikTok“知识型萌娃内容”传播趋势。`,
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