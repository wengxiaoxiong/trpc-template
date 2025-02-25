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
    products?: Array<{
      name: string;
      brand: string;
      rating: number;
    }>;
  };
}

// 将chatMessages定义移动到组件外部
const chatMessages: Message[] = [
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

const ConceptNode: React.FC<{ concept: Concept, onConceptSelect: (conceptId: number) => void, isSelected: boolean, setInputMessage?: (message: string) => void }> = ({ concept, onConceptSelect, isSelected, setInputMessage }) => {

    const handleConceptClick = () => {
        // 如果nextStage为null，将概念放到聊天框输入
        if (concept.nextStage === null) {
            // 创建详细的讨论提示
            const metricsInfo = concept.metrics ? 
                `评分：${concept.score}（市场潜力：${concept.metrics.marketPotential}，可行性：${concept.metrics.feasibility}，创新度：${concept.metrics.innovationLevel}，成本效益：${concept.metrics.costEfficiency}）` : 
                `评分：${concept.score}`;
            
            const dataPointsInfo = concept.dataPoints && concept.dataPoints.length > 0 ?
                `\n数据支持：${concept.dataPoints.map(dp => `${dp.type}: ${dp.description}`).join('、')}` :
                '';
            
            // 组装最终消息
            const message = `我想讨论这个实施方案: ${concept.name}\n${concept.description}\n${metricsInfo}${dataPointsInfo}`;
            
            // 使用父组件传递的setInputMessage函数或直接修改DOM
            if (setInputMessage) {
                setInputMessage(message);
            } else {
                // 回退方案，直接操作DOM
                const chatInput = document.getElementById('chat-input') as HTMLInputElement;
                if (chatInput) {
                    chatInput.value = message;
                    chatInput.focus();
                }
            }
        } else {
            // 正常选择概念
            onConceptSelect(concept.id);
        }
    };

    // 根据得分返回颜色
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div
            className={`p-3 border rounded-md shadow-sm cursor-pointer transition-all duration-200
                ${isSelected ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
            `}
            onClick={handleConceptClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center">
                        <h4 className="text-sm font-semibold">{concept.name}</h4>
                        {concept.tags && concept.tags.length > 0 && (
                            <div className="ml-2 flex flex-wrap gap-1">
                                {concept.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {tag}
                                    </span>
                                ))}
                                {concept.tags.length > 2 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">+{concept.tags.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{concept.description}</p>
                </div>
                <div className="ml-2 flex flex-col items-center">
                    <div className={`text-lg font-bold ${getScoreColor(concept.score)}`}>
                        {concept.score}
                    </div>
                    <div className="text-xs text-gray-500">评分</div>
                </div>
                {isSelected && <CheckCircleOutlined className="text-indigo-500 text-lg ml-2 absolute top-2 right-2" />}
            </div>

            {/* 评估指标可视化 */}
            {concept.metrics && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-4 gap-1 text-xs">
                        <div className="flex flex-col items-center">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-1">
                                <div 
                                    className="h-full bg-blue-500 rounded-full" 
                                    style={{width: `${concept.metrics.marketPotential}%`}}
                                ></div>
                            </div>
                            <span className="text-gray-600">市场潜力</span>
                            <span className="font-medium">{concept.metrics.marketPotential}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-1">
                                <div 
                                    className="h-full bg-green-500 rounded-full" 
                                    style={{width: `${concept.metrics.feasibility}%`}}
                                ></div>
                            </div>
                            <span className="text-gray-600">可行性</span>
                            <span className="font-medium">{concept.metrics.feasibility}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-1">
                                <div 
                                    className="h-full bg-purple-500 rounded-full" 
                                    style={{width: `${concept.metrics.innovationLevel}%`}}
                                ></div>
                            </div>
                            <span className="text-gray-600">创新度</span>
                            <span className="font-medium">{concept.metrics.innovationLevel}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-1">
                                <div 
                                    className="h-full bg-yellow-500 rounded-full" 
                                    style={{width: `${concept.metrics.costEfficiency}%`}}
                                ></div>
                            </div>
                            <span className="text-gray-600">成本效益</span>
                            <span className="font-medium">{concept.metrics.costEfficiency}</span>
                        </div>
                    </div>
                </div>
            )}

            {concept.dataPoints && concept.dataPoints.length > 0 && (
                <div className="mt-2">
                    <ul className="space-y-1">
                        {concept.dataPoints.map((dp, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-center">
                                <InfoCircleOutlined className="mr-1" />
                                <span className="font-semibold">{dp.type}:</span> {dp.description}
                                {dp.confidence && (
                                    <span className="ml-1 text-gray-400">(可信度: {dp.confidence}%)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const StageNode: React.FC<{ stage: Stage, onConceptSelect: (stageId: number, conceptId: number) => void, selectedConceptIds: number[], setInputMessage?: (message: string) => void }> = ({ stage, onConceptSelect, selectedConceptIds, setInputMessage }) => {

    const handleConceptSelect = (conceptId: number) => {
        onConceptSelect(stage.id, conceptId);
    };

    // 检查当前阶段是否有被选中的概念
    const selectedConcept = stage.concepts.find(concept => selectedConceptIds.includes(concept.id));
    const hasSelectedConcept = !!selectedConcept;

    // 获取阶段状态颜色
    const getStatusColor = () => {
        switch(stage.status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'current': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'pending': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    const statusColor = getStatusColor();
    
    // 根据阶段状态和是否有三个方案可选择确定显示的状态文本
    const getStatusText = () => {
        if (stage.status === 'completed') {
            return '已完成';
        } else if (stage.status === 'current' && stage.concepts.length === 3) {
            return '当前阶段';
        } else if (stage.status === 'pending') {
            return '待处理';
        }
        return stage.status === 'current' ? '当前阶段' : '待处理';
    };

    return (
        <div className="mb-8">
            <div className={`bg-white p-4 rounded-lg border ${stage.status === 'current' ? 'border-indigo-300 shadow-md' : 'border-gray-200'}`}>
                <div className="flex items-center mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${statusColor}`}>
                        {stage.order || stage.id}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold">{stage.name}</h3>
                        <div className="flex items-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor} mr-2`}>
                                {getStatusText()}
                            </span>
                            {stage.estimatedTimeInMinutes && (
                                <span className="text-xs text-gray-500">
                                    预计用时: {stage.estimatedTimeInMinutes}分钟
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{stage.description}</p>
                
                {stage.completionCriteria && (
                    <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded mb-3 flex items-start">
                        <InfoCircleOutlined className="mr-1 mt-0.5" />
                        <span>完成标准: {stage.completionCriteria}</span>
                    </div>
                )}
                
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
                                setInputMessage={setInputMessage}
                            />
                            
                            {/* 以折叠形式显示其他概念 */}
                            <div className="mt-3">
                                <details className="text-sm">
                                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700 flex items-center">
                                        <div className="w-4 h-4 mr-1 flex items-center justify-center">
                                            <RightOutlined className="text-xs" />
                                        </div>
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
                                setInputMessage={setInputMessage}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* 如果有选中的概念且该概念有下一阶段，则显示下一阶段，垂直排列 */}
            {selectedConcept?.nextStage && (
                <div className="my-3">
                    {/* 使用垂直箭头指示阶段流程 */}
                    <div className="flex justify-center my-2">
                        <div className="flex flex-col items-center">
                            <div className="w-0.5 h-8 bg-gray-300"></div>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 border border-indigo-200">
                                <RightOutlined className="text-indigo-500 transform rotate-90" />
                            </div>
                            <div className="w-0.5 h-4 bg-gray-300"></div>
                        </div>
                    </div>
                    
                    <StageNode
                        stage={selectedConcept.nextStage}
                        onConceptSelect={onConceptSelect}
                        selectedConceptIds={selectedConceptIds}
                        setInputMessage={setInputMessage}
                    />
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {

    // 简化的数据结构，确保每个阶段有3个选项，清晰的3选1流程
    const initialStages: Stage[] = [
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

    const [stages, setStages] = useState<Stage[]>(initialStages);
    const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>(chatMessages);

    // 发送消息函数
    const sendMessage = useCallback(() => {
        if (inputMessage.trim()) {
            // 添加用户消息
            const userMessage: Message = {
                type: 'user',
                content: inputMessage,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            setMessages(prev => [...prev, userMessage]);
            
            // 清空输入
            setInputMessage('');
            
            // 这里可以添加机器人回复逻辑
            // 模拟机器人回复
            setTimeout(() => {
                const botMessage: Message = {
                    type: 'bot',
                    content: `我收到了您关于"${inputMessage.split('\n')[0]}"的讨论请求。让我们深入分析这个方案的可行性和实施步骤。`,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                };
                setMessages(prev => [...prev, botMessage]);
            }, 1000);
        }
    }, [inputMessage]);

    // 处理按Enter键发送消息
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const onConceptSelect = useCallback((stageId: number, conceptId: number) => {
        // 更新当前阶段的选中概念
        setStages(prevStages => {
            // 递归函数，用于在嵌套的阶段结构中更新选中的概念
            const updateStageInTree = (stages: Stage[]): Stage[] => {
                return stages.map(stage => {
                    if (stage.id === stageId) {
                        // 找到目标阶段，更新它的currentConceptId
                        return { ...stage, currentConceptId: conceptId };
                    }
                    
                    // 检查该阶段的所有概念中的nextStage
                    const updatedConcepts = stage.concepts.map(concept => {
                        if (concept.nextStage) {
                            // 如果该概念有下一个阶段，递归更新
                            const updatedNextStage = updateStageInTree([concept.nextStage])[0];
                            return { ...concept, nextStage: updatedNextStage };
                        }
                        return concept;
                    });
                    
                    return { ...stage, concepts: updatedConcepts };
                });
            };
            
            return updateStageInTree(prevStages);
        });

        // 更新选中的概念ID列表
        setSelectedConceptIds(prevIds => {
            // 递归查找阶段的函数
            const findStageInTree = (stages: Stage[], targetStageId: number): {stage: Stage | null, path: number[]} => {
                for (let i = 0; i < stages.length; i++) {
                    const stage = stages[i];
                    if (stage.id === targetStageId) {
                        return { stage, path: [i] };
                    }
                    
                    // 在概念的nextStage中查找
                    for (let j = 0; j < stage.concepts.length; j++) {
                        const concept = stage.concepts[j];
                        if (concept.nextStage) {
                            const result = findStageInTree([concept.nextStage], targetStageId);
                            if (result.stage) {
                                // 找到了，更新路径
                                return { stage: result.stage, path: [i, j, ...result.path] };
                            }
                        }
                    }
                }
                
                return { stage: null, path: [] };
            };
            
            // 查找当前阶段及其路径
            const { stage: currentStage, path } = findStageInTree(stages, stageId);
            
            if (!currentStage) {
                // 如果找不到阶段，这是异常情况，保留当前选择状态
                console.error(`找不到ID为${stageId}的阶段`);
                return [...prevIds, conceptId];
            }
            
            // 找到了当前阶段
            // 保留所有之前阶段的选择，添加当前阶段的选择
            // 为了确定哪些是"之前"的阶段，我们可以使用路径信息
            
            // 首先，收集所有阶段的信息（包括嵌套阶段）
            const collectAllStages = (stages: Stage[], parentPath: string = ''): {id: number, path: string, conceptIds: number[]}[] => {
                let result: {id: number, path: string, conceptIds: number[]}[] = [];
                
                stages.forEach((stage, i) => {
                    const currentPath = parentPath ? `${parentPath}-${i}` : `${i}`;
                    result.push({
                        id: stage.id,
                        path: currentPath,
                        conceptIds: stage.concepts.map(c => c.id)
                    });
                    
                    // 递归处理nextStage
                    stage.concepts.forEach((concept, j) => {
                        if (concept.nextStage) {
                            result = result.concat(
                                collectAllStages([concept.nextStage], `${currentPath}-${j}`)
                            );
                        }
                    });
                });
                
                return result;
            };
            
            const allStages = collectAllStages(stages);
            const currentStagePath = allStages.find(s => s.id === stageId)?.path || '';
            
            // 过滤出所有在当前阶段路径上的或之前的阶段的概念ID
            // 并添加当前选择的概念ID
            const filteredIds = prevIds.filter(id => {
                // 检查这个ID属于哪个阶段
                for (const stageInfo of allStages) {
                    if (stageInfo.conceptIds.includes(id)) {
                        // 如果是当前阶段的概念，我们会用新的conceptId替换，所以先过滤掉
                        if (stageInfo.id === stageId) {
                            return false;
                        }
                        
                        // 检查这个阶段是否是当前阶段路径上的或之前的
                        // 比较路径字符串，确保是合适的前缀或完全不同的分支
                        const isCurrentPathOrBefore = 
                            currentStagePath.startsWith(stageInfo.path) || 
                            !stageInfo.path.startsWith(currentStagePath.split('-')[0]);
                            
                        return isCurrentPathOrBefore;
                    }
                }
                return false;
            });
            
            return [...filteredIds, conceptId];
        });
    }, [stages]);

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

    // 将setInputMessage函数传递给ConceptNode组件
    const handleSetInputMessage = useCallback((message: string) => {
        setInputMessage(message);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
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

            <main className="max-w-full mx-auto px-6 py-6 h-[calc(100vh-64px)] overflow-hidden">
                <div className="grid grid-cols-12 gap-6 h-full">
                    <div className="col-span-8 bg-white rounded-lg shadow-sm p-4 overflow-hidden">
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4">
                                {messages.map((message, index) => (
                                    <div key={index} className="flex items-start mb-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${message.type === 'bot' ? 'bg-indigo-600' : 'bg-green-500'}`}>
                                            {message.type === 'bot' ? <RobotOutlined /> : <UserOutlined />}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`rounded-lg p-3 ${message.type === 'bot' ? 'bg-gray-100' : 'bg-indigo-50'}`}>
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
                                    id="chat-input"
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
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
                    <div className="col-span-4 h-full overflow-y-auto flex flex-col">
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                                    <RightOutlined className="text-indigo-500" />
                                </div>
                                Innovation Journey
                            </h3>
                            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-600">
                                各阶段的选择将引导您完成整个产品创新过程。每个阶段选择一个最合适的方案来继续。
                            </div>
                            {/* 只渲染第一个阶段，其他阶段会通过树形结构递归渲染 */}
                            <div className="stage-container max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                                {stages.length > 0 && (
                                    <StageNode
                                        key={stages[0].id}
                                        stage={stages[0]}
                                        onConceptSelect={onConceptSelect}
                                        selectedConceptIds={selectedConceptIds}
                                        setInputMessage={handleSetInputMessage}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
                            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                            <div className="p-3 bg-gray-50 rounded-lg mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Premium', 'Organic', 'Sustainable', 'Luxury', 'Natural'].map((keyword) => (
                                        <span key={keyword} className="!rounded-button bg-white px-3 py-1 text-xs font-medium text-gray-600 border">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
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