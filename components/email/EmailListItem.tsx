
import React from 'react';
import { Email, EmailFolder } from '@/types';

interface EmailListItemProps {
  email: Email;
  onSelectEmail: (id: string) => void;
  currentFolder: EmailFolder;
}

const EmailListItem: React.FC<EmailListItemProps> = ({ email, onSelectEmail, currentFolder }) => {
  const displayAddress = currentFolder === 'inbox' ? email.from : email.to.join(', ');
  const itemStyle = `
    p-3 sm:p-4 border-b border-gray-700/80 cursor-pointer
    hover:bg-gray-700/60 focus-within:bg-gray-700/70 focus-within:ring-1 focus-within:ring-teal-500 focus:outline-none
    transition-colors duration-100 ease-in-out
    ${!email.isRead && currentFolder === 'inbox' ? 'bg-gray-700/40' : 'bg-gray-800/50'}
  `;

  return (
    <li
      className={itemStyle}
      onClick={() => onSelectEmail(email.id)}
      onKeyPress={(e) => e.key === 'Enter' && onSelectEmail(email.id)}
      tabIndex={0}
      role="button"
      aria-label={`Email from ${email.from}, subject ${email.subject}, ${email.isRead ? 'read' : 'unread'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center min-w-0">
           {!email.isRead && currentFolder === 'inbox' && (
            <span 
              className="w-2.5 h-2.5 bg-teal-400 rounded-full mr-2.5 flex-shrink-0" 
              aria-hidden="true"
              title="Unread"
            ></span>
          )}
          <span 
            className={`font-semibold text-sm truncate ${!email.isRead && currentFolder === 'inbox' ? 'text-teal-300' : 'text-gray-200'}`}
            title={displayAddress}
          >
            {displayAddress}
          </span>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
          {new Date(email.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <p 
        className={`text-sm truncate ${!email.isRead && currentFolder === 'inbox' ? 'text-gray-100' : 'text-gray-300'}`}
        title={email.subject}
      >
        {email.subject}
      </p>
      <p className="text-xs text-gray-500 mt-1 truncate">
        {email.body.substring(0, 70) + (email.body.length > 70 ? '...' : '')}
      </p>
    </li>
  );
};

export default EmailListItem;
