
import React from 'react';
import { Email } from '@/types';

interface EmailViewProps {
  email: Email | null;
  onClose: () => void;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
}

const BackArrowIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ReplyIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6" />
    </svg>
);

const ForwardIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);


const EmailView: React.FC<EmailViewProps> = ({ email, onClose, onReply, onForward }) => {
  if (!email) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <p className="text-gray-500">No email selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-200 shadow-lg">
      <header className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 flex items-center text-teal-400 hover:text-teal-300"
          aria-label="Back to email list"
        >
          <BackArrowIcon className="mr-2" /> Back
        </button>
        <div className="flex items-center space-x-2">
           <button 
              onClick={() => onReply(email)}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-300 hover:text-teal-300"
              aria-label="Reply to email"
              title="Reply"
            >
              <ReplyIcon />
            </button>
            <button 
              onClick={() => onForward(email)}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-300 hover:text-teal-300"
              aria-label="Forward email"
              title="Forward"
            >
              <ForwardIcon />
            </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 flex-grow overflow-y-auto custom-scrollbar">
        <h1 className="text-xl sm:text-2xl font-semibold text-teal-300 mb-3 break-words">
          {email.subject}
        </h1>
        <div className="mb-4 text-xs sm:text-sm space-y-1 border-b border-gray-700 pb-3">
          <p>
            <strong className="text-gray-400 font-medium w-16 inline-block">From:</strong> 
            <span className="text-gray-300">{email.from}</span>
          </p>
          <p>
            <strong className="text-gray-400 font-medium w-16 inline-block">To:</strong> 
            <span className="text-gray-300">{email.to.join(', ')}</span>
          </p>
          {email.cc && email.cc.length > 0 && (
            <p>
                <strong className="text-gray-400 font-medium w-16 inline-block">Cc:</strong> 
                <span className="text-gray-300">{email.cc.join(', ')}</span>
            </p>
          )}
          <p>
            <strong className="text-gray-400 font-medium w-16 inline-block">Date:</strong> 
            <span className="text-gray-300">{new Date(email.timestamp).toLocaleString()}</span>
          </p>
        </div>
        
        <div 
          className="prose prose-sm sm:prose-base prose-invert max-w-none whitespace-pre-wrap break-words leading-relaxed"
          dangerouslySetInnerHTML={{ __html: email.body.replace(/\n/g, '<br />') }} // Basic newline to <br> for display
        >
        </div>
      </div>
    </div>
  );
};

export default EmailView;
