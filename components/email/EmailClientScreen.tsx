
import React, { useState, useEffect, useCallback } from 'react';
import { Email, EmailFolder } from '@/types';
import EmailList from './EmailList';
import EmailView from './EmailView';
import EmailCompose from './EmailCompose';

interface EmailClientScreenProps {
  initialEmails: Email[];
  onNewEmailNotification: (subject: string, sender: string) => void;
  onUpdateEmails: (emails: Email[]) => void; 
}

const InboxIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const SentIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ComposeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);


type EmailClientView = 'list' | 'view_email' | 'compose';
type ComposeMode = 'new' | 'reply' | 'forward';

const EmailClientScreen: React.FC<EmailClientScreenProps> = ({ initialEmails, onNewEmailNotification, onUpdateEmails }) => {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [clientView, setClientView] = useState<EmailClientView>('list');
  
  const [composeInitialRecipient, setComposeInitialRecipient] = useState<string | undefined>(undefined);
  const [composeInitialSubject, setComposeInitialSubject] = useState<string | undefined>(undefined);
  const [composeInitialBody, setComposeInitialBody] = useState<string | undefined>(undefined);


  useEffect(() => {
    onUpdateEmails(emails); 
  }, [emails, onUpdateEmails]);
  
  const simulateAutoReply = useCallback((originalSender: string) => {
    setTimeout(() => {
      const replyEmail: Email = {
        id: `email-${Date.now()}`,
        from: 'System Auto-Reply <autoreply@system.dev>',
        to: [originalSender],
        subject: 'Re: Your Feedback/Query',
        body: `Thank you for your message. This is an automated response.\n\nWe have received your email and it will be processed shortly (or not, this is a simulation!).\n\nRegards,\nThe System`,
        timestamp: new Date(),
        isRead: false,
        folder: 'inbox',
      };
      setEmails(prev => [replyEmail, ...prev]);
      onNewEmailNotification(replyEmail.subject, replyEmail.from);
    }, 3000); 
  }, [onNewEmailNotification]);

  const handleSelectFolder = (folder: EmailFolder) => {
    setCurrentFolder(folder);
    setSelectedEmailId(null);
    setClientView('list');
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setClientView('view_email');
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === id ? { ...email, isRead: true } : email
      )
    );
  };

  const handleCloseEmailView = () => {
    setSelectedEmailId(null);
    setClientView('list');
  };

  const prepareComposeScreen = (mode: ComposeMode, originalEmail?: Email) => {
    let recipient = '';
    let subject = '';
    let body = '\n\n';

    if (mode === 'reply' && originalEmail) {
      recipient = originalEmail.from;
      subject = originalEmail.subject.toLowerCase().startsWith('re:') ? originalEmail.subject : `Re: ${originalEmail.subject}`;
      body += `-----Original Message-----\nFrom: ${originalEmail.from}\nTo: ${originalEmail.to.join(', ')}\nSent: ${originalEmail.timestamp.toLocaleString()}\nSubject: ${originalEmail.subject}\n\n${originalEmail.body}`;
    } else if (mode === 'forward' && originalEmail) {
      recipient = ''; // User fills this for forward
      subject = originalEmail.subject.toLowerCase().startsWith('fwd:') ? originalEmail.subject : `Fwd: ${originalEmail.subject}`;
      body += `-----Forwarded Message-----\nFrom: ${originalEmail.from}\nTo: ${originalEmail.to.join(', ')}\nSent: ${originalEmail.timestamp.toLocaleString()}\nSubject: ${originalEmail.subject}\n\n${originalEmail.body}`;
    }
    // For 'new', recipient, subject, and body remain as initialized or empty.

    setComposeInitialRecipient(recipient);
    setComposeInitialSubject(subject);
    setComposeInitialBody(body);
    setClientView('compose');
  };
  
  const handleStartCompose = () => {
    prepareComposeScreen('new');
  };

  const handleStartReply = (emailToReply: Email) => {
    prepareComposeScreen('reply', emailToReply);
  };

  const handleStartForward = (emailToForward: Email) => {
    prepareComposeScreen('forward', emailToForward);
  };
  
  const handleCancelCompose = () => {
    setClientView('list'); 
    setComposeInitialRecipient(undefined);
    setComposeInitialSubject(undefined);
    setComposeInitialBody(undefined);
  };

  const handleSendEmail = (emailData: Omit<Email, 'id' | 'timestamp' | 'isRead' | 'folder'>) => {
    const newEmail: Email = {
      ...emailData,
      id: `email-${Date.now()}`,
      timestamp: new Date(),
      isRead: true, 
      folder: 'sent',
    };
    setEmails(prev => [newEmail, ...prev]);
    setCurrentFolder('sent'); 
    setClientView('list');

    if (newEmail.to.includes('feedback@system.dev')) {
      simulateAutoReply(newEmail.from);
    }
    setComposeInitialRecipient(undefined);
    setComposeInitialSubject(undefined);
    setComposeInitialBody(undefined);
  };
  

  const displayedEmails = emails
    .filter(email => email.folder === currentFolder)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const selectedEmail = emails.find(email => email.id === selectedEmailId) || null;
  
  const unreadInboxCount = emails.filter(e => e.folder === 'inbox' && !e.isRead).length;

  const getFolderButtonClass = (folder: EmailFolder) => {
    return `flex items-center space-x-2 px-3 py-2.5 sm:px-4 text-sm font-medium rounded-md transition-colors
            ${currentFolder === folder && clientView === 'list' 
              ? 'bg-teal-600 text-white shadow-md' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-3 sm:p-4 shadow-md flex items-center justify-between sticky top-0 z-10 border-b border-gray-700">
        <h1 className="text-lg sm:text-xl font-bold text-teal-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Mail Client
        </h1>
        <button
          onClick={handleStartCompose}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm flex items-center space-x-1.5 transition-colors"
          aria-label="Compose new email"
        >
          <ComposeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Compose</span>
        </button>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar for Folders */}
        <aside className="w-48 sm:w-56 bg-gray-800/70 border-r border-gray-700 p-2 sm:p-3 space-y-1.5 flex-shrink-0 flex flex-col">
          <button onClick={() => handleSelectFolder('inbox')} className={getFolderButtonClass('inbox')}>
            <InboxIcon />
            <span>Inbox</span>
            {unreadInboxCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-1.5 h-5 flex items-center justify-center rounded-full">
                {unreadInboxCount}
              </span>
            )}
          </button>
          <button onClick={() => handleSelectFolder('sent')} className={getFolderButtonClass('sent')}>
            <SentIcon />
            <span>Sent</span>
          </button>
          <div className="mt-auto pt-2 text-center text-xs text-gray-500">
            Storage: Local
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto bg-gray-800/30">
          {clientView === 'list' && (
            <EmailList emails={displayedEmails} onSelectEmail={handleSelectEmail} currentFolder={currentFolder} />
          )}
          {clientView === 'view_email' && selectedEmail && (
            <EmailView 
                email={selectedEmail} 
                onClose={handleCloseEmailView} 
                onReply={handleStartReply} 
                onForward={handleStartForward} 
            />
          )}
          {clientView === 'compose' && (
            <EmailCompose 
                onSend={handleSendEmail} 
                onCancel={handleCancelCompose} 
                initialRecipient={composeInitialRecipient}
                initialSubject={composeInitialSubject}
                initialBody={composeInitialBody}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default EmailClientScreen;
