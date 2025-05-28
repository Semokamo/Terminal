
import React from 'react';
import { Message, Sender } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { LILY_CHAT_SPEAKER_NAME, USER_PERSONA_NAME, LILY_TYPING_MESSAGE, IMAGE_GENERATION_ERROR_MESSAGE, KIDNAPPER_SYSTEM_PERSONA_NAME, RELOCATION_UNIT_PERSONA_NAME } from '../constants';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;
  const isLily = message.sender === Sender.Lily; 
  const isSystem = message.sender === Sender.System;
  const isRelocationUnit = message.sender === Sender.RelocationUnit;

  const bubbleAlignment = isUser ? 'items-end' : 'items-start';
  const bubbleColor = isUser
    ? 'bg-slate-700 text-white'
    : (isLily || isRelocationUnit) 
    ? 'bg-teal-600 text-white'
    : 'bg-gray-700 text-gray-300'; 
  
  let senderName = USER_PERSONA_NAME;
  if (isLily) senderName = LILY_CHAT_SPEAKER_NAME; // Display "Lily" for her messages
  else if (isSystem) senderName = KIDNAPPER_SYSTEM_PERSONA_NAME;
  else if (isRelocationUnit) senderName = RELOCATION_UNIT_PERSONA_NAME;


  if (message.isLoading && message.sender === Sender.Lily && message.text === LILY_TYPING_MESSAGE) {
     return (
        <div className={`flex flex-col ${bubbleAlignment} animate-pulse`}>
          <div className="flex items-center mb-1">
            {!isUser && <span className="text-xs text-gray-400 mr-2 font-semibold">{senderName}</span>}
          </div>
          <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow ${bubbleColor}`}>
            <div className="flex items-center">
                <LoadingSpinner size="w-4 h-4" />
                <span className="ml-2 italic">{message.text}</span>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className={`flex flex-col ${bubbleAlignment}`}>
      <div className="flex items-center mb-1">
        {!isUser && <span className={`text-xs ${isSystem ? 'text-gray-400' : 'text-gray-400'} mr-2 font-semibold`}>{senderName}</span>}
        {isUser && <span className="text-xs text-gray-400 ml-2 font-semibold">{senderName}</span>}
      </div>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow ${bubbleColor} ${message.isError && !message.imageUrl ? 'border-2 border-red-500' : ''}`}
      >
        {message.text && message.text !== LILY_TYPING_MESSAGE && (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}

        {message.isLoading && message.imageUrl === undefined && !message.text && (
          <div className="flex flex-col items-center justify-center h-48 w-full">
            <LoadingSpinner />
            <p className="text-sm mt-2 text-gray-300">Generating image...</p>
          </div>
        )}

        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Generated scene"
            className="mt-2 rounded-lg max-w-full h-auto"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
          />
        )}
        
        {message.isError && message.imageUrl === undefined && !message.text && message.text !== IMAGE_GENERATION_ERROR_MESSAGE && (
            <p className="text-red-400 text-sm italic">Failed to load image or process message.</p>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1 px-1">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default ChatBubble;
