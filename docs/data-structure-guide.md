# Tezign Chain Of Design数据结构指南

本文档详细说明了Tezign Chain Of Design中使用的Stage（阶段）和Concept（概念）数据结构，以及它们之间的关系规则。这些规则可以帮助您创建符合系统要求的模拟数据。

## 数据结构概述

Tezign Chain Of Design使用树形结构来组织创新过程：
- 每个**Stage**（阶段）包含多个**Concept**（概念/方案）
- 用户在每个阶段选择一个概念后，将进入该概念关联的下一个阶段
- 这形成了一个决策树，用户通过选择不同的概念，可以沿着不同的路径前进

## Stage（阶段）数据结构

### 必填字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| id | number | 阶段唯一标识符 | 必须唯一，建议使用整数 |
| name | string | 阶段名称 | 简洁明了，通常不超过30个字符 |
| description | string | 阶段描述 | 说明该阶段的目标和任务 |
| status | string | 阶段状态 | 必须是'completed'、'current'或'pending'之一 |
| currentConceptId | number \| null | 当前选中的概念ID | 如果有选中的概念，则为该概念的ID；否则为null |
| concepts | Concept[] | 该阶段包含的概念列表 | 至少包含1个概念，建议不超过5个 |

### 可选字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| order | number | 阶段顺序 | 从1开始的整数，表示阶段在整个流程中的顺序 |
| requiredPreviousStage | number \| null | 必须完成的前置阶段ID | 如果有前置依赖，则为前置阶段的ID；否则为null |
| completionCriteria | string | 完成标准 | 描述完成该阶段需要满足的条件 |
| estimatedTimeInMinutes | number | 预计完成时间 | 完成该阶段预计需要的时间（分钟） |

## Concept（概念）数据结构

### 必填字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| id | number | 概念唯一标识符 | 必须唯一，建议使用整数 |
| name | string | 概念名称 | 简洁明了，通常不超过50个字符 |
| description | string | 概念描述 | 详细说明该概念的内容和特点 |
| score | number | 综合评分 | 0-100的整数，表示该概念的综合评估分数 |
| selected | boolean | 是否被选中 | true表示被选中，false表示未选中 |
| nextStage | Stage \| null | 选择该概念后进入的下一阶段 | 如果有下一阶段，则为Stage对象；否则为null |

### 可选字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| dataPoints | DataPoint[] | 支持该概念的数据点 | 数据证据，建议1-5个 |
| metrics | ConceptMetrics | 详细评估指标 | 包含多个维度的评分 |
| tags | string[] | 标签 | 关键词标签，便于分类和筛选 |
| createdAt | string | 创建时间 | ISO 8601格式的时间字符串 |
| updatedAt | string | 更新时间 | ISO 8601格式的时间字符串 |

## DataPoint（数据点）数据结构

### 必填字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| type | string | 数据类型 | 必须是'水晶球'、'外网'或'PIM'之一 |
| description | string | 数据描述 | 简洁描述数据内容和意义 |

### 可选字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| confidence | number | 数据可信度 | 0-100的整数，表示数据的可信程度 |
| source | string | 数据来源 | 数据的具体来源 |
| timestamp | string | 数据时间戳 | ISO 8601格式的时间字符串 |

## ConceptMetrics（概念评估指标）数据结构

### 必填字段

| 字段名 | 类型 | 描述 | 规则 |
|-------|------|------|------|
| marketPotential | number | 市场潜力评分 | 0-100的整数，表示市场潜力大小 |
| feasibility | number | 可行性评分 | 0-100的整数，表示实施难度（越高越容易） |
| innovationLevel | number | 创新程度 | 0-100的整数，表示创新程度 |
| costEfficiency | number | 成本效益 | 0-100的整数，表示成本效益比（越高越好） |

## 数据结构关系规则

1. **阶段与概念的关系**：
   - 每个阶段包含多个概念
   - 每个概念可以关联到下一个阶段（通过nextStage字段）
   - 一个阶段中只能有一个概念被选中（selected = true）

2. **阶段顺序规则**：
   - 第一个阶段的requiredPreviousStage应为null
   - 后续阶段的requiredPreviousStage应指向前一个阶段的id
   - 阶段的order字段应按顺序递增

