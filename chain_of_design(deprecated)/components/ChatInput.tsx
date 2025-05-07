'use client';

import React, { useRef } from 'react';
import { SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRecoilState } from 'recoil';
import { inputMessageState, messagesState, selectedConceptForInputState } from '../recoil/atoms';
import ConceptCard from './ConceptCard';

const ChatInput: React.FC = () => {
  const [inputMessage, setInputMessage] = useRecoilState(inputMessageState);
  const [messages, setMessages] = useRecoilState(messagesState);
  const [selectedConcept, setSelectedConcept] = useRecoilState(selectedConceptForInputState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = () => {
    if (inputMessage.trim() || selectedConcept) {
      // 添加用户消息
      const userMessage = {
        type: 'user' as const,
        content: inputMessage,
        conceptData: selectedConcept || undefined,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // 清空输入和选中的概念
      setInputMessage('');
      setSelectedConcept(null);
      
      // 重置textarea高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // 模拟机器人回复
      setTimeout(() => {
        const conceptName = selectedConcept ? selectedConcept.name : inputMessage.split('\n')[0];
        
        // 模拟思考链路数据
        const thoughtProcess = [
          `分析用户提出的"${conceptName}"概念`,
          `检索相关市场数据和竞品信息`,
          `评估"${conceptName}"的市场潜力和可行性`,
          `生成初步实施方案和建议`
        ];
        
        const botMessage = {
          type: 'bot' as const,
          content: `我收到了您关于"${conceptName}"的讨论请求。让我们深入分析这个方案的可行性和实施步骤。`,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          thoughtProcess: thoughtProcess
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 如果按下Enter键，但没有按下Shift键
    if (e.key === 'Enter') {
      // 如果按下了Command键(Mac)或Control键(Windows/Linux)，发送消息
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        sendMessage();
      } else if (!e.shiftKey) {
        // 如果没有按下Shift键，只是普通的Enter，则不阻止默认行为（添加换行）
        // 不做任何处理，允许添加换行
      }
    }
  };

  // 自动调整textarea高度
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInputMessage(textarea.value);
    
    // 重置高度，然后根据内容设置新高度
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // 移除选中的概念
  const removeSelectedConcept = () => {
    setSelectedConcept(null);
  };

  return (
    <div className="flex flex-col">
      {/* 选中的概念卡片 */}
      {selectedConcept && (
        <div className="mb-2 relative">
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 z-10"
            onClick={removeSelectedConcept}
          >
            <CloseCircleOutlined />
          </button>
          <ConceptCard concept={selectedConcept} isInChat={true} />
        </div>
      )}
      
      {/* 输入区域 */}
      <div className="flex items-start space-x-2">
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={inputMessage}
          onChange={adjustTextareaHeight}
          onKeyDown={handleKeyDown}
          className="flex-1 border-none bg-gray-100 rounded-lg px-4 py-2 text-sm resize-none min-h-[40px] max-h-[150px]"
          placeholder="输入您的消息...(Enter换行，Cmd+Enter或Ctrl+Enter发送)"
          rows={1}
        />
        <button 
          className="!rounded-button bg-indigo-600 text-white p-2 hover:bg-indigo-700 h-[40px] flex items-center justify-center"
          onClick={sendMessage}
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 