'use client';

import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { stagesState, selectedConceptIdsState, inputMessageState, selectedConceptForInputState } from '../recoil/atoms';
import ConceptCard from './ConceptCard';
import { Concept, Stage } from '../types';

interface BotConceptSuggestionsProps {
  concepts: Concept[];
}

const BotConceptSuggestions: React.FC<BotConceptSuggestionsProps> = ({ concepts }) => {
  const [stages, setStages] = useRecoilState(stagesState);
  const [selectedConceptIds, setSelectedConceptIds] = useRecoilState(selectedConceptIdsState);
  const [inputMessage, setInputMessage] = useRecoilState(inputMessageState);
  const [selectedConceptForInput, setSelectedConceptForInput] = useRecoilState(selectedConceptForInputState);

  // 查找概念对应的阶段ID
  const findStageIdForConcept = (conceptId: number): number | null => {
    // 递归查找函数
    const findInStages = (stages: Stage[]): number | null => {
      for (const stage of stages) {
        // 检查当前阶段的概念
        if (stage.concepts.some(c => c.id === conceptId)) {
          return stage.id;
        }
        
        // 递归检查下一级阶段
        for (const concept of stage.concepts) {
          if (concept.nextStage) {
            const result = findInStages([concept.nextStage]);
            if (result) return result;
          }
        }
      }
      return null;
    };
    
    return findInStages(stages);
  };

  // 查找概念在stages中的完整对象
  const findConceptInStages = (conceptId: number): Concept | null => {
    // 递归查找函数
    const findInStages = (stages: Stage[]): Concept | null => {
      for (const stage of stages) {
        // 检查当前阶段的概念
        const foundConcept = stage.concepts.find(c => c.id === conceptId);
        if (foundConcept) {
          return foundConcept;
        }
        
        // 递归检查下一级阶段
        for (const concept of stage.concepts) {
          if (concept.nextStage) {
            const result = findInStages([concept.nextStage]);
            if (result) return result;
          }
        }
      }
      return null;
    };
    
    return findInStages(stages);
  };

  // 处理概念选择
  const handleConceptSelect = (conceptId: number) => {
    // 首先在stages中查找完整的concept对象
    const fullConcept = findConceptInStages(conceptId);
    
    // 如果找不到完整概念，使用聊天中的概念
    const concept = fullConcept || concepts.find(c => c.id === conceptId);
    
    if (!concept) {
      console.error(`找不到概念ID ${conceptId}`);
      return;
    }

    // 如果概念没有nextStage，将其添加到输入区域
    if (!concept.nextStage) {
      // 设置选中的概念到输入区域
      setSelectedConceptForInput(concept);
      
      // 设置一个默认的讨论文本
      setInputMessage(`我想基于这个方案进行讨论：`);
      
      // 聚焦到输入框
      setTimeout(() => {
        const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
        if (chatInput) {
          chatInput.focus();
        }
      }, 100);
      return;
    }

    const stageId = findStageIdForConcept(conceptId);
    if (!stageId) {
      console.error(`找不到概念ID ${conceptId} 对应的阶段`);
      return;
    }

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
      
      // 收集所有阶段的信息（包括嵌套阶段）
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
  };

  return (
    <div className="space-y-3 my-3">
      <div className="text-sm font-medium text-gray-500 mb-2">推荐方案：</div>
      <div className="grid grid-cols-1 gap-3">
        {concepts.map((concept) => (
          <div key={concept.id} onClick={() => handleConceptSelect(concept.id)} className="cursor-pointer">
            <ConceptCard concept={concept} isInChat={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotConceptSuggestions; 