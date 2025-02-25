import DataSources from '../components/DataSources';
import { Stage, Message, UserRequirement } from '../types';

// 初始化聊天消息
export const initialMessages: Message[] = [
  {
    type: 'bot',
    content: '欢迎来到Tezign Chain Of Design，让我们从了解您的目标市场开始。您想开发什么类型的产品？',
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
    thoughtProcess:[
      "第一步：明确分析目标，分别从家长和小朋友的角度出发，确定核心需求的分析框架。",
      "第二步：调用水晶球API，获取小红书上关于儿童食品的评论数据，确保数据来源的广泛性和代表性。",
      "第三步：对于家长的核心需求，使用Copilot Agent进行文本预处理和关键词分析，提取出家长关注的主要关键词，如“健康”、“营养”、“安全”。",
      "第四步：对于小朋友的核心需求，使用Copilot Agent进行NLP关键词提取，通过提问模板“孩子喜欢...”获取关键词，如“哪吒”、“我的世界”、“乐高”。",
      "第五步：调用Deepseek R1，深入分析“哪吒”、“我的世界”等关键词所满足的核心需求，得出“互动性”、“多模态体验”、“游戏化机制”、“搭建反馈”等结论。",
      "第六步：综合家长和小朋友的核心需求，进行总结和平衡，提出满足双方需求的解决方案或产品设计建议。"
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
        name: '营养建筑师·巧克力积木工坊',
        description: '可拼搭的巧克力积木 + 营养可视化',
        score: 88,
        metrics: {
          marketPotential: 90,
          feasibility: 85,
          innovationLevel: 95,
          costEfficiency: 80
        },
        tags: ['营养可视化', '模块化设计', '儿童教育'],
        dataPoints: [
          { type: '水晶球', description: '儿童食品市场增长率为15%', confidence: 90 }
        ],
        selected: false,nextStage:null,
      },
      {
        id: 102,
        name: '妖怪巧克力盲盒·哪吒降魔记',
        description: '国潮IP联动 + 多感官游戏化体验',
        score: 85,
        metrics: {
          marketPotential: 85,
          feasibility: 80,
          innovationLevel: 90,
          costEfficiency: 75
        },
        tags: ['国潮IP', '盲盒', 'AR互动'],
        dataPoints: [
          { type: '水晶球', description: '国潮食品市场溢价空间可达30%', confidence: 88 }
        ],
        selected: false,nextStage:null,
      },
      {
        id: 103,
        name: '巧克力科学胶囊·我的世界实验室',
        description: 'STEM教育融合 + 可控甜度设计',
        score: 92,
        metrics: {
          marketPotential: 95,
          feasibility: 90,
          innovationLevel: 95,
          costEfficiency: 85
        },
        tags: ['STEM教育', '甜度可控', '亲子互动'],
        dataPoints: [
          { type: '水晶球', description: 'STEM教育产品市场需求增长20%', confidence: 92 }
        ],
        selected: false,
        nextStage:null,
      }
    ]
  }
];

// 初始化用户需求和喜好
export const initialUserRequirements: UserRequirement[] = [
  {
    id: 1,
    content: "做一款受小朋友和家长欢迎的巧克力产品",
    confidence: 95,
    timestamp: "2023-06-20 10:30 AM",
    edited: false
  },
];

