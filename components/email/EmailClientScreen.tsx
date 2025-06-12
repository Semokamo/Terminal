
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

// --- Icons ---
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

const BackArrowIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
// --- End Icons ---

type InternalEmailView = 'folder_list' | 'email_list' | 'view_email' | 'compose';
type ComposeMode = 'new' | 'reply' | 'forward';

const EmailClientScreen: React.FC<EmailClientScreenProps> = ({ initialEmails, onNewEmailNotification, onUpdateEmails }) => {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [internalView, setInternalView] = useState<InternalEmailView>('folder_list');
  const [viewBeforeCompose, setViewBeforeCompose] = useState<InternalEmailView>('email_list');

  const [composeInitialRecipient, setComposeInitialRecipient] = useState<string | undefined>(undefined);
  const [composeInitialSubject, setComposeInitialSubject] = useState<string | undefined>(undefined);
  const [composeInitialBody, setComposeInitialBody] = useState<string | undefined>(undefined);
  
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 640;
      if (newIsMobile !== isMobileView) { // Only act if mode actually changes
        setIsMobileView(newIsMobile);
        if (newIsMobile) {
          setInternalView('folder_list'); 
          setSelectedEmailId(null);
        } else {
          setCurrentFolder('inbox');
          setSelectedEmailId(null);
          setInternalView('email_list'); 
        }
      }
    };

    if (window.innerWidth < 640) {
      setIsMobileView(true);
      setInternalView('folder_list');
    } else {
      setIsMobileView(false);
      setCurrentFolder('inbox');
      setInternalView('email_list');
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array, effect runs once on mount and cleans up on unmount. Relies on internal isMobileView state for subsequent logic.


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
    setInternalView('email_list');
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setInternalView('view_email');
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === id ? { ...email, isRead: true } : email
      )
    );
  };

  const handleCloseEmailView = () => { 
    setSelectedEmailId(null);
    setInternalView('email_list');
  };

  const prepareAndSwitchToCompose = (mode: ComposeMode, originalEmail?: Email) => {
    let recipient = '';
    let subject = '';
    let body = '\n\n'; // Default empty lines for new email

    if (mode === 'reply' && originalEmail) {
      recipient = originalEmail.from;
      subject = originalEmail.subject.toLowerCase().startsWith('re:') ? originalEmail.subject : `Re: ${originalEmail.subject}`;
      body = `\n\n\n-----Original Message-----\nFrom: ${originalEmail.from}\nTo: ${originalEmail.to.join(', ')}\nSent: ${originalEmail.timestamp.toLocaleString()}\nSubject: ${originalEmail.subject}\n\n${originalEmail.body}`;
    } else if (mode === 'forward' && originalEmail) {
      recipient = ''; // User fills this in
      subject = originalEmail.subject.toLowerCase().startsWith('fwd:') ? originalEmail.subject : `Fwd: ${originalEmail.subject}`;
      body = `\n\n\n-----Forwarded Message-----\nFrom: ${originalEmail.from}\nTo: ${originalEmail.to.join(', ')}\nSent: ${originalEmail.timestamp.toLocaleString()}\nSubject: ${originalEmail.subject}\n\n${originalEmail.body}`;
    }
    
    setComposeInitialRecipient(recipient);
    setComposeInitialSubject(subject);
    setComposeInitialBody(body);
    
    // Determine what view to return to on cancel/send
    if (internalView === 'view_email' && selectedEmailId) {
        setViewBeforeCompose('view_email'); // if replying/forwarding from view_email
    } else {
        setViewBeforeCompose('email_list'); // Default back to list
    }
    if (isMobileView && internalView === 'folder_list') {
        setViewBeforeCompose('folder_list');
    }


    setInternalView('compose');
  };
  
  const handleStartCompose = () => { // Generic compose, e.g. from a main button
    setViewBeforeCompose(isMobileView && internalView === 'folder_list' ? 'folder_list' : 'email_list');
    prepareAndSwitchToCompose('new');
    setSelectedEmailId(null); // No email is "selected" when starting a fresh compose
  };

  const handleStartReply = (emailToReply: Email) => {
    prepareAndSwitchToCompose('reply', emailToReply);
  };

  const handleStartForward = (emailToForward: Email) => {
    prepareAndSwitchToCompose('forward', emailToForward);
  };

  const handleCancelCompose = () => {
    if (viewBeforeCompose === 'view_email' && selectedEmailId) {
        setInternalView('view_email'); // Return to viewing the specific email
    } else if (isMobileView && viewBeforeCompose === 'folder_list') {
        setInternalView('folder_list');
    }
    else {
        setInternalView('email_list'); // Default back to list
    }
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
    
    if (newEmail.to.includes('feedback@system.dev')) {
      simulateAutoReply(newEmail.from);
    }

    setCurrentFolder('sent'); // Switch to sent folder
    setInternalView('email_list'); // Show the list (now of sent items)
    setSelectedEmailId(null); // No email selected
    setComposeInitialRecipient(undefined);
    setComposeInitialSubject(undefined);
    setComposeInitialBody(undefined);
  };

  const handleBackToFolderList = () => { // Mobile only
    setInternalView('folder_list');
    setSelectedEmailId(null);
  };

  const displayedEmails = emails
    .filter(email => email.folder === currentFolder)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const selectedEmailObject = emails.find(email => email.id === selectedEmailId) || null;
  const unreadInboxCount = emails.filter(e => e.folder === 'inbox' && !e.isRead).length;

  const folderButtonClassMobile = (folderName: EmailFolder, isActive: boolean) =>
    `flex items-center space-x-3 px-3 py-2.5 sm:px-4 text-sm font-medium rounded-lg shadow-sm transition-colors w-full text-left
     ${isActive ? 'bg-teal-600 text-white ring-1 ring-teal-500' : 'bg-gray-700/60 text-gray-200 hover:bg-gray-700 hover:text-white'}`;
  
  const folderButtonClassDesktop = (folderName: EmailFolder, isActive: boolean) =>
    `flex items-center space-x-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left
     ${isActive ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-700/70 hover:text-gray-100'}`;


  const renderMobileHeader = () => {
    let title = "Mail";
    let showComposeButton = true;
    let showBackButton = false;
    let backAction = () => {};

    if (internalView === 'folder_list') {
      title = "Mail Folders";
    } else if (internalView === 'email_list') {
      title = currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1);
      showBackButton = true;
      backAction = handleBackToFolderList;
    } else {
      return null; 
    }

    return (
      <header className="bg-gray-800 p-3 sm:p-4 shadow-md flex items-center justify-between sticky top-0 z-10 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={backAction}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 flex items-center text-teal-400 hover:text-teal-300 mr-2"
              aria-label="Back"
            >
              <BackArrowIcon className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg sm:text-xl font-bold text-teal-400 truncate" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {title}
          </h1>
        </div>
        {showComposeButton && (
          <button
            onClick={handleStartCompose}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm flex items-center space-x-1.5 transition-colors"
            aria-label="Compose new email"
          >
            <ComposeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Compose</span>
          </button>
        )}
      </header>
    );
  };
  
  const renderMobileContent = () => {
    switch (internalView) {
      case 'folder_list':
        return (
          <div className="p-3 sm:p-4 space-y-2.5">
            <button onClick={() => handleSelectFolder('inbox')} className={folderButtonClassMobile('inbox', currentFolder === 'inbox')}>
              <InboxIcon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-grow">Inbox</span>
              {unreadInboxCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-1.5 h-5 flex items-center justify-center rounded-full">
                  {unreadInboxCount}
                </span>
              )}
            </button>
            <button onClick={() => handleSelectFolder('sent')} className={folderButtonClassMobile('sent', currentFolder === 'sent')}>
              <SentIcon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-grow">Sent</span>
            </button>
          </div>
        );
      case 'email_list':
        return <EmailList emails={displayedEmails} onSelectEmail={handleSelectEmail} currentFolder={currentFolder} />;
      case 'view_email':
        return selectedEmailObject ? (
          <EmailView
            email={selectedEmailObject}
            onClose={handleCloseEmailView}
            onReply={handleStartReply}
            onForward={handleStartForward}
          />
        ) : <div className="p-4 text-center text-gray-500">Error: Email not found.</div>;
      case 'compose':
        return (
          <EmailCompose
            onSend={handleSendEmail}
            onCancel={handleCancelCompose}
            initialRecipient={composeInitialRecipient}
            initialSubject={composeInitialSubject}
            initialBody={composeInitialBody}
          />
        );
      default:
        return <div className="p-4 text-center text-gray-500">An unexpected error occurred.</div>;
    }
  };

  if (isMobileView) {
    return (
      <div className="flex flex-col h-full w-full bg-gray-900 text-gray-100">
        {(internalView === 'folder_list' || internalView === 'email_list') && renderMobileHeader()}
        <main className={`flex-grow overflow-y-auto custom-scrollbar 
                         ${(internalView === 'view_email' || internalView === 'compose') ? 'bg-gray-800' : 'bg-gray-800/30'}`}>
          {renderMobileContent()}
        </main>
      </div>
    );
  }

  // Desktop/Large Screen Layout
  return (
    <div className="flex flex-row h-full w-full bg-gray-900 text-gray-100">
      {/* Desktop Sidebar */}
      <div className="w-60 flex-shrink-0 bg-gray-800 p-4 space-y-3 border-r border-gray-700 flex flex-col">
        <button 
          onClick={handleStartCompose} 
          className="w-full flex items-center justify-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-3 py-2.5 rounded-md text-sm transition-colors"
          aria-label="Compose new email"
        >
          <ComposeIcon className="w-5 h-5" />
          <span>Compose</span>
        </button>
        <nav className="flex-grow space-y-1.5">
          <button onClick={() => handleSelectFolder('inbox')} className={folderButtonClassDesktop('inbox', currentFolder === 'inbox' && (internalView === 'email_list' || internalView === 'folder_list') )}>
            <InboxIcon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-grow">Inbox</span>
            {unreadInboxCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-1.5 h-5 flex items-center justify-center rounded-full">
                  {unreadInboxCount}
                </span>
              )}
          </button>
          <button onClick={() => handleSelectFolder('sent')} className={folderButtonClassDesktop('sent', currentFolder === 'sent' && (internalView === 'email_list' || internalView === 'folder_list') )}>
            <SentIcon className="w-5 h-5 flex-shrink-0" />
            <span>Sent</span>
          </button>
        </nav>
      </div>

      {/* Desktop Main Content Pane */}
      <main className="flex-grow flex flex-col overflow-hidden bg-gray-800/50">
        {internalView === 'email_list' && <EmailList emails={displayedEmails} onSelectEmail={handleSelectEmail} currentFolder={currentFolder} />}
        {internalView === 'view_email' && selectedEmailObject && (
          <EmailView email={selectedEmailObject} onClose={handleCloseEmailView} onReply={handleStartReply} onForward={handleStartForward} />
        )}
        {internalView === 'compose' && (
          <EmailCompose onSend={handleSendEmail} onCancel={handleCancelCompose} initialRecipient={composeInitialRecipient} initialSubject={composeInitialSubject} initialBody={composeInitialBody} />
        )}
         {/* Fallback in case internalView is 'folder_list' on desktop (should be rare with resize logic) */}
         {internalView === 'folder_list' && <EmailList emails={displayedEmails} onSelectEmail={handleSelectEmail} currentFolder={currentFolder} /> }
      </main>
    </div>
  );
};

export default EmailClientScreen;
