'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage } from '../types';

interface StageDetailModalProps {
  stage: Stage;
  onClose: () => void;
  onSave: (updatedStage: Stage) => void;
}

const StageDetailModal: React.FC<StageDetailModalProps> = ({
  stage,
  onClose,
  onSave,
}) => {
  const [editedStage, setEditedStage] = useState<Stage>({ ...stage });
  const modalRef = useRef<HTMLDivElement>(null);
  
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

  // 基本信息更新
  const handleInputChange = (field: keyof Stage, value: any) => {
    setEditedStage((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 状态切换
  const handleStatusChange = (status: 'completed' | 'current' | 'pending') => {
    setEditedStage((prev) => ({
      ...prev,
      status
    }));
  };

  // 保存所有更改
  const handleSave = () => {
    onSave(editedStage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">阶段详情编辑</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">阶段名称</label>
                <input
                  type="text"
                  value={editedStage.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">阶段描述</label>
                <textarea
                  value={editedStage.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">阶段状态</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pending')}
                      className={`px-3 py-1 rounded text-sm ${
                        editedStage.status === 'pending'
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      未开始
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('current')}
                      className={`px-3 py-1 rounded text-sm ${
                        editedStage.status === 'current'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      进行中
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('completed')}
                      className={`px-3 py-1 rounded text-sm ${
                        editedStage.status === 'completed'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      已完成
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">阶段顺序</label>
                  <input
                    type="number"
                    min="1"
                    value={editedStage.order || 1}
                    onChange={(e) => handleInputChange('order', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">完成标准</label>
                  <textarea
                    value={editedStage.completionCriteria || ''}
                    onChange={(e) => handleInputChange('completionCriteria', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="请输入完成该阶段的标准..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预计完成时间（分钟）</label>
                  <input
                    type="number"
                    min="1"
                    value={editedStage.estimatedTimeInMinutes || ''}
                    onChange={(e) => handleInputChange('estimatedTimeInMinutes', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            {/* 详情内容和反思内容 */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">详细内容</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">详情内容</label>
                <textarea
                  value={editedStage.detailContent || ''}
                  onChange={(e) => handleInputChange('detailContent', e.target.value)}
                  rows={4}
                  placeholder="请输入详情内容..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">反思内容</label>
                <textarea
                  value={editedStage.reflectionContent || ''}
                  onChange={(e) => handleInputChange('reflectionContent', e.target.value)}
                  rows={4}
                  placeholder="请输入反思内容..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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
    </div>
  );
};

export default StageDetailModal; 