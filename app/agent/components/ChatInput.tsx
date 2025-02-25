'use client';

import React from 'react';
import { SendOutlined } from '@ant-design/icons';
import { useRecoilState } from 'recoil';
import { inputMessageState, messagesState } from '../recoil/atoms';

const ChatInput: React.FC = () => {
  const [inputMessage, setInputMessage] = useRecoilState(inputMessageState);
  const [messages, setMessages] = useRecoilState(messagesState);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      // 添加用户消息
      const userMessage = {
        type: 'user' as const,
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // 清空输入
      setInputMessage('');
      
      // 模拟机器人回复
      setTimeout(() => {
        const botMessage = {
          type: 'bot' as const,
          content: `我收到了您关于"${inputMessage.split('\n')[0]}"的讨论请求。让我们深入分析这个方案的可行性和实施步骤。`,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        id="chat-input"
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border-none bg-gray-100 rounded-lg px-4 py-2 text-sm"
        placeholder="输入您的消息..."
      />
      <button 
        className="!rounded-button bg-indigo-600 text-white p-2 hover:bg-indigo-700"
        onClick={sendMessage}
      >
        <SendOutlined />
      </button>
    </div>
  );
};

export default ChatInput; 