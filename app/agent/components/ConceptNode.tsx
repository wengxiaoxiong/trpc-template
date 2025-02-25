'use client';

import React from 'react';
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Concept } from '../types';

interface ConceptNodeProps {
  concept: Concept;
  onConceptSelect: (conceptId: number) => void;
  isSelected: boolean;
  setInputMessage?: (message: string) => void;
}

const ConceptNode: React.FC<ConceptNodeProps> = ({ 
  concept, 
  onConceptSelect, 
  isSelected, 
  setInputMessage 
}) => {
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

export default ConceptNode; 