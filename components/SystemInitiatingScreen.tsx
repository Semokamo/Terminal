
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const SystemInitiatingScreen: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState("Initiating Suspect's Terminal...");
  
  const messages = [
    "Accessing encrypted file system...",
    "Bypassing security protocols...",
    "Verifying user credentials (override)...",
    "Loading operating system components...",
    "Establishing connection to internal network...",
    "Finalizing system access... Almost there.",
  ];

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1);
      if (messageIndex < messages.length) {
        setLoadingMessage(messages[messageIndex]);
      } else {
        // Keep last message or clear interval if preferred, 
        // App.tsx will navigate away after 4s total
        setLoadingMessage(messages[messages.length -1]); // Stay on last message
        clearInterval(interval); 
      }
    }, 700); // Change message roughly every 0.7 seconds to fit within 4s

    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-gray-300 p-8">
      <LoadingSpinner size="w-16 h-16" color="text-teal-400" />
      <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-3 text-teal-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        SYSTEM INITIALIZATION
      </h2>
      <p className="text-lg text-gray-400 animate-pulse text-center max-w-md">
        {loadingMessage}
      </p>
       <footer className="absolute bottom-8 left-0 right-0 text-center w-full text-gray-600 text-sm">
          <p>Please wait while the suspect's terminal is accessed...</p>
       </footer>
    </div>
  );
};

export default SystemInitiatingScreen;
