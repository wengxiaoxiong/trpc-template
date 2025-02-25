'use client';

import React from 'react';
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Concept } from '../types';
import { useRecoilState } from 'recoil';
import { inputMessageState, messagesState, selectedConceptForInputState } from '../recoil/atoms';

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
  const [messages, setMessages] = useRecoilState(messagesState);
  const [inputMessage, setInputMessageState] = useRecoilState(inputMessageState);
  const [selectedConceptForInput, setSelectedConceptForInput] = useRecoilState(selectedConceptForInputState);

  const handleConceptClick = () => {
    // 如果nextStage为null，将概念添加到输入区域
    if (concept.nextStage === null) {
      // 设置选中的概念到输入区域
      setSelectedConceptForInput(concept);
      
      // 可以设置一个默认的讨论文本
      const defaultMessage = `我想基于这个方案进行讨论：`;
      if (setInputMessage) {
        setInputMessage(defaultMessage);
      } else {
        setInputMessageState(defaultMessage);
      }
      
      // 聚焦到输入框
      setTimeout(() => {
        const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
        if (chatInput) {
          chatInput.focus();
        }
      }, 100);
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