'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';

interface MermaidAnimationProps {
  codes: string[];
  currentIndex: number;
  className?: string;
  transitionDuration?: number; // 过渡动画持续时间（秒）
}

const MermaidAnimation: React.FC<MermaidAnimationProps> = ({
  codes,
  currentIndex,
  className,
  transitionDuration = 0.5,
}) => {
  const [renderedSvgs, setRenderedSvgs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 渲染所有Mermaid代码
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
    });

    const renderAllDiagrams = async () => {
      try {
        setError(null);
        const svgs = await Promise.all(
          codes.map(async (code, index) => {
            try {
              // 生成不含小数点的唯一ID
              const uniqueId = `mermaid-diagram-${index}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
              const { svg } = await mermaid.render(uniqueId, code);
              return svg;
            } catch (e) {
              console.error(`Error rendering diagram ${index}:`, e);
              return `<div class="text-red-500">渲染错误: ${e instanceof Error ? e.message : '未知错误'}</div>`;
            }
          })
        );
        setRenderedSvgs(svgs);
      } catch (e) {
        console.error('Mermaid animation error:', e);
        setError(e instanceof Error ? e.message : '渲染错误');
      }
    };

    renderAllDiagrams();
  }, [codes]);

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
    <div className={`relative ${className}`} ref={containerRef}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`mermaid-${safeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration }}
          dangerouslySetInnerHTML={{ 
            __html: renderedSvgs[safeIndex] || '<div class="text-gray-400">加载中...</div>' 
          }}
          className="w-full"
        />
      </AnimatePresence>
    </div>
  );
};

export default MermaidAnimation; 