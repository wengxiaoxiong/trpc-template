'use client';

import React from 'react';
import { useRecoilValue } from 'recoil';
import { messagesState } from '../recoil/atoms';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const Chat: React.FC = () => {
  const messages = useRecoilValue(messagesState);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
      <div className="mt-auto">
        <ChatInput />
      </div>
    </div>
  );
};

export default Chat; 