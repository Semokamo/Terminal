
import React, { useState, useEffect } from 'react';
import { Email } from '@/types';

interface EmailComposeProps {
  onSend: (emailData: Omit<Email, 'id' | 'timestamp' | 'isRead' | 'folder'>) => void;
  onCancel: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialBody?: string; // Added for reply/forward
}

const EmailCompose: React.FC<EmailComposeProps> = ({ 
  onSend, 
  onCancel, 
  initialRecipient = '', 
  initialSubject = '',
  initialBody = '' // Added
}) => {
  const [to, setTo] = useState(initialRecipient);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    setTo(initialRecipient);
  }, [initialRecipient]);

  useEffect(() => {
    setSubject(initialSubject);
  }, [initialSubject]);

  useEffect(() => {
    setBody(initialBody);
  }, [initialBody]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) {
      alert("Please fill in 'To' and 'Subject' fields.");
      return;
    }
    onSend({
      from: 'user@terminal.dev', 
      to: to.split(',').map(email => email.trim()).filter(email => email),
      subject,
      body,
    });
  };
  
  const inputClass = "w-full p-2.5 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400 text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-200 shadow-lg">
      <header className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-teal-400" style={{fontFamily: "'Orbitron', sans-serif"}}>Compose Email</h2>
        <div className="flex items-center space-x-2">
            <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                aria-label="Cancel composing email"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition-colors"
                aria-label="Send email"
            >
                Send
            </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4 flex-grow flex flex-col overflow-y-auto custom-scrollbar">
        <div>
          <label htmlFor="email-to" className={labelClass}>To:</label>
          <input
            id="email-to"
            type="email"
            multiple
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com (comma-separated)"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="email-subject" className={labelClass}>Subject:</label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className={inputClass}
            required
          />
        </div>
        <div className="flex-grow flex flex-col">
          <label htmlFor="email-body" className={labelClass}>Body:</label>
          <textarea
            id="email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your message..."
            className={`${inputClass} flex-grow min-h-[200px] sm:min-h-[250px] resize-none leading-relaxed`}
          />
        </div>
      </form>
    </div>
  );
};

export default EmailCompose;
