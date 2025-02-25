'use client';

import React from 'react';
import { RobotOutlined, UserOutlined, LineChartOutlined, LinkOutlined } from '@ant-design/icons';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${message.type === 'bot' ? 'bg-indigo-600' : 'bg-green-500'}`}>
        {message.type === 'bot' ? <RobotOutlined /> : <UserOutlined />}
      </div>
      <div className="flex-1">
        <div className={`rounded-lg p-3 ${message.type === 'bot' ? 'bg-gray-100' : 'bg-indigo-50'}`}>
          <p className="text-gray-800">{message.content}</p>
          {message.type === 'bot' && message.dataSources && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {message.dataSources.keywords?.map((keyword, idx) => (
                  <span key={idx} className="!rounded-button bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                    {keyword}
                  </span>
                ))}
              </div>
              {message.dataSources.insights && (
                <div className="mt-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <LineChartOutlined className="text-indigo-600 mr-2" />
                    <span>市场趋势: {message.dataSources.marketTrends?.growth} 增长</span>
                  </div>
                </div>
              )}
              {message.dataSources.webSources && message.dataSources.webSources.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">参考网页</h5>
                  <div className="space-y-2">
                    {message.dataSources.webSources.map((source, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-md p-2">
                        <div className="flex items-center">
                          <LinkOutlined className="text-indigo-500 mr-2" />
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-600 hover:underline truncate">
                            {source.title}
                          </a>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{source.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">{message.timestamp}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 