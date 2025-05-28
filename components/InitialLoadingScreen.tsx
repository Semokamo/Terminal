
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { API_KEY_ERROR_MESSAGE } from '../constants';

type AppStatus = 'uninitialized' | 'initializing_api' | 'api_ready' | 'api_error';

interface InitialLoadingScreenProps {
  onStartExperience: () => void;
  status: AppStatus;
}

const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ onStartExperience, status }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          System Interface
        </h1>
        

        {status === 'uninitialized' && (
          <>
            <p className="text-lg text-gray-300 mb-8">
              Preparing terminal interface modules...
            </p>
            <button
              onClick={onStartExperience}
              className="px-8 py-4 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition duration-150 text-lg shadow-xl transform hover:scale-105"
              aria-label="Login to the system"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Login
            </button>
          </>
        )}

        {status === 'initializing_api' && (
          <div className="flex flex-col items-center">
            <p className="text-lg text-gray-300 mb-8">
              Accessing required system libraries...
            </p>
            <LoadingSpinner size="w-12 h-12" color="text-teal-400" />
            <p className="mt-4 text-lg text-teal-300 animate-pulse">Establishing connection protocols...</p>
          </div>
        )}

        {status === 'api_error' && (
          <div className="text-red-400 p-6 rounded-lg bg-red-900 bg-opacity-40 shadow-xl max-w-md">
            <h2 className="text-2xl font-semibold mb-3">Connection Failed</h2>
            <p className="mb-2">{API_KEY_ERROR_MESSAGE}</p>
            <p className="text-sm text-gray-300">Please ensure the external configuration is correct and try refreshing.</p>
             <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
          </div>
        )}
        {/* If api_ready, this component won't be shown, App.tsx will switch view */}
      </div>
       <footer className="absolute bottom-8 left-0 right-0 text-center w-full text-gray-500 text-sm">
          <p>Interactive Narrative Module</p>
        </footer>
    </div>
  );
};

export default InitialLoadingScreen;