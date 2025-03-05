'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
    });

    const renderDiagram = async () => {
      if (!code) return;
      
      try {
        setError(null);
        const uniqueId = `mermaid-diagram-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        const { svg } = await mermaid.render(uniqueId, code);
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid render error:', e);
        setError(e instanceof Error ? e.message : '渲染错误');
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className={`text-red-500 p-4 border border-red-300 rounded ${className}`}>
        <h3 className="font-bold">渲染错误</h3>
        <pre className="text-sm whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div 
      className={className}
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidRenderer; 