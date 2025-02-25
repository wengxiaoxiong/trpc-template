export interface DataPoint {
  type: '水晶球' | '外网' | 'PIM';
  description: string;
  confidence?: number; // 数据可信度，0-100
  source?: string; // 数据来源
  timestamp?: string; // 数据时间戳
}

export interface ConceptMetrics {
  marketPotential: number; // 市场潜力评分，0-100
  feasibility: number; // 可行性评分，0-100
  innovationLevel: number; // 创新程度，0-100
  costEfficiency: number; // 成本效益，0-100
}

export interface Concept {
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

export interface Stage {
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

export interface WebSource {
  title: string;
  url: string;
  summary: string;
}

export interface SkuItem {
  id: string;
  name: string;
  image?: string;
  price?: number;
  brandName?: string;
  category?: string;
  tags?: string[];
}

export interface UserCommentNLP {
  sentiment: 'positive' | 'negative' | 'neutral';
  aspect: string;
  count: number;
  examples?: string[];
  percentage?: number;
}

export interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
  dataSources?: {
    keywords?: string[];
    insights?: string[];
    marketTrends?: {
      growth: string;
      category: string;
      periodChange?: string;
      trendDirection?: 'up' | 'down' | 'stable';
    };
    webSources?: WebSource[];
    products?: Array<{
      name: string;
      brand: string;
      rating: number;
    }>;
    skuList?: SkuItem[];
    userCommentAnalysis?: UserCommentNLP[];
  };
}

export interface TopProduct {
  name: string;
  brand: string;
  rating: number;
  reviews: number;
  keywords: string[];
}

export interface UserRequirement {
  id: number;
  content: string;
  sourceMessage?: string;  // 源自哪条用户消息
  confidence: number;      // AI的置信度，0-100
  timestamp: string;       // 创建时间
  edited?: boolean;        // 是否被用户编辑过
} 