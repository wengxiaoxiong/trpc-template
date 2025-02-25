'use client';

import React from 'react';
import Header from './Header';
import DataSources from './DataSources';
import InnovationJourney from './InnovationJourney';
import Chat from './Chat';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* 左侧栏 - 创新旅程 */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-y-auto h-[calc(100vh-6rem)]">
          <h2 className="text-lg font-medium text-gray-900 mb-4">创新旅程</h2>
          <InnovationJourney />
        </div>
        
        {/* 中间栏 - 聊天区域 */}
        <div className="col-span-6 bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-6rem)]">
          <div className="bg-indigo-600 text-white p-3">
            <h2 className="text-lg font-medium">创新助手</h2>
            <p className="text-xs text-indigo-100">已选中的概念和数据将用于分析和建议</p>
          </div>
          
          <Chat />
        </div>
        
        {/* 右侧栏 - 数据源 */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-y-auto h-[calc(100vh-6rem)]">
          <h2 className="text-lg font-medium text-gray-900 mb-4">数据源</h2>
          <DataSources />
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 