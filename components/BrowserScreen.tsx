
import React, { useState, useEffect, useRef } from 'react';
import { BrowserContentView } from '../types'; // Assuming BrowserContentView is defined in types.ts

interface BrowserScreenProps {
  onNavigate: (url: string) => void;
  currentUrl: string;
  onSkullsSystemUnlockAttempt: (password: string) => boolean;
  isSkullsSystemUnlocked: boolean;
  skullsSystemContentComponent: React.ReactNode;
  history: string[];
  bookmarks: string[];
  isBookmarked: (url: string) => boolean;
  onToggleBookmark: (url: string) => void;
  contentView: BrowserContentView;
  onSetContentView: (view: BrowserContentView) => void;
  onRemoveBookmark: (url: string) => void;
}

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-5 h-5" }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.673a1 1 0 00.95.69h5.969c.969 0 1.371 1.24.588 1.81l-4.826 3.502a1 1 0 00-.364 1.118l1.846 5.673c.3.921-.755 1.688-1.54 1.118l-4.826-3.502a1 1 0 00-1.175 0l-4.826 3.502c-.784.57-1.838-.197-1.539-1.118l1.846-5.673a1 1 0 00-.364-1.118L2.98 11.1c-.783-.57-.38-1.81.588-1.81h5.969a1 1 0 00.95-.69L11.049 2.927z" />
  </svg>
);

const CogIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( // w-5 h-5 is 20px
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const BrowserScreen: React.FC<BrowserScreenProps> = ({
  onNavigate,
  currentUrl,
  onSkullsSystemUnlockAttempt,
  isSkullsSystemUnlocked,
  skullsSystemContentComponent,
  history,
  bookmarks,
  isBookmarked,
  onToggleBookmark,
  contentView,
  onSetContentView,
  onRemoveBookmark,
}) => {
  const [addressBarInput, setAddressBarInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUrl !== addressBarInput && contentView === 'page') {
      setAddressBarInput(currentUrl || '');
    }
    if (currentUrl.toLowerCase() !== 'skulls.system' || isSkullsSystemUnlocked) {
      setPasswordError('');
      setPasswordInput('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, isSkullsSystemUnlocked, contentView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(addressBarInput.trim());
    setIsSettingsOpen(false); 
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSkullsSystemUnlockAttempt(passwordInput)) {
      setPasswordError('Access Denied. Incorrect password.');
      setPasswordInput('');
    } else {
      setPasswordError('');
      setPasswordInput('');
    }
  };
  
  const handleHistoryItemClick = (url: string) => {
    setAddressBarInput(url);
    onNavigate(url);
    setIsSettingsOpen(false);
  };

  const handleBookmarkItemClick = (url: string) => {
    setAddressBarInput(url);
    onNavigate(url);
    setIsSettingsOpen(false);
  };

  const handleToggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
  };

  const handleSelectContentView = (view: BrowserContentView) => {
    onSetContentView(view);
    setIsSettingsOpen(false);
  };

  const handleBookmarkStarClick = () => {
    if (currentUrl) {
        onToggleBookmark(currentUrl);
    }
  };

  const isSkullsSystemCurrent = currentUrl.toLowerCase() === 'skulls.system';

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-3 shadow-md flex items-center space-x-2 sticky top-0 z-10">
        <form onSubmit={handleAddressSubmit} className="flex-grow flex items-center space-x-2">
          <input
            type="text"
            value={addressBarInput}
            onChange={(e) => setAddressBarInput(e.target.value)}
            placeholder="Enter web address (e.g., skulls.system)"
            className="flex-grow p-2 h-9 bg-gray-700 text-gray-100 rounded-l-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400 text-sm"
            aria-label="Web address input"
          />
          <button
              type="button"
              onClick={handleBookmarkStarClick}
              disabled={!currentUrl}
              className={`p-2 h-9 flex items-center justify-center border-y border-gray-700 bg-gray-700
                          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500
                          ${!currentUrl ? 'opacity-50 cursor-not-allowed' : ''}
                          ${isBookmarked(currentUrl) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-300'}`}
              aria-label={isSkullsSystemCurrent ? "skulls.system (permanent bookmark)" : (isBookmarked(currentUrl) ? "Remove bookmark" : "Add bookmark")}
              title={isSkullsSystemCurrent ? "skulls.system is a permanent bookmark" : (isBookmarked(currentUrl) ? "Remove bookmark" : "Add bookmark")}
          >
              <StarIcon filled={isBookmarked(currentUrl)} className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="px-4 py-2 h-9 bg-teal-500 text-white font-semibold rounded-r-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm flex items-center justify-center"
            aria-label="Go to address"
          >
            Go
          </button>
           <div className="relative ml-2" ref={settingsMenuRef}> {/* Added ml-2 for spacing */}
            <button 
                type="button" // Prevents form submission
                onClick={handleToggleSettings}
                className="p-2 h-9 w-9 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
                aria-label="Browser settings"
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
            >
                <CogIcon className="w-5 h-5" />
            </button>
            {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                    <button 
                        onClick={() => handleSelectContentView('history')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-teal-600 hover:text-white"
                    >
                        History
                    </button>
                    <button 
                        onClick={() => handleSelectContentView('bookmarks')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-teal-600 hover:text-white"
                    >
                        Bookmarks
                    </button>
                </div>
            )}
        </div>
        </form>
      </header>

      <main className="flex-grow p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        {contentView === 'page' && (
          <>
            {!currentUrl && (
              <div className="text-center text-gray-400 mt-10">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                <p className="text-lg font-semibold text-gray-300">Digital Frontier</p>
                <p className="text-sm mt-2 text-gray-500">Use the address bar to navigate or access History & Bookmarks via the settings menu.</p>
              </div>
            )}
            {currentUrl && isSkullsSystemCurrent && isSkullsSystemUnlocked && skullsSystemContentComponent}
            {currentUrl && isSkullsSystemCurrent && !isSkullsSystemUnlocked && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-auto mt-8 text-center">
                <svg className="w-12 h-12 text-teal-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <h2 className="text-2xl font-semibold mb-3 text-gray-100">skulls.system</h2>
                <p className="text-gray-300 mb-4">Authentication Required</p>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="passwordSystem" className="sr-only">Password</label>
                    <input
                      id="passwordSystem"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
                      placeholder="Enter password"
                      className="w-full p-2 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400"
                      autoComplete="off"
                    />
                  </div>
                  {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                  <button type="submit" className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition duration-150">Unlock</button>
                </form>
              </div>
            )}
            {currentUrl && !isSkullsSystemCurrent && (
              <div className="text-center text-red-400 mt-10 bg-red-900 bg-opacity-30 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p>This device has limited network access. Unable to connect to <strong className="break-all">{currentUrl}</strong>.</p>
                <p className="text-sm mt-1">The website may be unavailable or outside the allowed network range.</p>
              </div>
            )}
          </>
        )}

        {contentView === 'history' && (
          <div className="text-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-teal-400 border-b border-gray-700 pb-2">Browsing History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400">No history recorded.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((url, index) => (
                  <li key={index} className="bg-gray-800 p-3 rounded-md hover:bg-gray-700/70 transition-colors">
                    <button onClick={() => handleHistoryItemClick(url)} className="text-teal-300 hover:text-teal-200 break-all text-left w-full">
                      {url}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {contentView === 'bookmarks' && (
          <div className="text-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-teal-400 border-b border-gray-700 pb-2">Bookmarks</h2>
            {bookmarks.length === 0 ? (
              <p className="text-gray-400">No bookmarks saved.</p>
            ) : (
              <ul className="space-y-2">
                {bookmarks.map((url, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-md hover:bg-gray-700/70 transition-colors group">
                    <button onClick={() => handleBookmarkItemClick(url)} className="text-teal-300 hover:text-teal-200 break-all text-left flex-grow mr-2">
                      {url}
                    </button>
                    {url.toLowerCase() !== 'skulls.system' && (
                        <button 
                            onClick={() => onRemoveBookmark(url)}
                            className="p-1.5 text-gray-400 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-600"
                            aria-label={`Remove bookmark for ${url}`}
                            title="Remove bookmark"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowserScreen;
