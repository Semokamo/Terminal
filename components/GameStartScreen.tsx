
import React from 'react';

interface GameStartScreenProps {
  onStartGame: () => void;
}

const GameStartScreen: React.FC<GameStartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-gray-100 p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-teal-400 mb-12" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Terminal Echoes: Lily's Call
        </h1>
        <button
          onClick={onStartGame}
          className="px-10 py-4 bg-teal-600 text-white font-bold rounded-lg 
                     hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 
                     transition duration-150 ease-in-out text-xl shadow-xl transform hover:scale-105 active:scale-100"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          aria-label="Start the game"
        >
          START GAME
        </button>
      </div>
      <footer className="absolute bottom-8 left-0 right-0 text-center w-full text-gray-600 text-sm">
          <p>An Interactive Narrative Experience</p>
      </footer>
    </div>
  );
};

export default GameStartScreen;