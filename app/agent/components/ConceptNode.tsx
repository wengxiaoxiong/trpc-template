'use client';

import React, { useState } from 'react';
import { InfoCircleOutlined, CheckCircleOutlined, ExpandOutlined } from '@ant-design/icons';
import { Concept } from '../types';
import { useRecoilState } from 'recoil';
import { inputMessageState, messagesState, selectedConceptForInputState } from '../recoil/atoms';
import ConceptDetailModal from './ConceptDetailModal';

interface ConceptNodeProps {
  concept: Concept;
  onConceptSelect: (conceptId: number) => void;
  isSelected: boolean;
  setInputMessage?: (message: string) => void;
  onConceptChange?: (updatedConcept: Concept) => void;
}

const ConceptNode: React.FC<ConceptNodeProps> = ({ 
  concept, 
  onConceptSelect, 
  isSelected,
  setInputMessage,
  onConceptChange
}) => {
  const [messages, setMessages] = useRecoilState(messagesState);
  const [inputMessage, setInputMessageState] = useRecoilState(inputMessageState);
  const [selectedConceptForInput, setSelectedConceptForInput] = useRecoilState(selectedConceptForInputState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<Concept>(concept);

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

  // 查看详情
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // 保存概念更新
  const handleConceptUpdate = (updatedConcept: Concept) => {
    // 更新本地状态
    setCurrentConcept(updatedConcept);
    
    // 传递更新到父组件
    if (onConceptChange) {
      onConceptChange(updatedConcept);
    }
    
    // 关闭模态框
    setIsModalVisible(false);
    
    // 如果使用了 Recoil 等状态管理，这里也可以更新全局状态
    // 例如，更新 concepts 列表中的对应项目
  };

  return (
    <>
      <div
        className={`p-3 border rounded-md shadow-sm cursor-pointer transition-all duration-200 relative
            ${isSelected ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
        `}
        onClick={handleConceptClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className="text-sm font-semibold">{currentConcept.name}</h4>
              {currentConcept.tags && currentConcept.tags.length > 0 && (
                <div className="ml-2 flex flex-wrap gap-1">
                  {currentConcept.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                  {currentConcept.tags.length > 2 && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">+{currentConcept.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">{currentConcept.description}</p>
          </div>
          <div className="ml-2 flex flex-col items-center">
            <div className={`text-lg font-bold ${getScoreColor(currentConcept.score)}`}>
              {currentConcept.score}
            </div>
            <div className="text-xs text-gray-500">评分</div>
          </div>
          {isSelected && <CheckCircleOutlined className="text-indigo-500 text-lg ml-2 absolute top-2 right-2" />}
        </div>

        {currentConcept.dataPoints && currentConcept.dataPoints.length > 0 && (
          <div className="mt-2">
            <ul className="space-y-1">
              {currentConcept.dataPoints.map((dp, index) => (
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

        {/* 查看详情按钮 */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleViewDetails}
            className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 transition-colors z-10"
          >
            <ExpandOutlined className="mr-1" />
            查看详情
          </button>
        </div>
      </div>

      {/* 详情模态框 */}
      {isModalVisible && (
        <ConceptDetailModal
          concept={currentConcept}
          onClose={handleModalClose}
          onSave={handleConceptUpdate}
        />
      )}
    </>
  );
};

export default ConceptNode; 