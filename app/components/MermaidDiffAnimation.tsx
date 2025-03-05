'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';

interface MermaidNode {
  id: string;
  text: string;
  type: string;
}

interface MermaidEdge {
  source: string;
  target: string;
  label?: string;
  type: string;
}

interface MermaidGraph {
  nodes: MermaidNode[];
  edges: MermaidEdge[];
}

interface MermaidDiffAnimationProps {
  codes: string[];
  currentIndex: number;
  className?: string;
  transitionDuration?: number;
  onRenderComplete?: () => void;
}

const MermaidDiffAnimation: React.FC<MermaidDiffAnimationProps> = ({
  codes,
  currentIndex,
  className,
  transitionDuration = 0.8,
  onRenderComplete
}) => {
  const [renderedSvgs, setRenderedSvgs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevIndex, setPrevIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1); // 1=forward, -1=backward

  // 处理渲染错误
  const handleRenderError = (e: any, index: number) => {
    console.error(`渲染图表 ${index} 失败:`, e);
    return `<div class="text-red-500 p-4">渲染错误: ${e instanceof Error ? e.message : '未知错误'}</div>`;
  };

  // 渲染所有图表
  useEffect(() => {
    const renderMermaidDiagrams = async () => {
      try {
        setError(null);
        setIsReady(false);
        
        // 初始化Mermaid
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'sans-serif',
        });
        
        // 渲染所有图表
        const svgs = await Promise.all(
          codes.map(async (code, index) => {
            try {
              // 使用时间戳+索引创建唯一ID，避免小数点问题
              const uniqueId = `mermaid-diagram-${index}-${Date.now()}`;
              const { svg } = await mermaid.render(uniqueId, code);
              return svg;
            } catch (e) {
              return handleRenderError(e, index);
            }
          })
        );
        
        setRenderedSvgs(svgs);
        setIsReady(true);
        if (onRenderComplete) onRenderComplete();
      } catch (e) {
        console.error('Mermaid动画渲染失败:', e);
        setError(e instanceof Error ? e.message : '渲染错误');
      }
    };
    
    renderMermaidDiagrams();
  }, [codes, onRenderComplete]);

  // 监测索引变化以确定方向
  useEffect(() => {
    if (currentIndex > prevIndex) {
      setDirection(1); // forward
    } else if (currentIndex < prevIndex) {
      setDirection(-1); // backward
    }
    setPrevIndex(currentIndex);
  }, [currentIndex, prevIndex]);

  // 确保索引在有效范围内
  const safeIndex = Math.min(Math.max(0, currentIndex), codes.length - 1);
  
  if (error) {
    return (
      <div className={`text-red-500 p-4 border border-red-300 rounded ${className}`}>
        <h3 className="font-bold">渲染错误</h3>
        <pre className="text-sm whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`mermaid-diagram-${safeIndex}`}
          initial={{ 
            opacity: 0, 
            x: direction * 20, 
            scale: direction > 0 ? 0.95 : 1.05 
          }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            x: direction * -20, 
            scale: direction > 0 ? 1.05 : 0.95 
          }}
          transition={{
            duration: transitionDuration * 0.5,
            ease: "easeInOut"
          }}
          dangerouslySetInnerHTML={{ 
            __html: renderedSvgs[safeIndex] || '<div class="flex justify-center items-center h-40">加载中...</div>' 
          }}
          className="w-full"
          style={{ 
            display: 'flex',
            justifyContent: 'center'
          }}
        />
      </AnimatePresence>
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
          <div className="text-lg font-semibold text-gray-600">渲染中...</div>
        </div>
      )}
    </div>
  );
};

export default MermaidDiffAnimation; 