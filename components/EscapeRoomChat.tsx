

import React, { useEffect, useRef, useMemo } from 'react';
import { Message, ChatTargetId, ChatContact, Sender, ChatTargetIdOrNull } from '../types';
import { NO_CHAT_SELECTED_DISPLAY_NAME } from '../constants';
import MessageList from './MessageList';
import UserInput from './UserInput';
import LoadingSpinner from './LoadingSpinner'; 

interface EscapeRoomChatProps {
  messages: Message[];
  isLilyTyping: boolean; 
  chatError: string | null;
  onSendMessage: (userInput: string) => Promise<void>;
  isApiKeyAvailable: boolean; 
  chatContacts: ChatContact[];
  activeChatTargetId: ChatTargetIdOrNull; 
  onSwitchChatTarget: (targetId: ChatTargetId) => void;
  isCurrentChatResponsive: boolean;
  lastMessageTimestamps: Record<ChatTargetId, number>; 
  unreadCounts: Record<ChatTargetId, number>; 
}

const ChatIcon: React.FC<{className?: string}> = ({ className = "w-16 h-16 text-gray-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.543-3.091a9.118 9.118 0 0 0-1.458-.216H6.75c-1.255 0-2.25-.995-2.25-2.22V6.75c0-1.225.995-2.22 2.25-2.22h2.25A9.03 9.03 0 0 0 9 4.5c.923 0 1.787.174 2.575.483.4.16.74.422.983.753M10.5 16.5c0 .507-.164.98-.44 1.374M16.5 10.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );

const EscapeRoomChat: React.FC<EscapeRoomChatProps> = ({
  messages,
  isLilyTyping,
  chatError,
  onSendMessage,
  isApiKeyAvailable,
  chatContacts,
  activeChatTargetId,
  onSwitchChatTarget,
  isCurrentChatResponsive,
  lastMessageTimestamps,
  unreadCounts,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAutoScrolledChatIdRef = useRef<ChatTargetIdOrNull>(null);

  useEffect(() => {
    if (!activeChatTargetId) return; 

    if (messages && messages.length > 0) {
      // Always use "auto" for programmatic scrolls to ensure instant jump to bottom.
      // This applies when first viewing a chat, returning to it, or when new messages arrive.
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      
      // Update ref if this chat was different from the one previously auto-scrolled to its bottom.
      // This helps distinguish a "fresh" view of a chat.
      if (activeChatTargetId !== lastAutoScrolledChatIdRef.current) {
        lastAutoScrolledChatIdRef.current = activeChatTargetId;
      }
    }
    // If messages.length is 0 (empty chat), lastAutoScrolledChatIdRef is not updated.
    // This means if user views Lily -> EmptyChat -> Lily, the ref will still point to Lily,
    // and the scroll behavior will be "auto" (instant jump to bottom), not treating it as a "new" chat.
  }, [messages, activeChatTargetId]);


  const getContactDisplayName = (targetId: ChatTargetIdOrNull): string => {
    if (targetId === null) {
      return NO_CHAT_SELECTED_DISPLAY_NAME;
    }
    const contact = chatContacts.find(c => c.id === targetId);
    return contact ? contact.name : "Unknown Contact";
  };

  const sortedChatContacts = useMemo(() => {
    return [...chatContacts].sort((a, b) => {
      const timestampA = lastMessageTimestamps[a.id] || 0;
      const timestampB = lastMessageTimestamps[b.id] || 0;
      return timestampB - timestampA; 
    });
  }, [chatContacts, lastMessageTimestamps]);

  return (
    <div className="flex h-full w-full bg-gray-900 text-gray-100">
      {/* Chat List Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <h2 
          className="text-xl font-semibold text-teal-400 mb-6" 
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Conversations
        </h2>
        <ul className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          {sortedChatContacts.map((contact) => {
            const unreadCount = unreadCounts[contact.id] || 0;
            return (
            <li 
              key={contact.id}
              className={`p-3 rounded-lg cursor-pointer shadow-md hover:bg-teal-700/80 transition-colors duration-150
                          ${activeChatTargetId === contact.id ? 'bg-teal-700/60 ring-2 ring-teal-500' : 'bg-gray-700/40 hover:bg-gray-700/60'}`}
              onClick={() => onSwitchChatTarget(contact.id)}
              aria-current={activeChatTargetId === contact.id ? "page" : undefined}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${activeChatTargetId === contact.id ? 'bg-teal-500' : 'bg-gray-500'}`}>
                  {contact.avatarInitial}
                </div>
                <div className="overflow-hidden flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-100 truncate block">{contact.name}</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-1.5 h-5 flex items-center justify-center rounded-full" aria-label={`${unreadCount} unread messages`}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {contact.description && <span className="text-xs text-gray-400 truncate block">{contact.description}</span>}
                </div>
              </div>
            </li>
          );
        })}
        </ul>
        <div className="mt-auto text-center text-xs text-gray-500 p-2">
            Device ID: TERM-04A
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="bg-teal-800 bg-opacity-75 text-teal-200 text-xs text-center py-1.5 border-b border-t border-teal-700/60 shadow-inner">
          Secure Channel: Messages self-destruct in 24 hours.
        </div>

        {!activeChatTargetId ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 text-center bg-gray-800/30">
            <ChatIcon className="w-20 h-20 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">Select a conversation</p>
            <p className="text-sm text-gray-500 mt-1">Choose a contact from the list on the left to start chatting.</p>
          </div>
        ) : (isApiKeyAvailable || messages.length > 0 || activeChatTargetId !== 'lily') ? ( 
          <>
            <MessageList messages={messages} messagesEndRef={messagesEndRef} />
            <UserInput 
              onSendMessage={onSendMessage} 
              isLoading={isLilyTyping && activeChatTargetId === 'lily'} 
              isResponsive={isCurrentChatResponsive}
              currentContactName={getContactDisplayName(activeChatTargetId)}
            />
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-4 text-center bg-gray-800/30">
            <LoadingSpinner size="w-12 h-12" />
            <p className="mt-4 text-lg text-red-400">Communication Module Offline</p>
            {chatError && <p className="mt-2 text-sm text-red-400">{chatError}</p>}
            {!isApiKeyAvailable && activeChatTargetId === 'lily' && <p className="mt-2 text-sm text-yellow-400">API Key not configured. Lily's chat cannot be initialized.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default EscapeRoomChat;
