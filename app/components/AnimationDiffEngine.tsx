'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, Edge } from 'reactflow';

// 帧类型定义
interface Frame {
  id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
}

// 过渡元素类型
type TransitionElement = {
  type: string;
  id: string;
  data?: any;
  initial?: any;
  animate?: any;
};

interface AnimationDiffEngineProps {
  frames: Frame[];
  currentFrameIndex: number;
  transitionDuration?: number;
  onTransitionComplete?: () => void;
}

const AnimationDiffEngine: React.FC<AnimationDiffEngineProps> = ({
  frames,
  currentFrameIndex,
  transitionDuration = 0.8,
  onTransitionComplete
}) => {
  const [direction, setDirection] = useState<number>(1); // 1=forward, -1=backward
  const [prevIndex, setPrevIndex] = useState<number>(0);
  const [transitionElements, setTransitionElements] = useState<TransitionElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 监测索引变化以确定方向
  useEffect(() => {
    if (currentFrameIndex > prevIndex) {
      setDirection(1); // forward
    } else if (currentFrameIndex < prevIndex) {
      setDirection(-1); // backward
    }
    setPrevIndex(currentFrameIndex);
  }, [currentFrameIndex, prevIndex]);
  
  // 计算两帧之间的差异，并生成过渡元素
  useEffect(() => {
    if (!frames[currentFrameIndex]) return;
    
    const currentFrame = frames[currentFrameIndex];
    const nextFrameIndex = Math.min(currentFrameIndex + direction, frames.length - 1);
    const nextFrame = frames[nextFrameIndex];
    
    if (!nextFrame || currentFrame === nextFrame) {
      // 没有下一帧或当前帧就是下一帧，只渲染当前帧
      const elements: TransitionElement[] = currentFrame.nodes.map(node => ({
        type: 'node-current',
        id: node.id,
        data: node
      }));
      
      // 边单独处理为自己的类型，而不是合并到节点数组
      currentFrame.edges.forEach(edge => {
        elements.push({
          type: 'edge-current',
          id: edge.id,
          data: edge
        });
      });
      
      setTransitionElements(elements);
      return;
    }
    
    // 分析节点变化（新增、移除、移动、更新）
    const currentNodes = new Map(currentFrame.nodes.map(node => [node.id, node]));
    const nextNodes = new Map(nextFrame.nodes.map(node => [node.id, node]));
    
    // 分析边变化
    const currentEdges = new Map(currentFrame.edges.map(edge => [edge.id, edge]));
    const nextEdges = new Map(nextFrame.edges.map(edge => [edge.id, edge]));
    
    // 根据差异生成过渡动画
    const transitionItems: TransitionElement[] = [];
    
    // 处理保留节点的位置变化
    nextFrame.nodes.forEach(nextNode => {
      const currentNode = currentNodes.get(nextNode.id);
      if (currentNode) {
        // 节点保留但可能移动或更新
        transitionItems.push({
          type: 'node-update',
          id: nextNode.id,
          initial: {
            x: currentNode.position.x,
            y: currentNode.position.y,
            ...currentNode.data
          },
          animate: {
            x: nextNode.position.x,
            y: nextNode.position.y,
            ...nextNode.data
          }
        });
      } else {
        // 新增节点
        transitionItems.push({
          type: 'node-add',
          id: nextNode.id,
          data: nextNode
        });
      }
    });
    
    // 处理删除的节点
    currentFrame.nodes.forEach(currentNode => {
      if (!nextNodes.has(currentNode.id)) {
        transitionItems.push({
          type: 'node-remove',
          id: currentNode.id,
          data: currentNode
        });
      }
    });
    
    // 处理边的变化
    nextFrame.edges.forEach(nextEdge => {
      const currentEdge = currentEdges.get(nextEdge.id);
      if (currentEdge) {
        // 边保留
        transitionItems.push({
          type: 'edge-update',
          id: nextEdge.id,
          initial: currentEdge,
          animate: nextEdge
        });
      } else {
        // 新增边
        transitionItems.push({
          type: 'edge-add',
          id: nextEdge.id,
          data: nextEdge
        });
      }
    });
    
    // 处理删除的边
    currentFrame.edges.forEach(currentEdge => {
      if (!nextEdges.has(currentEdge.id)) {
        transitionItems.push({
          type: 'edge-remove',
          id: currentEdge.id,
          data: currentEdge
        });
      }
    });
    
    setTransitionElements(transitionItems);
    
    // 过渡完成后触发回调
    if (onTransitionComplete) {
      const timer = setTimeout(onTransitionComplete, transitionDuration * 1000);
      return () => clearTimeout(timer);
    }
  }, [frames, currentFrameIndex, direction, onTransitionComplete, transitionDuration]);
  
  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] border border-gray-200 rounded-md overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-gray-50" style={{ 
        backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }}></div>
      
      {/* 渲染过渡动画 */}
      <AnimatePresence>
        {transitionElements.map(element => {
          switch (element.type) {
            case 'node-current':
            case 'node-update':
              return (
                <motion.div
                  key={`node-${element.id}`}
                  initial={element.initial || { 
                    opacity: 1, 
                    x: element.data?.position?.x || 0, 
                    y: element.data?.position?.y || 0 
                  }}
                  animate={element.animate || { 
                    opacity: 1, 
                    x: element.data?.position?.x || 0, 
                    y: element.data?.position?.y || 0 
                  }}
                  transition={{ duration: transitionDuration }}
                  className="absolute"
                >
                  <div 
                    className="w-40 h-20 bg-blue-500 rounded-md shadow-md flex items-center justify-center text-white"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    {(element.animate?.label || element.data?.data?.label || element.id)}
                  </div>
                </motion.div>
              );
            case 'node-add':
              return (
                <motion.div
                  key={`node-${element.id}`}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    x: element.data.position.x,
                    y: element.data.position.y
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: element.data.position.x,
                    y: element.data.position.y
                  }}
                  transition={{ duration: transitionDuration }}
                  className="absolute"
                >
                  <div 
                    className="w-40 h-20 bg-green-500 rounded-md shadow-md flex items-center justify-center text-white"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    {element.data.data.label || element.id}
                  </div>
                </motion.div>
              );
            case 'node-remove':
              return (
                <motion.div
                  key={`node-${element.id}`}
                  initial={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: element.data.position.x,
                    y: element.data.position.y
                  }}
                  animate={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    x: element.data.position.x,
                    y: element.data.position.y
                  }}
                  transition={{ duration: transitionDuration }}
                  className="absolute"
                >
                  <div 
                    className="w-40 h-20 bg-red-500 rounded-md shadow-md flex items-center justify-center text-white"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    {element.data.data.label || element.id}
                  </div>
                </motion.div>
              );
            // Edge渲染更复杂，这里给出一个简化实现
            case 'edge-current':
            case 'edge-update':
            case 'edge-add':
            case 'edge-remove':
              // 简化版本先不渲染边
              return null;
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnimationDiffEngine; 