
import React, { useState, useEffect } from 'react';

interface BrowserScreenProps {
  onNavigate: (url: string) => void;
  currentUrl: string; 
  onSkullsSystemUnlockAttempt: (password: string) => boolean;
  isSkullsSystemUnlocked: boolean;
  skullsSystemContentComponent: React.ReactNode;
}

const BrowserScreen: React.FC<BrowserScreenProps> = ({ 
    onNavigate, 
    currentUrl, 
    onSkullsSystemUnlockAttempt, 
    isSkullsSystemUnlocked,
    skullsSystemContentComponent
}) => {
  const [addressBarInput, setAddressBarInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUrl !== addressBarInput) {
        setAddressBarInput(currentUrl || '');
    }
    if (currentUrl.toLowerCase() !== 'skulls.system' || isSkullsSystemUnlocked) {
        setPasswordError('');
        setPasswordInput('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, isSkullsSystemUnlocked]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressBarInput.trim()) {
      onNavigate(addressBarInput.trim());
    } else {
      onNavigate('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSkullsSystemUnlockAttempt(passwordInput)) {
        setPasswordError('Access Denied. Incorrect password.');
        setPasswordInput('');
    } else {
        setPasswordError(''); // Clear error on success
        setPasswordInput('');
        // App.tsx handles setting isSkullsSystemUnlocked, which will re-render this component
    }
  };

  const isSkullsSystemCurrent = currentUrl.toLowerCase() === 'skulls.system';

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-gray-100">
      {/* Browser Header/Address Bar */}
      <header className="bg-gray-800 p-3 shadow-md flex items-center space-x-2 sticky top-0 z-10">
        <form onSubmit={handleAddressSubmit} className="flex-grow flex items-center space-x-2">
          <input
            type="text"
            value={addressBarInput}
            onChange={(e) => setAddressBarInput(e.target.value)}
            placeholder="Enter web address (e.g., skulls.system)"
            className="flex-grow p-2 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400 text-sm"
            aria-label="Web address input"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            aria-label="Go to address"
          >
            Go
          </button>
        </form>
      </header>

      {/* Content Area */}
      <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {!currentUrl && (
          <div className="text-center text-gray-400 mt-10">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
            <p className="text-lg">Enter a web address to begin browsing.</p>
            <p className="text-sm mt-2">Try typing <code className="bg-gray-700 px-1 rounded">skulls.system</code> and press Go.</p>
          </div>
        )}

        {currentUrl && isSkullsSystemCurrent && isSkullsSystemUnlocked && (
            skullsSystemContentComponent
        )}
        
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
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(''); 
                  }}
                  placeholder="Enter password"
                  className="w-full p-2 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none placeholder-gray-400"
                  autoComplete="off"
                />
              </div>
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition duration-150"
              >
                Unlock
              </button>
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
      </main>
    </div>
  );
};

export default BrowserScreen;
