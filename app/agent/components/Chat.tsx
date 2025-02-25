'use client';

import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { messagesState } from '../recoil/atoms';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const Chat: React.FC = () => {
  const messages = useRecoilValue(messagesState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 当消息更新时，滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto">
        <ChatInput />
      </div>
    </div>
  );
};

export default Chat; 