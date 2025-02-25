'use client';

import React from 'react';
import { BulbOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BulbOutlined className="text-indigo-600 text-2xl" />
          <h1 className="text-xl font-semibold text-gray-900">产品创新工作台</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="!rounded-button bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
            <SaveOutlined className="mr-2" />
            保存项目
          </button>
          <button className="!rounded-button bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-200">
            <SettingOutlined className="mr-2" />
            设置
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 