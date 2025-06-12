
import React from 'react';
import { Email, EmailFolder } from '@/types';
import EmailListItem from './EmailListItem';

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (id: string) => void;
  currentFolder: EmailFolder;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, currentFolder }) => {
  if (emails.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <p className="text-gray-500 italic">
          {currentFolder === 'inbox' ? 'Your inbox is empty.' : 'No emails in this folder.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-700/60 custom-scrollbar overflow-y-auto h-full">
      {emails.map(email => (
        <EmailListItem 
          key={email.id} 
          email={email} 
          onSelectEmail={onSelectEmail} 
          currentFolder={currentFolder} 
        />
      ))}
    </ul>
  );
};

export default EmailList;
