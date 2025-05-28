
import React, { useState } from 'react';
import { NO_CHAT_SELECTED_DISPLAY_NAME, LILY_CHAT_SPEAKER_NAME } from '../constants';

interface UserInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean; 
  isResponsive: boolean; 
  currentContactName: string; 
}

const UserInput: React.FC<UserInputProps> = ({ onSendMessage, isLoading, isResponsive, currentContactName }) => {
  const [text, setText] = useState('');
  const isChatActive = currentContactName !== NO_CHAT_SELECTED_DISPLAY_NAME;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChatActive) return;

    if (text.trim() && (!isLoading || !isResponsive )) { 
      onSendMessage(text.trim());
      setText('');
    }
  };

  const placeholderText = isChatActive 
    ? `Type your message to ${currentContactName}...`
    : "Select a conversation to send a message";

  const inputDisabled = (isLoading && currentContactName === LILY_CHAT_SPEAKER_NAME) || !isChatActive;
  const buttonDisabled = ((isLoading && currentContactName === LILY_CHAT_SPEAKER_NAME) || !text.trim()) || !isChatActive;

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderText}
          className="flex-grow p-3 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400"
          disabled={inputDisabled}
        />
        <button
          type="submit"
          disabled={buttonDisabled}
          className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default UserInput;
