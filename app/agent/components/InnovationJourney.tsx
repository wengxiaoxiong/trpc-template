'use client';

import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { RightOutlined } from '@ant-design/icons';
import { stagesState, selectedConceptIdsState, inputMessageState } from '../recoil/atoms';
import StageNode from './StageNode';
import { Stage } from '../types';

const InnovationJourney: React.FC = () => {
  const [stages, setStages] = useRecoilState(stagesState);
  const [selectedConceptIds, setSelectedConceptIds] = useRecoilState(selectedConceptIdsState);
  const setInputMessage = useSetRecoilState(inputMessageState);

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
      const collectAllStages = (stagesList: Stage[], parentPath: string = ''): {id: number, path: string, conceptIds: number[]}[] => {
        let result: {id: number, path: string, conceptIds: number[]}[] = [];
        
        stagesList.forEach((stage, i) => {
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
  }, [stages, setStages, setSelectedConceptIds]);

  // 将setInputMessage函数传递给ConceptNode组件
  const handleSetInputMessage = useCallback((message: string) => {
    setInputMessage(message);
  }, [setInputMessage]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
          <RightOutlined className="text-indigo-500" />
        </div>
        创新旅程
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
  );
};

export default InnovationJourney; 