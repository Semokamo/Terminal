
import React, { useState, useEffect, useRef } from 'react';

interface MacOSTopBarProps {
  gameName: string;
  onRequestSignOut: () => void; // Renamed from onSignOut
}

const MacOSTopBar: React.FC<MacOSTopBarProps> = ({ gameName, onRequestSignOut }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState<boolean>(false);
  const sessionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000 * 60); 
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(event.target as Node)) {
        setIsSessionMenuOpen(false);
      }
    };
    if (isSessionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSessionMenuOpen]);

  const toggleSessionMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsSessionMenuOpen(prev => !prev);
  };

  const handleSignOutClick = () => {
    setIsSessionMenuOpen(false);
    onRequestSignOut(); // Call the renamed prop
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-8 bg-gray-800/90 text-gray-200 flex items-center justify-between px-3 text-sm shadow-sm backdrop-blur-sm z-30 select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center space-x-4">
        <span className="font-semibold">{gameName}</span>
        {/* currentAppTitle rendering removed */}
        
        <div className="relative" ref={sessionMenuRef}>
          <button 
            onClick={toggleSessionMenu} 
            className="hover:bg-gray-700 px-2 py-1 rounded"
            aria-haspopup="true"
            aria-expanded={isSessionMenuOpen}
          >
            Session
          </button>
          {isSessionMenuOpen && (
            <div className="absolute left-0 mt-1 w-40 bg-gray-700 rounded-md shadow-lg py-1 z-40 border border-gray-600">
              <button
                onClick={handleSignOutClick}
                className="block w-full text-left px-3 py-1.5 text-xs text-gray-200 hover:bg-teal-600 hover:text-white"
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="text-gray-300">
        {currentTime}
      </div>
    </div>
  );
};

export default MacOSTopBar;