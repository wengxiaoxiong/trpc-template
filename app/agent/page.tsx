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
    CheckCircleOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';


interface DataPoint {
    type: '水晶球' | '外网' | 'PIM';
    description: string;
}

interface Concept {
    id: number;
    name: string;
    description: string;
    score: number;
    dataPoints?: DataPoint[];
    selected?: boolean;
    nextStage?: Stage | null;
}

interface Stage {
    id: number;
    name: string;
    description: string;
    status: 'completed' | 'current' | 'pending';
    currentConceptId: number | null; // 当前选中的concept ID
    concepts: Concept[];
}

const StageNode: React.FC<{ stage: Stage, onConceptSelect: (stageId: number, conceptId: number) => void, selectedPath: number[] }> = ({ stage, onConceptSelect, selectedPath }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="text-lg font-semibold mb-2">{stage.name}</div>
            <div className="flex space-x-4">
                {stage.concepts.map(concept => (
                    <div key={concept.id}
                        className={`relative p-2 rounded border cursor-pointer w-32 h-16 flex items-center justify-center flex-col text-center ${stage.currentConceptId === concept.id ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-gray-300 hover:border-indigo-300'}`}
                        onClick={() => onConceptSelect(stage.id, concept.id)}
                    >
                        {stage.currentConceptId === concept.id && (
                            <div className="absolute top-0 right-0 rounded-full bg-indigo-600 w-2 h-2"></div>
                        )}
                        <span className="text-sm">{concept.name}</span>
                        {concept.score && <span className="text-xs text-gray-500">Score: {concept.score}</span>}
                    </div>
                ))}
            </div>

            {stage.concepts.find(c => c.id === stage.currentConceptId)?.nextStage && (
                <div className="flex items-center mt-4">
                    <ArrowRightOutlined style={{ fontSize: '20px', color: '#9CA3AF' }} />
                    <StageNode stage={stage.concepts.find(c => c.id === stage.currentConceptId)!.nextStage!} onConceptSelect={onConceptSelect} selectedPath={selectedPath} />
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const initialStages: Stage[] = [
        {
            id: 1,
            name: 'Data to Insights',
            description: 'Analyze market data and generate insights',
            status: 'completed',
            currentConceptId: null, // 初始化为 null
            concepts: [
                {
                    id: 1,
                    name: 'Analysis A',
                    description: 'Focus on premium market segment analysis',
                    score: 65,
                    dataPoints: [
                        { type: '水晶球', description: '2024Q2高端巧克力人群偏好度上升25%' },
                        { type: '外网', description: '小红书“高端巧克力”相关笔记增加150%' },
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
                    nextStage: null,
                },
                {
                    id: 3,
                    name: 'Analysis C',
                    description: 'Premium sustainable market opportunity',
                    score: 92,
                    selected: true,
                    dataPoints: [
                        { type: '水晶球', description: '高端可持续巧克力市场规模预测增长18%' },
                        { type: '外网', description: '社交媒体对高端可持续巧克力话题讨论度高' },
                        { type: 'PIM', description: 'PIM系统中高端可持续原料供应商增加' }
                    ],
                    nextStage: null,
                },
            ]
        },
    ];

    const [stages, setStages] = useState<Stage[]>(initialStages);
    const [selectedPath, setSelectedPath] = useState<number[]>([1]);

    const onConceptSelect = useCallback((stageId: number, conceptId: number) => {
        setStages(prevStages =>
            prevStages.map(stage => {
                if (stage.id === stageId) {
                    return { ...stage, currentConceptId: conceptId };
                }
                return stage;
            })
        );
        setSelectedPath(prevPath => [...prevPath, conceptId]);
    }, []);

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
                }
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
                    <div className="col-span-3 flex flex-col items-center">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 w-full">
                            <h3 className="text-lg font-semibold mb-4">Innovation Journey</h3>
                            <div className="overflow-x-auto">
                                <StageNode stage={stages[0]} onConceptSelect={onConceptSelect} selectedPath={selectedPath} />
                            </div>

                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
                            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                            <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Premium', 'Organic', 'Sustainable', 'Luxury', 'Natural'].map((keyword) => (
                                        <Tooltip key={keyword} title={
                                            <div>
                                                <strong>{keyword}</strong>
                                                <p>水晶球: 数据显示 {keyword} 相关趋势增长.</p>
                                                <p>外网:  {keyword} 相关的讨论增加</p>
                                                <p>PIM: 当前 {keyword} 产品线库存充足</p>
                                            </div>
                                        }>
                                            <span className="!rounded-button bg-white px-3 py-1 text-xs font-medium text-gray-600 border cursor-pointer hover:bg-gray-100">
                                                {keyword}
                                            </span>
                                        </Tooltip>
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