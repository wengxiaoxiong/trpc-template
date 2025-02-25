'use client';

import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Header from './Header';
import DataSources from './DataSources';
import InnovationJourney from './InnovationJourney';
import Chat from './Chat';

const MainLayout: React.FC = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex relative p-4">
        {/* 左侧栏 - 创新旅程 */}
        <div 
          className={`transition-all duration-300 flex flex-col ${
            leftPanelCollapsed 
              ? 'w-12 min-w-12' 
              : 'w-1/4 min-w-[300px] max-w-[400px]'
          }`}
        >
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
            <div className="bg-indigo-600 text-white p-3 flex items-center justify-between">
              {!leftPanelCollapsed && <h2 className="text-lg font-medium">创新旅程</h2>}
              <button 
                onClick={toggleLeftPanel}
                className="ml-auto p-1 rounded-full hover:bg-indigo-500 transition-colors"
              >
                {leftPanelCollapsed ? <RightOutlined /> : <LeftOutlined />}
              </button>
            </div>
            
            <div className={`flex-1 overflow-y-auto ${leftPanelCollapsed ? 'hidden' : 'p-4'}`}>
              <InnovationJourney />
            </div>
          </div>
        </div>
        
        {/* 中间栏 - 聊天区域 */}
        <div className={`transition-all duration-300 flex-1 mx-4`}>
          <div className="bg-white rounded-lg shadow h-full flex flex-col overflow-hidden">
            <div className="bg-indigo-600 text-white p-3">
              <h2 className="text-lg font-medium">创新助手</h2>
              <p className="text-xs text-indigo-100">已选中的概念和数据将用于分析和建议</p>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              <Chat />
            </div>
          </div>
        </div>
        
        {/* 右侧栏 - 需求与喜好 */}
        <div 
          className={`transition-all duration-300 flex flex-col ${
            rightPanelCollapsed 
              ? 'w-12 min-w-12' 
              : 'w-1/4 min-w-[300px] max-w-[400px]'
          }`}
        >
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
            <div className="bg-indigo-600 text-white p-3 flex items-center justify-between">
              {!rightPanelCollapsed && <h2 className="text-lg font-medium">需求与喜好</h2>}
              <button 
                onClick={toggleRightPanel}
                className="ml-auto p-1 rounded-full hover:bg-indigo-500 transition-colors"
              >
                {rightPanelCollapsed ? <LeftOutlined /> : <RightOutlined />}
              </button>
            </div>
            
            <div className={`flex-1 overflow-y-auto ${rightPanelCollapsed ? 'hidden' : 'p-4'}`}>
              <DataSources />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 