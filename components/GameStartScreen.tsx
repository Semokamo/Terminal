
import React from 'react';

interface GameStartScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  hasSavedGame: boolean;
}

const GameStartScreen: React.FC<GameStartScreenProps> = ({ onNewGame, onLoadGame, hasSavedGame }) => {
  const buttonCommonClass = "w-full px-10 py-4 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition duration-150 ease-in-out text-xl shadow-xl transform hover:scale-105 active:scale-100";
  const newGameButtonClass = `${buttonCommonClass} bg-teal-500 hover:bg-teal-600`;
  const loadGameButtonClass = `${buttonCommonClass} bg-teal-500 hover:bg-teal-600`; // Matched style

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-gray-100 p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-teal-400 mb-16" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Terminal Echoes: Lily's Call
        </h1>
        <div className="flex flex-col items-center space-y-6 w-64 mx-auto"> {/* Container for consistent button width, now centered with mx-auto */}
          <button
            onClick={onNewGame}
            className={newGameButtonClass}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            aria-label="Start a new game"
          >
            NEW GAME
          </button>
          {hasSavedGame && (
            <button
              onClick={onLoadGame}
              className={loadGameButtonClass}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
              aria-label="Load existing game"
            >
              LOAD GAME
            </button>
          )}
        </div>
      </div>
      <footer className="absolute bottom-8 left-0 right-0 text-center w-full text-gray-600 text-sm">
          <p>An Interactive Narrative Experience</p>
      </footer>
    </div>
  );
};

export default GameStartScreen;
