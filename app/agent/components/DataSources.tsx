'use client';

import React, { useState } from 'react';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { UserRequirement } from '../types';
import { initialUserRequirements } from '../recoil/initialData';

const DataSources: React.FC = () => {
  const [requirements, setRequirements] = useState<UserRequirement[]>(initialUserRequirements);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');

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
                  <button
                    onClick={() => handleEdit(req)}
                    className="ml-2 p-1 text-gray-400 hover:text-indigo-500 hover:bg-gray-100 rounded"
                  >
                    <EditOutlined />
                  </button>
                </div>
              )}
              {req.edited && (
                <div className="mt-1 text-xs text-indigo-500">已编辑</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataSources; 