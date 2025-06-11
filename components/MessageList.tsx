
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
    <div className="flex-grow px-4 pt-4 pb-24 space-y-4 bg-gray-800/50"> {/* Added flex-grow */}
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
