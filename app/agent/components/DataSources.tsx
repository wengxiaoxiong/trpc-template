'use client';

import React, { useState } from 'react';
import { EditOutlined, CheckOutlined, CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { UserRequirement } from '../types';
import { initialUserRequirements } from '../recoil/initialData';

const DataSources: React.FC = () => {
  const [requirements, setRequirements] = useState<UserRequirement[]>(initialUserRequirements);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [newRequirement, setNewRequirement] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const handleEdit = (req: UserRequirement) => {
    setEditingId(req.id);
    setEditContent(req.content);
  };

  const handleSave = (id: number) => {
    setRequirements(requirements.map(req => 
      req.id === id 
        ? { ...req, content: editContent, edited: true } 
        : req
    ));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: number) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSaveNew = () => {
    if (newRequirement.trim() === '') {
      setIsAddingNew(false);
      return;
    }
    
    const newId = requirements.length > 0 
      ? Math.max(...requirements.map(req => req.id)) + 1 
      : 1;
      
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    setRequirements([
      ...requirements,
      {
        id: newId,
        content: newRequirement,
        confidence: 100,
        timestamp: timestamp,
        edited: false
      }
    ]);
    
    setNewRequirement('');
    setIsAddingNew(false);
  };

  return (
    <div className="w-full">
      <div className="p-3 bg-gray-50 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">您的需求与喜好</h4>
        <p className="text-xs text-gray-500 mb-3">
          这是AI总结出您的需求喜好，您可以做一个参考，如果和您的想法不一致您可以任意编辑这个描述
        </p>
        <div className="space-y-3">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white p-3 rounded border">
              {editingId === req.id ? (
                <div className="flex flex-col space-y-2">
                  <textarea
                    className="p-2 border rounded text-sm w-full"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleCancel()} 
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <CloseOutlined />
                    </button>
                    <button 
                      onClick={() => handleSave(req.id)} 
                      className="p-1 text-green-500 hover:bg-green-50 rounded"
                    >
                      <CheckOutlined />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-800 flex-1">{req.content}</div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(req)}
                      className="p-1 text-gray-400 hover:text-indigo-500 hover:bg-gray-100 rounded"
                    >
                      <EditOutlined />
                    </button>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              )}
              {req.edited && (
                <div className="mt-1 text-xs text-indigo-500">已编辑</div>
              )}
            </div>
          ))}
          
          {isAddingNew ? (
            <div className="bg-white p-3 rounded border">
              <div className="flex flex-col space-y-2">
                <textarea
                  className="p-2 border rounded text-sm w-full"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  rows={2}
                  placeholder="请输入新的需求或喜好..."
                />
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => handleCancel()} 
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <CloseOutlined />
                  </button>
                  <button 
                    onClick={handleSaveNew} 
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                  >
                    <CheckOutlined />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddNew}
              className="w-full p-2 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:border-indigo-500 transition-colors"
            >
              <PlusOutlined className="mr-1" />
              <span>添加需求</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSources; 