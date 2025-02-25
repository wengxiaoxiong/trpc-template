'use client';

import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Concept } from '../types';

interface ConceptCardProps {
  concept: Concept;
  isInChat?: boolean;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ concept, isInChat = false }) => {
  // 根据得分返回颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className={`p-3 border rounded-md shadow-sm transition-all duration-200
          ${isInChat ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200'}
          ${isInChat ? 'max-w-md' : 'w-full'}
      `}
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
      </div>

      {concept.metrics && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="text-xs">
            <span className="text-gray-500">市场潜力:</span> 
            <span className="ml-1 font-medium">{concept.metrics.marketPotential}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">可行性:</span> 
            <span className="ml-1 font-medium">{concept.metrics.feasibility}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">创新度:</span> 
            <span className="ml-1 font-medium">{concept.metrics.innovationLevel}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">成本效益:</span> 
            <span className="ml-1 font-medium">{concept.metrics.costEfficiency}</span>
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

export default ConceptCard; 