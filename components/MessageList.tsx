import React from 'react';
import { Message } from '../types';
import ChatBubble from './ChatBubble';
import LoadingSpinner from './LoadingSpinner';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar bg-gray-800/50">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;