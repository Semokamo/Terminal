
import React, { useEffect } from 'react';

interface CreditsScreenProps {
  onFinishedDisplaying: () => void;
}

const CreditsScreen: React.FC<CreditsScreenProps> = ({ onFinishedDisplaying }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishedDisplaying();
    }, 6000); // Display credits for 6 seconds

    return () => clearTimeout(timer);
  }, [onFinishedDisplaying]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-gray-100 p-8 transition-opacity duration-1000 ease-in-out opacity-0 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-400 mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Terminal Echoes: Lily's Call
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-200 mb-4">
          Thank you for playing!
        </p>
        
        <p className="text-lg sm:text-xl text-gray-300 mb-3">
          Developed by: Moe
        </p>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          Share your thoughts: kashefim75@gmail.com
        </p>

        <p className="text-md sm:text-lg text-gray-400">
          I hope you enjoyed this experience .
        </p>
      </div>
      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s forwards;
        }
      `}</style>
      <footer className="absolute bottom-8 left-0 right-0 text-center w-full text-gray-600 text-sm">
          <p>Session Terminated</p>
      </footer>
    </div>
  );
};

export default CreditsScreen;
