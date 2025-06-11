

import React, { useEffect, useRef, useMemo } from 'react';
import { Message, ChatTargetId, ChatContact, Sender, ChatTargetIdOrNull } from '../types';
import { NO_CHAT_SELECTED_DISPLAY_NAME, SUBJECT_34_PROFILE_NAME } from '../constants'; 
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
  onSwitchChatTarget: (targetId: ChatTargetIdOrNull) => void; 
  isCurrentChatResponsive: boolean;
  lastMessageTimestamps: Record<ChatTargetId, number>; 
  unreadCounts: Record<ChatTargetId, number>; 
}

const ChatIcon: React.FC<{className?: string}> = ({ className = "w-16 h-16 text-gray-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.543-3.091a9.118 9.118 0 0 0-1.458-.216H6.75c-1.255 0-2.25-.995-2.25-2.22V6.75c0-1.225.995-2.22 2.25-2.22h2.25A9.03 9.03 0 0 0 9 4.5c.923 0 1.787.174 2.575.483.4.16.74.422.983.753M10.5 16.5c0 .507-.164.98-.44 1.374M16.5 10.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );

const BackArrowIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      if (activeChatTargetId !== lastAutoScrolledChatIdRef.current) {
        lastAutoScrolledChatIdRef.current = activeChatTargetId;
      }
    }
  }, [messages, activeChatTargetId]);


  const getContactDisplayName = (targetId: ChatTargetIdOrNull): string => {
    if (targetId === null) {
      return NO_CHAT_SELECTED_DISPLAY_NAME;
    }
    const contact = chatContacts.find(c => c.id === targetId);
    return contact ? contact.name : "Unknown Contact"; // Always use contact.name from the list
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
      <aside 
        className={`
          py-4 flex flex-col bg-gray-800
          sm:border-r sm:border-gray-700
          ${activeChatTargetId ? 
            'hidden sm:flex sm:w-64 sm:flex-shrink-0' : 
            'flex w-full sm:w-64 sm:flex-shrink-0'   
          }
          transition-all duration-300 ease-in-out
        `}
      >
        <h2 
          className="text-xl font-semibold text-teal-400 mb-6 px-4" 
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Conversations
        </h2>
        <ul className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          {sortedChatContacts.map((contact) => {
            const unreadCount = unreadCounts[contact.id] || 0;
            const isLilyOnline = contact.id === 'lily' && contact.isResponsive; 
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
                <div className="overflow-hidden flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0"> 
                        <span className="font-medium text-gray-100 truncate block">{contact.name}</span>
                        {isLilyOnline && (
                          <span
                            className="w-2.5 h-2.5 bg-green-400 rounded-full ml-2 flex-shrink-0"
                            title="Online"
                            aria-hidden="true"
                          ></span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-1.5 h-5 flex items-center justify-center rounded-full flex-shrink-0" aria-label={`${unreadCount} unread messages`}>
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
        <div className="mt-auto text-center text-xs text-gray-500 py-2 px-4">
            Device ID: TERM-04A
        </div>
      </aside>

      {/* Main Chat Content Area - Shown when a chat is active */}
      {activeChatTargetId && (
          <main className="flex-grow flex w-full sm:w-auto flex-col overflow-hidden">
            <div 
              className="p-4 text-xl font-semibold text-teal-400 bg-gray-800 flex items-center justify-center relative border-b border-gray-700"
            >
              <button
                onClick={() => onSwitchChatTarget(null)}
                className="sm:hidden absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-teal-300 hover:text-teal-200 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-400"
                aria-label="Back to conversations list"
              >
                <BackArrowIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="truncate px-8 sm:px-0">
                 {getContactDisplayName(activeChatTargetId)}
              </span>
            </div>
            <div className="bg-teal-800 bg-opacity-75 text-teal-200 text-xs text-center py-1.5 border-b border-t border-teal-700/60 shadow-inner">
                Secure Channel: Messages self-destruct in 24 hours.
            </div>
            {(isApiKeyAvailable || messages.length > 0 || activeChatTargetId !== 'lily') ? (
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
                {!isApiKeyAvailable && activeChatTargetId === 'lily' && <p className="mt-2 text-sm text-yellow-400">API Key not configured. {SUBJECT_34_PROFILE_NAME}'s chat cannot be initialized.</p>}
              </div>
            )}
          </main>
      )}

      {/* Placeholder - Shown on larger screens when no chat is active */}
      {!activeChatTargetId && (
        <main className="hidden sm:flex flex-grow flex-col items-center justify-center p-4 text-center bg-gray-800/30">
          <ChatIcon className="w-20 h-20 text-gray-600 mb-4" />
          <p className="text-lg text-gray-400">Select a conversation</p>
          <p className="text-sm text-gray-500 mt-1">Choose a contact from the list on the left to start chatting.</p>
        </main>
      )}
    </div>
  );
};

export default EscapeRoomChat;