3. **概念ID规则**：
   - 建议使用不同范围的ID区分不同阶段的概念
   - 例如：第一阶段概念ID使用100-199，第二阶段使用200-299，以此类推

4. **数据点规则**：
   - 每个概念应至少有1个数据点支持
   - 数据点的type应反映数据的来源和性质
   - 高分概念应有更多或更高可信度的数据点支持

## 创建模拟数据的最佳实践

1. **创建有意义的决策树**：
   - 确保每个概念的nextStage形成有意义的决策路径
   - 不同概念应导向不同的下一阶段，体现决策的影响

2. **使用真实的评分和指标**：
   - 概念的score应基于其metrics计算得出
   - 可以使用加权平均：score = marketPotential*0.3 + feasibility*0.25 + innovationLevel*0.25 + costEfficiency*0.2

3. **创建合理的数据点**：
   - 数据点应支持概念的主要特点
   - 使用具体的数字和百分比使数据更有说服力
   - 不同type的数据点应反映不同来源的信息

4. **状态管理**：
   - 第一个阶段通常为'completed'或'current'
   - 用户当前所在的阶段应为'current'
   - 后续未到达的阶段应为'pending'

5. **时间戳使用**：
   - 使用合理的时间顺序
   - createdAt应早于updatedAt
   - 数据点的timestamp通常应早于概念的createdAt

## 示例数据结构

