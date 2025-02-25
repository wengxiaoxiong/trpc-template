'use client'
import React, { useState, useCallback } from 'react';
import {
    BulbOutlined,
    SaveOutlined,
    SettingOutlined,
    RobotOutlined,
    UserOutlined,
    SendOutlined,
    AppstoreOutlined,
    DatabaseOutlined,
    LineChartOutlined,
    StarFilled,
    InfoCircleOutlined,
    RightOutlined,
    CheckCircleOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';


interface DataPoint {
    type: '水晶球' | '外网' | 'PIM';
    description: string;
    confidence?: number; // 数据可信度，0-100
    source?: string; // 数据来源
    timestamp?: string; // 数据时间戳
}

interface ConceptMetrics {
    marketPotential: number; // 市场潜力评分，0-100
    feasibility: number; // 可行性评分，0-100
    innovationLevel: number; // 创新程度，0-100
    costEfficiency: number; // 成本效益，0-100
}

interface Concept {
    id: number;
    name: string;
    description: string;
    score: number; // 综合评分，0-100
    dataPoints?: DataPoint[];
    selected?: boolean;
    nextStage?: Stage | null;
    metrics?: ConceptMetrics; // 概念的详细评估指标
    tags?: string[]; // 标签
    createdAt?: string; // 创建时间
    updatedAt?: string; // 更新时间
}

interface Stage {
    id: number;
    name: string;
    description: string;
    status: 'completed' | 'current' | 'pending';
    currentConceptId: number | null; // 当前选中的concept ID
    concepts: Concept[];
    order?: number; // 阶段顺序
    requiredPreviousStage?: number | null; // 必须完成的前置阶段ID
    completionCriteria?: string; // 完成标准
    estimatedTimeInMinutes?: number; // 预计完成时间（分钟）
}

interface WebSource {
  title: string;
  url: string;
  summary: string;
}

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
  dataSources?: {
    keywords?: string[];
    insights?: string[];
    marketTrends?: {
      growth: string;
      category: string;
    };
    webSources?: WebSource[];
  };
}

