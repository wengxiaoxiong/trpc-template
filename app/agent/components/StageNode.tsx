'use client';

import React from 'react';
import { InfoCircleOutlined, RightOutlined } from '@ant-design/icons';
import { Stage } from '../types';
import ConceptNode from './ConceptNode';

interface StageNodeProps {
  stage: Stage;
  onConceptSelect: (stageId: number, conceptId: number) => void;
  selectedConceptIds: number[];
  setInputMessage?: (message: string) => void;
}

const StageNode: React.FC<StageNodeProps> = ({ 
  stage, 
  onConceptSelect, 
  selectedConceptIds, 
  setInputMessage 
}) => {
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
    } else if (stage.status === 'current') {
      return '当前阶段';
    } else if (stage.status === 'pending') {
      return '待处理';
    }
    return '待处理'; // 默认情况
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

export default StageNode; 