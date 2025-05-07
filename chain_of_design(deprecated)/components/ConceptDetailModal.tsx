'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Concept, DataPoint } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 定义关键帧动画和按钮样式
const aiButtonAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  
  /* 为Markdown内容区域添加特殊样式 */
  #detailContent,
  #reflectionContent {
    -webkit-user-select: text;
    user-select: text;
    cursor: text;
    position: relative;
  }
  
  /* 禁用浏览器默认的复制选择样式，我们将使用自定义样式 */
  #detailContent ::selection,
  #reflectionContent ::selection {
    background: rgba(66, 153, 225, 0.3) !important;
    color: inherit !important;
  }
  
  /* AI编辑按钮的交互效果 */
  .ai-edit-button {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .ai-edit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3) !important;
  }
  
  .ai-edit-button:active {
    transform: translateY(1px);
  }
  
  /* 添加自定义动画类 */
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

// 防抖函数
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 限流函数
function throttle(func: Function, limit: number) {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number = 0;
  return function(this: unknown, ...args: any[]) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

interface ConceptDetailModalProps {
  concept: Concept;
  onClose: () => void;
  onSave: (updatedConcept: Concept) => void;
}

const ConceptDetailModal: React.FC<ConceptDetailModalProps> = ({
  concept,
  onClose,
  onSave,
}) => {
  const [editedConcept, setEditedConcept] = useState<Concept>({ ...concept });
  const [newTag, setNewTag] = useState<string>('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(concept.dataPoints || []);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // AI编辑相关状态
  const [showAIButton, setShowAIButton] = useState(false);
  const [aiButtonPosition, setAiButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [activeTextarea, setActiveTextarea] = useState<'detailContent' | 'reflectionContent' | null>(null);
  
  // 保存原始选择信息，用于恢复
  const originalSelectionRef = useRef<{
    text: string,
    range: Range | null,
    area: 'detailContent' | 'reflectionContent' | null
  }>({
    text: '',
    range: null,
    area: null
  });
  
  // 编辑模式状态
  const [editingDetail, setEditingDetail] = useState(false);
  const [editingReflection, setEditingReflection] = useState(false);
  
  // 跟踪最近的鼠标位置
  const lastMousePositionRef = useRef({ x: 0, y: 0 });
  
  // 监听鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // 防止在Markdown区域中的选择被意外取消
  useEffect(() => {
    // 阻止浏览器默认的双击选择单词行为
    const preventDefaultSelection = (e: MouseEvent) => {
      if (editingDetail || editingReflection) return; // 编辑模式下不干预
      
      const target = e.target as HTMLElement;
      const isInDetailContent = document.getElementById('detailContent')?.contains(target);
      const isInReflectionContent = document.getElementById('reflectionContent')?.contains(target);
      
      if (isInDetailContent || isInReflectionContent) {
        // 不阻止默认行为，但我们需要处理自定义的选择行为
      }
    };
    
    // 监听双击事件
    document.addEventListener('dblclick', preventDefaultSelection);
    
    return () => {
      document.removeEventListener('dblclick', preventDefaultSelection);
    };
  }, [editingDetail, editingReflection]);
  
  // 使用useCallback和节流来优化选择处理
  const handleSelectionChange = useCallback(
    throttle(() => {
      // 如果任一内容区域处于编辑模式，不显示AI编辑按钮
      if (editingDetail || editingReflection) {
        setShowAIButton(false);
        return;
      }
      
      // 使用更可靠的方法获取当前选择
      const selection = window.getSelection();
      
      if (!selection) {
        setShowAIButton(false);
        return;
      }
      
      const selectedText = selection.toString().trim();
      
      if (selectedText === '') {
        setShowAIButton(false);
        return;
      }
      
      // 检查是否在我们的内容区域内选择
      const detailContentEl = document.getElementById('detailContent');
      const reflectionContentEl = document.getElementById('reflectionContent');
      
      if (!detailContentEl || !reflectionContentEl) {
        return;
      }
      
      let textareaField: 'detailContent' | 'reflectionContent' | null = null;
      
      // 使用range比较精确地确定选择区域
      try {
        // 保存原始选择范围用于后续恢复
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const startContainer = range.startContainer;
          const endContainer = range.endContainer;
          
          // 检查选择的起点和终点是否都在同一个内容区域内
          const isStartInDetailContent = detailContentEl.contains(startContainer);
          const isEndInDetailContent = detailContentEl.contains(endContainer);
          const isStartInReflectionContent = reflectionContentEl.contains(startContainer);
          const isEndInReflectionContent = reflectionContentEl.contains(endContainer);
          
          if (isStartInDetailContent && isEndInDetailContent) {
            textareaField = 'detailContent';
            // 保存原始选择信息
            originalSelectionRef.current = {
              text: selectedText,
              range: range.cloneRange(),
              area: 'detailContent'
            };
          } else if (isStartInReflectionContent && isEndInReflectionContent) {
            textareaField = 'reflectionContent';
            // 保存原始选择信息
            originalSelectionRef.current = {
              text: selectedText,
              range: range.cloneRange(),
              area: 'reflectionContent'
            };
          } else {
            // 选择跨越了不同区域或在内容区域外
            setShowAIButton(false);
            return;
          }
          
          if (textareaField) {
            console.log("Selection detected:", selectedText.substring(0, 20) + "...", "in", textareaField);
            
            setSelectedText(selectedText);
            setActiveTextarea(textareaField);
            
            // 使用原始选择范围计算位置
            const rect = range.getBoundingClientRect();
            
            if (rect.width === 0 && rect.height === 0) {
              // 无效的选区
              setShowAIButton(false);
              return;
            }
            
            // 使用更简单、更可靠的方法定位按钮
            // 直接将按钮定位到选区的左上角上方
            const buttonTop = Math.max(10, window.scrollY + rect.top - 50);
            const buttonLeft = Math.max(10, window.scrollX + rect.left);
            
            setAiButtonPosition({
              top: buttonTop,
              left: buttonLeft
            });
            
            // 显示AI编辑按钮
            setShowAIButton(true);
          }
        }
      } catch (error) {
        console.error("Error handling selection:", error);
        setShowAIButton(false);
      }
    }, 100),
    [editingDetail, editingReflection]
  );
  
  // 使用更可靠的方法监听选择 - 结合mousedown、mousemove和mouseup
  useEffect(() => {
    // 定义一个变量跟踪当前是否正在选择文本
    let isSelecting = false;
    
    // 监听mousedown事件，准备捕获选择
    const handleMouseDown = (e: MouseEvent) => {
      // 只有在左键点击时才跟踪选择
      if (e.button === 0) {
        isSelecting = true;
        // 不立即隐藏按钮，等待确认用户真的在进行新的选择
      }
    };
    
    // 监听mousemove事件，检测拖动选择
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      
      // 不做任何处理，让浏览器处理选择
    };
    
    // 监听mouseup事件，处理选择
    const handleMouseUp = (e: MouseEvent) => {
      if (!isSelecting) return;
      isSelecting = false;
      
      // 使用短延迟确保浏览器已经完成了选择
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
          handleSelectionChange();
        }
      }, 10);
    };
    
    // 监听keydown事件，支持键盘选择
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果按下了Shift+方向键，用户可能正在选择文本
      if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.toString().trim() !== '') {
            handleSelectionChange();
          }
        }, 10);
      }
    };
    
    // 只在内容区域监听事件
    const contentElements = ['detailContent', 'reflectionContent'];
    
    // 为每个内容区域单独添加事件监听
    contentElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseup', handleMouseUp);
        element.addEventListener('keydown', handleKeyDown);
      }
    });
    
    // 点击其他区域时隐藏按钮，但不影响已选择的文本
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ai-edit-button') && !target.closest('#detailContent') && !target.closest('#reflectionContent')) {
        setShowAIButton(false);
      }
    };
    
    document.addEventListener('mousedown', handleDocumentClick);
    
    return () => {
      contentElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.removeEventListener('mousedown', handleMouseDown);
          element.removeEventListener('mousemove', handleMouseMove);
          element.removeEventListener('mouseup', handleMouseUp);
          element.removeEventListener('keydown', handleKeyDown);
        }
      });
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [handleSelectionChange]);
  
  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 阻止滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // 处理AI编辑按钮点击 - 优化以保持选择
  const handleAIEditClick = () => {
    setShowAIModal(true);
    
    // 不要立即隐藏按钮，让用户可以继续看到它，直到弹窗显示
    setTimeout(() => {
      setShowAIButton(false);
    }, 50);
    
    // 不尝试保持选择状态，因为这可能导致错误和不一致
  };
  
  // 应用AI编辑 - 优化
  const applyAIEdit = () => {
    if (activeTextarea && selectedText && aiEditPrompt.trim()) {
      // 替换所选文本的逻辑
      const originalText = activeTextarea === 'detailContent' 
        ? editedConcept.detailContent || ''
        : editedConcept.reflectionContent || '';
        
      // 确保能够准确替换所选文本 - 使用正则表达式以匹配可能的换行符差异
      if (originalText.includes(selectedText)) {
        const updatedText = originalText.replace(selectedText, aiEditPrompt);
        
        // 更新state
        handleInputChange(activeTextarea, updatedText);
        
        // 关闭弹窗
        setShowAIModal(false);
        setAiEditPrompt('');
        
        // 显示成功提示
        console.log("AI编辑已应用");
      } else {
        // 使用更宽松的匹配
        const escapedText = selectedText
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
          .replace(/\s+/g, '\\s+'); // 将空白字符替换为通配空白
        
        const regex = new RegExp(escapedText, 'i');
        if (regex.test(originalText)) {
          const updatedText = originalText.replace(regex, aiEditPrompt);
          
          // 更新state
          handleInputChange(activeTextarea, updatedText);
          
          // 关闭弹窗
          setShowAIModal(false);
          setAiEditPrompt('');
          
          console.log("AI编辑已应用(使用模糊匹配)");
        } else {
          console.error("无法找到所选文本，可能已被修改");
          alert("无法应用编辑，请重新选择文本并尝试");
        }
      }
    } else if (!aiEditPrompt.trim()) {
      alert("请输入要替换的内容");
    }
  };

  // 基本信息更新
  const handleInputChange = (field: keyof Concept, value: any) => {
    setEditedConcept((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 指标更新
  const handleMetricsChange = (metricField: string, value: number) => {
    setEditedConcept((prev) => {
      const updatedMetrics = {
        ...(prev.metrics || {
          marketPotential: 0,
          feasibility: 0,
          innovationLevel: 0,
          costEfficiency: 0
        }),
        [metricField]: value
      };
      
      return {
        ...prev,
        metrics: updatedMetrics
      };
    });
  };

  // 标签处理
  const handleAddTag = () => {
    if (newTag && (!editedConcept.tags || !editedConcept.tags.includes(newTag))) {
      const tags = [...(editedConcept.tags || []), newTag];
      setEditedConcept(prev => ({ ...prev, tags }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const tags = editedConcept.tags?.filter(tag => tag !== tagToRemove) || [];
    setEditedConcept(prev => ({ ...prev, tags }));
  };

  // DataPoint 处理
  const handleAddDataPoint = () => {
    const newDataPoint: DataPoint = {
      type: '水晶球',
      description: '',
      confidence: 70,
    };
    setDataPoints([...dataPoints, newDataPoint]);
  };

  const handleRemoveDataPoint = (index: number) => {
    const newDataPoints = [...dataPoints];
    newDataPoints.splice(index, 1);
    setDataPoints(newDataPoints);
  };

  const handleDataPointChange = (index: number, field: keyof DataPoint, value: any) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index] = {
      ...newDataPoints[index],
      [field]: value,
    };
    setDataPoints(newDataPoints);
  };

  // 保存所有更改
  const handleSave = () => {
    const updatedConcept: Concept = {
      ...editedConcept,
      dataPoints
    };
    onSave(updatedConcept);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* AI编辑按钮 - 改进样式和定位 */}
        {showAIButton && (
          <div 
            className="fixed z-[9999] bg-blue-600 text-white px-5 py-3 rounded-md shadow-lg cursor-pointer hover:bg-blue-700 transition-colors flex items-center ai-edit-button"
            style={{ 
              top: `${aiButtonPosition.top}px`, 
              left: `${aiButtonPosition.left}px`,
              animation: 'fadeIn 0.2s ease-out, pulse 2s infinite',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              border: '2px solid #fff',
              fontSize: '16px',
              fontWeight: 'bold',
              pointerEvents: 'auto',
              willChange: 'transform', // 优化动画性能
              zIndex: 9999
            }}
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡
              handleAIEditClick();
            }}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI编辑
          </div>
        )}
        
        {/* AI编辑Modal */}
        {showAIModal && (
          <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
              <h3 className="text-lg font-medium text-gray-800 mb-4">AI编辑</h3>
              <p className="text-sm text-gray-600 mb-3">已选择文本: <span className="font-medium bg-blue-50 px-2 py-1 rounded text-blue-800">{selectedText}</span></p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">请输入您希望修改的内容：</label>
                <textarea
                  value={aiEditPrompt}
                  onChange={(e) => setAiEditPrompt(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新的内容..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={applyAIEdit}
                  className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">概念详情</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* 基本信息 */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">概念名称</label>
                <input
                  type="text"
                  value={editedConcept.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">概念描述</label>
                <textarea
                  value={editedConcept.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">综合评分</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editedConcept.score}
                    onChange={(e) => handleInputChange('score', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editedConcept.tags?.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center bg-blue-50 text-blue-700 text-xs rounded px-2 py-1"
                      >
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="添加标签"
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-r-md hover:bg-indigo-700 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 评估指标 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">评估指标</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">市场潜力</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editedConcept.metrics?.marketPotential || 0}
                    onChange={(e) => handleMetricsChange('marketPotential', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">可行性</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editedConcept.metrics?.feasibility || 0}
                    onChange={(e) => handleMetricsChange('feasibility', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">创新度</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editedConcept.metrics?.innovationLevel || 0}
                    onChange={(e) => handleMetricsChange('innovationLevel', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">成本效益</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editedConcept.metrics?.costEfficiency || 0}
                    onChange={(e) => handleMetricsChange('costEfficiency', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            {/* 详情内容和反思内容 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">详细内容</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">详情内容</label>
                  <button
                    onClick={() => setEditingDetail(!editingDetail)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {editingDetail ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        完成编辑
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        编辑内容
                      </>
                    )}
                  </button>
                </div>
                
                {editingDetail ? (
                  <textarea
                    value={editedConcept.detailContent || ''}
                    onChange={(e) => handleInputChange('detailContent', e.target.value)}
                    rows={6}
                    placeholder="请输入详情内容，支持Markdown格式..."
                    className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div 
                    id="detailContent"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 min-h-[150px] overflow-auto prose prose-sm max-w-none select-text"
                    onMouseDown={(e) => e.stopPropagation()} // 防止事件冒泡对选择产生影响
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-1" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-3 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-semibold mt-2 mb-1" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="mt-0.5 mb-1 pl-5" {...props} />,
                        ol: ({node, ...props}) => <ol className="mt-0.5 mb-1 pl-5" {...props} />,
                        li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                        table: ({node, ...props}) => <table className="border-collapse border border-gray-300 my-3 w-full" {...props} />,
                        thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                        tbody: ({node, ...props}) => <tbody {...props} />,
                        tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                        th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left" {...props} />,
                        td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />
                      }}
                    >
                      {editedConcept.detailContent || '*无内容*'}
                    </ReactMarkdown>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {!editingDetail && "选择文本可以使用AI辅助编辑"}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">反思内容</label>
                  <button
                    onClick={() => setEditingReflection(!editingReflection)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {editingReflection ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        完成编辑
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        编辑内容
                      </>
                    )}
                  </button>
                </div>
                
                {editingReflection ? (
                  <textarea
                    value={editedConcept.reflectionContent || ''}
                    onChange={(e) => handleInputChange('reflectionContent', e.target.value)}
                    rows={6}
                    placeholder="请输入反思内容，支持Markdown格式..."
                    className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div 
                    id="reflectionContent"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 min-h-[150px] overflow-auto prose prose-sm max-w-none select-text"
                    onMouseDown={(e) => e.stopPropagation()} // 防止事件冒泡对选择产生影响
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-1" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-3 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-semibold mt-2 mb-1" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="mt-0.5 mb-1 pl-5" {...props} />,
                        ol: ({node, ...props}) => <ol className="mt-0.5 mb-1 pl-5" {...props} />,
                        li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                        table: ({node, ...props}) => <table className="border-collapse border border-gray-300 my-3 w-full" {...props} />,
                        thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                        tbody: ({node, ...props}) => <tbody {...props} />,
                        tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                        th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left" {...props} />,
                        td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />
                      }}
                    >
                      {editedConcept.reflectionContent || '*无内容*'}
                    </ReactMarkdown>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {!editingReflection && "选择文本可以使用AI辅助编辑"}
                </div>
              </div>
            </div>
            
            {/* 数据点 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">数据点</h3>
                <button 
                  onClick={handleAddDataPoint}
                  className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  添加数据点
                </button>
              </div>
              
              {dataPoints.map((dataPoint, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => handleRemoveDataPoint(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                      <select
                        value={dataPoint.type}
                        onChange={(e) => handleDataPointChange(index, 'type', e.target.value as any)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="水晶球">水晶球</option>
                        <option value="外网">外网</option>
                        <option value="PIM">PIM</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <input
                        type="text"
                        value={dataPoint.description}
                        onChange={(e) => handleDataPointChange(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">可信度 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={dataPoint.confidence || 0}
                        onChange={(e) => handleDataPointChange(index, 'confidence', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">数据来源</label>
                      <input
                        type="text"
                        value={dataPoint.source || ''}
                        onChange={(e) => handleDataPointChange(index, 'source', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">时间戳</label>
                      <input
                        type="text"
                        value={dataPoint.timestamp || ''}
                        onChange={(e) => handleDataPointChange(index, 'timestamp', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
      {/* 添加全局样式 */}
      <style jsx global>{aiButtonAnimation}</style>
    </div>
  );
};

export default ConceptDetailModal; 