请参考代码中的`exampleStages`变量，它展示了一个完整的、符合上述规则的数据结构示例。
```
    // 示例数据，展示完整的数据结构
    const exampleStages: Stage[] = [
        {
            id: 1,
            name: 'Market Research',
            description: 'Analyze market trends and consumer preferences',
            status: 'completed',
            currentConceptId: 101,
            order: 1,
            requiredPreviousStage: null,
            completionCriteria: '至少选择一个市场分析方向',
            estimatedTimeInMinutes: 30,
            concepts: [
                {
                    id: 101,
                    name: 'Premium Chocolate Market Analysis',
                    description: 'Analysis of high-end chocolate consumer preferences',
                    score: 85,
                    selected: true,
                    createdAt: '2024-05-01T10:00:00Z',
                    updatedAt: '2024-05-01T11:30:00Z',
                    tags: ['premium', 'market-analysis', 'consumer-behavior'],
                    metrics: {
                        marketPotential: 90,
                        feasibility: 85,
                        innovationLevel: 70,
                        costEfficiency: 75
                    },
                    dataPoints: [
                        { 
                            type: '水晶球', 
                            description: '高端巧克力市场年增长率达15%',
                            confidence: 92,
                            source: '市场研究报告A-2024',
                            timestamp: '2024-04-15T00:00:00Z'
                        },
                        { 
                            type: '外网', 
                            description: '社交媒体上高端巧克力讨论热度上升40%',
                            confidence: 85,
                            source: '社交媒体分析平台',
                            timestamp: '2024-04-20T00:00:00Z'
                        }
                    ],
                    nextStage: {
                        id: 2,
                        name: 'Product Concept Development',
                        description: 'Develop initial product concepts based on market research',
                        status: 'current',
                        currentConceptId: null,
                        order: 2,
                        requiredPreviousStage: 1,
                        completionCriteria: '选择一个产品概念进行深入开发',
                        estimatedTimeInMinutes: 45,
                        concepts: [
                            {
                                id: 201,
                                name: 'Artisanal Gift Box Collection',
                                description: 'Premium handcrafted chocolate gift boxes with sustainable packaging',
                                score: 92,
                                selected: false,
                                createdAt: '2024-05-02T09:00:00Z',
                                updatedAt: '2024-05-02T10:15:00Z',
                                tags: ['gift', 'artisanal', 'sustainable'],
                                metrics: {
                                    marketPotential: 95,
                                    feasibility: 80,
                                    innovationLevel: 85,
                                    costEfficiency: 70
                                },
                                dataPoints: [
                                    { 
                                        type: '水晶球', 
                                        description: '礼盒类巧克力在节日季销量增长25%',
                                        confidence: 90,
                                        source: '销售数据分析',
                                        timestamp: '2024-04-25T00:00:00Z'
                                    },
                                    { 
                                        type: 'PIM', 
                                        description: '手工制作包装材料供应链已建立',
                                        confidence: 95,
                                        source: '供应链管理系统',
                                        timestamp: '2024-04-28T00:00:00Z'
                                    }
                                ],
                                nextStage: {
                                    id: 3,
                                    name: 'Packaging Design',
                                    description: 'Design sustainable and premium packaging for the product',
                                    status: 'pending',
                                    currentConceptId: null,
                                    order: 3,
                                    requiredPreviousStage: 2,
                                    completionCriteria: '确定最终包装设计方案',
                                    estimatedTimeInMinutes: 60,
                                    concepts: [
                                        {
                                            id: 301,
                                            name: 'Minimalist Eco-Luxury Design',
                                            description: 'Simple, elegant design using biodegradable materials',
                                            score: 88,
                                            selected: false,
                                            tags: ['minimalist', 'eco-friendly', 'luxury'],
                                            metrics: {
                                                marketPotential: 85,
                                                feasibility: 90,
                                                innovationLevel: 80,
                                                costEfficiency: 85
                                            },
                                            dataPoints: [
                                                { 
                                                    type: '外网', 
                                                    description: '极简主义包装在高端市场受欢迎程度提升',
                                                    confidence: 88,
                                                    source: '设计趋势报告',
                                                    timestamp: '2024-05-01T00:00:00Z'
                                                }
                                            ],
                                            nextStage: null
                                        },
                                        {
                                            id: 302,
                                            name: 'Interactive Packaging Experience',
                                            description: 'Packaging that transforms into a serving platter or display',
                                            score: 90,
                                            selected: false,
                                            tags: ['interactive', 'innovative', 'experience'],
                                            metrics: {
                                                marketPotential: 92,
                                                feasibility: 75,
                                                innovationLevel: 95,
                                                costEfficiency: 65
                                            },
                                            dataPoints: [
                                                { 
                                                    type: '水晶球', 
                                                    description: '互动式包装提升品牌记忆度30%',
                                                    confidence: 85,
                                                    source: '用户体验研究',
                                                    timestamp: '2024-05-02T00:00:00Z'
                                                }
                                            ],
                                            nextStage: null
                                        }
                                    ]
                                }
                            },
                            {
                                id: 202,
                                name: 'Single Origin Collection',
                                description: 'Premium chocolates showcasing distinct flavors from specific regions',
                                score: 88,
                                selected: false,
                                createdAt: '2024-05-02T09:30:00Z',
                                updatedAt: '2024-05-02T11:00:00Z',
                                tags: ['single-origin', 'authentic', 'gourmet'],
                                metrics: {
                                    marketPotential: 88,
                                    feasibility: 85,
                                    innovationLevel: 80,
                                    costEfficiency: 75
                                },
                                dataPoints: [
                                    { 
                                        type: '外网', 
                                        description: '产地溯源巧克力在美食爱好者中讨论度高',
                                        confidence: 92,
                                        source: '美食论坛分析',
                                        timestamp: '2024-04-22T00:00:00Z'
                                    }
                                ],
                                nextStage: null
                            }
                        ]
                    }
                },
                {
                    id: 102,
                    name: 'Sustainable Chocolate Trends',
                    description: 'Analysis of eco-friendly and sustainable chocolate products',
                    score: 80,
                    selected: false,
                    createdAt: '2024-05-01T10:15:00Z',
                    updatedAt: '2024-05-01T12:00:00Z',
                    tags: ['sustainable', 'eco-friendly', 'trends'],
                    metrics: {
                        marketPotential: 85,
                        feasibility: 80,
                        innovationLevel: 75,
                        costEfficiency: 70
                    },
                    dataPoints: [
                        { 
                            type: 'PIM', 
                            description: '可持续原料供应增长20%',
                            confidence: 90,
                            source: '供应链数据',
                            timestamp: '2024-04-18T00:00:00Z'
                        }
                    ],
                    nextStage: null
                }
            ]
        }
    ];
```

## 注意事项

1. 确保所有ID都是唯一的
2. 确保树形结构的完整性和一致性
3. 数据应反映真实的产品创新过程和决策逻辑
4. 概念的评分和指标应合理反映其价值和可行性 