const ConceptNode: React.FC<{ concept: Concept, onConceptSelect: (conceptId: number) => void, isSelected: boolean }> = ({ concept, onConceptSelect, isSelected }) => {

    const handleConceptClick = () => {
        onConceptSelect(concept.id);
    };

    return (
        <div
            className={`p-3 border rounded-md shadow-sm cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50'}
        `}
            onClick={handleConceptClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-semibold">{concept.name}</h4>
                    <p className="text-xs text-gray-500 mb-1">{concept.description}</p>
                </div>
                {isSelected && <CheckCircleOutlined className="text-indigo-500 text-lg ml-2" />}
            </div>

            {concept.dataPoints && concept.dataPoints.length > 0 && (
                <div className="mt-1">
                    <ul className="space-y-1">
                        {concept.dataPoints.map((dp, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-center">
                                <InfoCircleOutlined className="mr-1" />
                                <span className="font-semibold">{dp.type}:</span> {dp.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const StageNode: React.FC<{ stage: Stage, onConceptSelect: (stageId: number, conceptId: number) => void, selectedConceptIds: number[] }> = ({ stage, onConceptSelect, selectedConceptIds }) => {

    const handleConceptSelect = (conceptId: number) => {
        onConceptSelect(stage.id, conceptId);
    };

    // 检查当前阶段是否有被选中的概念
    const selectedConcept = stage.concepts.find(concept => selectedConceptIds.includes(concept.id));
    const hasSelectedConcept = !!selectedConcept;

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{stage.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{stage.description}</p>
            <div className="space-y-2">
                {/* 如果有选中的概念，显示选中的概念，并以折叠形式显示其他概念 */}
                {hasSelectedConcept ? (
                    <>
                        {/* 显示选中的概念 */}
                        <ConceptNode
                            key={selectedConcept.id}
                            concept={selectedConcept}
                            onConceptSelect={handleConceptSelect}
                            isSelected={true}
                        />
                        
                        {/* 以折叠形式显示其他概念 */}
                        <div className="mt-3">
                            <details className="text-sm">
                                <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                                    查看其他方案 ({stage.concepts.length - 1})
                                </summary>
                                <div className="mt-2 pl-2 space-y-2 border-l-2 border-gray-200">
                                    {stage.concepts
                                        .filter(concept => concept.id !== selectedConcept.id)
                                        .map(concept => (
                                            <div 
                                                key={concept.id} 
                                                className="p-3 border rounded-md shadow-sm bg-gray-50 opacity-75"
                                            >
                                                <div>
                                                    <h4 className="text-sm font-semibold">{concept.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-1">{concept.description}</p>
                                                </div>
                                                
                                                {concept.dataPoints && concept.dataPoints.length > 0 && (
                                                    <div className="mt-1">
                                                        <ul className="space-y-1">
                                                            {concept.dataPoints.map((dp, index) => (
                                                                <li key={index} className="text-xs text-gray-600 flex items-center">
                                                                    <InfoCircleOutlined className="mr-1" />
                                                                    <span className="font-semibold">{dp.type}:</span> {dp.description}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </details>
                        </div>
                    </>
                ) : (
                    // 如果没有选中的概念，显示所有可选择的概念
                    stage.concepts.map(concept => (
                        <ConceptNode
                            key={concept.id}
                            concept={concept}
                            onConceptSelect={handleConceptSelect}
                            isSelected={selectedConceptIds.includes(concept.id)}
                        />
                    ))
                )}
            </div>

            {/* 如果有选中的概念且该概念有下一阶段，则显示下一阶段 */}
            {selectedConcept?.nextStage && (
                <div className="mt-4 pl-6 border-l border-gray-300">
                    <div className="flex items-center mb-2">
                        <RightOutlined className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Next Stage</span>
                    </div>
                    <StageNode
                        stage={selectedConcept.nextStage}
                        onConceptSelect={onConceptSelect}
                        selectedConceptIds={selectedConceptIds}
                    />
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {
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

    // 使用实际项目中的数据
    const initialStages: Stage[] = [
        {
            id: 1,
            name: 'Data to Insights',
            description: 'Analyze market data and generate insights',
            status: 'completed',
            currentConceptId: null,
            concepts: [
                {
                    id: 1,
                    name: 'Analysis A',
                    description: 'Focus on premium market segment analysis',
                    score: 65,
                    dataPoints: [
                        { type: '水晶球', description: '2024Q2高端巧克力人群偏好度上升25%' },
                        { type: '外网', description: '小红书"高端巧克力"相关笔记增加150%' },
                        { type: 'PIM', description: 'PIM系统中高端巧克力原料库存充足' }
                    ],
                    selected: false,
                    nextStage: {
                        id: 2,
                        name: 'Insights to Concept',
                        description: 'Transform insights into product concepts',
                        status: 'current',
                        currentConceptId: null,
                        concepts: [
                            {
                                id: 4,
                                name: 'Concept A',
                                description: 'Luxury packaging concept',
                                score: 65,
                                dataPoints: [
                                    { type: '水晶球', description: '用户调研显示，豪华包装能提升产品价值感' },
                                    { type: '外网', description: '豪华包装设计在社交媒体上更易传播' },
                                    { type: 'PIM', description: '豪华包装材料供应链稳定' }
                                ],
                                selected: false,
                                nextStage: null
                            },
                            {
                                id: 5,
                                name: 'Concept B',
                                description: 'Eco-friendly packaging design',
                                score: 78,
                                dataPoints: [
                                    { type: '水晶球', description: '环保包装能有效吸引环保意识消费者' },
                                    { type: '外网', description: '环保包装设计案例在设计社区中受欢迎' },
                                    { type: 'PIM', description: '环保材料可回收利用，降低长期成本' }
                                ],
                                selected: false,
                                nextStage: null
                            },
                            {
                                id: 6,
                                name: 'Concept C',
                                description: 'Premium sustainable packaging',
                                score: 92,
                                dataPoints: [
                                    { type: '水晶球', description: '高端用户对可持续产品接受度高' },
                                    { type: '外网', description: '高端可持续包装设计成为行业趋势' },
                                    { type: 'PIM', description: '高端可持续材料已通过多项认证' }
                                ],
                                selected: false,
                                nextStage: null
                            },
                        ]
                    }
                },
                {
                    id: 2,
                    name: 'Analysis B',
                    description: 'Consumer behavior in sustainable products',
                    score: 78,
                    dataPoints: [
                        { type: '水晶球', description: '2024Q2可持续产品人群购买意愿提升30%' },
                        { type: '外网', description: '消费者对环保包装的讨论热度上升' },
                        { type: 'PIM', description: '环保包装材料成本下降，利润空间提升' }
                    ],
                    selected: false,
                    nextStage: {
                        id: 2,
                        name: 'Insights to Concept',
                        description: 'Transform insights into product concepts',
                        status: 'current',
                        currentConceptId: null,
                        concepts: [
                            {
                                id: 7,
                                name: 'Concept D',
                                description: 'Minimalist eco packaging',
                                score: 75,
                                dataPoints: [
                                    { type: '水晶球', description: '极简主义设计受到年轻消费者欢迎' },
                                    { type: '外网', description: '极简包装在社交媒体上获得高转发率' },
                                    { type: 'PIM', description: '极简包装可降低30%材料成本' }
                                ],
                                selected: false,
                                nextStage: null
                            },
                            {
                                id: 8,
                                name: 'Concept E',
                                description: 'Reusable container design',
                                score: 88,
                                dataPoints: [
                                    { type: '水晶球', description: '可重复使用包装提高品牌忠诚度' },
                                    { type: '外网', description: '可重复使用包装在环保社区获得好评' },
                                    { type: 'PIM', description: '可重复使用材料供应链已建立' }
                                ],
                                selected: false,
                                nextStage: null
                            }
                        ]
                    }
                },
                {
                    id: 3,
                    name: 'Analysis C',
                    description: 'Premium sustainable market opportunity',
                    score: 92,
                    selected: false,
                    dataPoints: [
                        { type: '水晶球', description: '高端可持续巧克力市场规模预测增长18%' },
                        { type: '外网', description: '社交媒体对高端可持续巧克力话题讨论度高' },
                        { type: 'PIM', description: 'PIM系统中高端可持续原料供应商增加' }
                    ],
                    nextStage: {
                        id: 2,
                        name: 'Insights to Concept',
                        description: 'Transform insights into product concepts',
                        status: 'current',
                        currentConceptId: null,
                        concepts: [
                            {
                                id: 9,
                                name: 'Concept F',
                                description: 'Premium biodegradable packaging',
                                score: 95,
                                dataPoints: [
                                    { type: '水晶球', description: '高端生物可降解包装市场增长迅速' },
                                    { type: '外网', description: '生物可降解包装获得环保认证更受欢迎' },
                                    { type: 'PIM', description: '新型生物可降解材料已通过测试' }
                                ],
                                selected: false,
                                nextStage: null
                            },
                            {
                                id: 10,
                                name: 'Concept G',
                                description: 'Artisanal sustainable packaging',
                                score: 90,
                                dataPoints: [
                                    { type: '水晶球', description: '手工制作包装增加产品独特性' },
                                    { type: '外网', description: '手工包装在高端市场更具吸引力' },
                                    { type: 'PIM', description: '本地手工艺人合作计划已启动' }
                                ],
                                selected: false,
                                nextStage: null
                            }
                        ]
                    }
                },
            ]
        }
    ];

    const [stages, setStages] = useState<Stage[]>(initialStages);
    const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([]);

    const onConceptSelect = useCallback((stageId: number, conceptId: number) => {
        // 更新当前阶段的选中概念
        setStages(prevStages => {
            return prevStages.map(stage => {
                if (stage.id === stageId) {
                    return { ...stage, currentConceptId: conceptId };
                }
                return stage;
            });
        });

        // 更新选中的概念ID列表
        setSelectedConceptIds(prevIds => {
            // 找出当前阶段在整个阶段树中的位置
            let currentStage: Stage | null = null;
            let stageIndex = -1;
            
            // 在主阶段列表中查找
            for (let i = 0; i < stages.length; i++) {
                if (stages[i].id === stageId) {
                    currentStage = stages[i];
                    stageIndex = i;
                    break;
                }
            }
            
            // 如果没找到，可能是嵌套在某个概念的nextStage中
            if (!currentStage) {
                // 这里简化处理，实际上可能需要递归查找
                // 清除所有ID并添加新选择的ID
                return [conceptId];
            }
            
            // 如果找到了，清除当前阶段之后的所有选择
            // 保留之前阶段的选择，添加当前选择
            const newIds = prevIds.filter(id => {
                // 检查这个ID是否属于之前的阶段
                for (let i = 0; i < stageIndex; i++) {
                    if (stages[i].concepts.some(c => c.id === id)) {
                        return true;
                    }
                }
                return false;
            });
            
            return [...newIds, conceptId];
        });
    }, [stages]);

    const chatMessages = [
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

    const topProducts = [
        {
            name: 'Dark Chocolate Truffles',
            brand: 'Godiva',
            rating: 4.8,
            reviews: 1250,
            keywords: ['premium', 'smooth', 'rich']
        },
        {
            name: 'Sea Salt Caramel Chocolate',
            brand: 'Lindt',
            rating: 4.7,
            reviews: 980,
            keywords: ['sweet-salty', 'creamy', 'luxurious']
        },
        {
            name: 'Hazelnut Praline Bar',
            brand: 'Ferrero',
            rating: 4.9,
            reviews: 2100,
            keywords: ['nutty', 'crunchy', 'indulgent']
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <BulbOutlined className="text-indigo-600 text-2xl" />
                        <h1 className="text-xl font-semibold text-gray-900">Product Innovation Workbench</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="!rounded-button bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
                            <SaveOutlined className="mr-2" />
                            Save Project
                        </button>
                        <button className="!rounded-button bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200">
                            <SettingOutlined className="mr-2" />
                            Settings
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-10 gap-6 mt-8">
                    <div className="col-span-7 bg-white rounded-lg shadow-sm p-6">
                        <div className="h-[600px] flex flex-col">
                            <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4">
                                {chatMessages.map((message, index) => (
                                    <div key={index} className="flex items-start mb-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${message.type === 'bot' ? 'bg-indigo-600' : 'bg-green-500'}`}>
                                            {message.type === 'bot' ? <RobotOutlined /> : <UserOutlined />}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`rounded-lg p-4 ${message.type === 'bot' ? 'bg-gray-100' : 'bg-indigo-50'}`}>
                                                <p className="text-gray-800">{message.content}</p>
                                                {message.type === 'bot' && message.dataSources && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="flex flex-wrap gap-2">
                                                            {message.dataSources.keywords?.map((keyword, idx) => (
                                                                <span key={idx} className="!rounded-button bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                                                                    {keyword}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {message.dataSources.insights && (
                                                            <div className="mt-2 text-xs text-gray-600">
                                                                <div className="flex items-center">
                                                                    <LineChartOutlined className="text-indigo-600 mr-2" />
                                                                    <span>市场趋势: {message.dataSources.marketTrends?.growth} 增长</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {message.dataSources.webSources && message.dataSources.webSources.length > 0 && (
                                                            <div className="mt-3">
                                                                <h5 className="text-xs font-medium text-gray-700 mb-2">参考网页</h5>
                                                                <div className="space-y-2">
                                                                    {message.dataSources.webSources.map((source, idx) => (
                                                                        <div key={idx} className="bg-white border border-gray-200 rounded-md p-2">
                                                                            <div className="flex items-center">
                                                                                <LinkOutlined className="text-indigo-500 mr-2" />
                                                                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-600 hover:underline truncate">
                                                                                    {source.title}
                                                                                </a>
                                                                            </div>
                                                                            <p className="text-xs text-gray-600 mt-1">{source.summary}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500 mt-2">{message.timestamp}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    className="flex-1 border-none bg-gray-100 rounded-lg px-4 py-2 text-sm"
                                    placeholder="Type your message here..."
                                />
                                <button className="!rounded-button bg-indigo-600 text-white p-2 hover:bg-indigo-700">
                                    <SendOutlined />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Innovation Journey</h3>
                            {/* 只渲染第一个阶段，其他阶段会通过树形结构递归渲染 */}
                            {stages.length > 0 && (
                                <StageNode
                                    key={stages[0].id}
                                    stage={stages[0]}
                                    onConceptSelect={onConceptSelect}
                                    selectedConceptIds={selectedConceptIds}
                                />
                            )}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                            <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Premium', 'Organic', 'Sustainable', 'Luxury', 'Natural'].map((keyword) => (
                                        <span key={keyword} className="!rounded-button bg-white px-3 py-1 text-xs font-medium text-gray-600 border">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Products</h4>
                                <div className="space-y-3">
                                    {topProducts.map((product) => (
                                        <div key={product.name} className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.brand}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <StarFilled className="text-yellow-400 mr-1" />
                                                <span className="text-sm text-gray-600">{product.rating}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;