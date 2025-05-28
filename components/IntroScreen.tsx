
import React from 'react';

interface IntroScreenProps {
  onProceed: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onProceed }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-200 p-6 sm:p-8">
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 sm:p-10 rounded-xl shadow-2xl max-w-2xl w-full border border-teal-500/30">
        <div className="text-center mb-6 sm:mb-8">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            CRITICAL ALERT
          </h1>
          <p className="text-sm sm:text-md text-red-300" style={{ fontFamily: "'Orbitron', sans-serif" }}>IMMEDIATE ACTION REQUIRED</p>
        </div>

        <div className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
          <p>
            You are an officer embroiled in a high-stakes abduction case.
            After a tense confrontation, you've <strong className="text-teal-400">neutralized the kidnapper</strong> in his hideout.
          </p>
          <p>
            This very terminal was his command center. Intelligence confirms he was actively communicating with his current victim, a young woman codenamed <strong className="text-teal-400">"LILY"</strong>.
          </p>
          <p>
            Her location is <strong className="text-yellow-400">unknown</strong>. Her status, <strong className="text-yellow-400">uncertain</strong>. This system is your only link to her.
          </p>
          <p className="font-semibold text-gray-100">
            Your mission: Access the suspect's system. Establish contact with Lily. Guide her to safety.
          </p>
          <p className="text-red-400 font-bold">
            Time is critical. Lily's life depends on your actions.
          </p>
        </div>

        <button
          onClick={onProceed}
          className="mt-8 sm:mt-10 w-full py-3 sm:py-4 px-6 bg-teal-600 text-white font-bold rounded-lg 
                     hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 
                     transition duration-150 ease-in-out text-md sm:text-lg shadow-xl transform hover:scale-105 active:scale-100"
          aria-label="Access suspect's terminal and proceed"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          [ ACCESS SUSPECT'S TERMINAL ]
        </button>
      </div>
       {/* Footer removed or can be empty if desired */}
       <footer className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center w-full text-gray-600 text-xs opacity-0 pointer-events-none" aria-hidden="true">
          <p>&nbsp;</p> {/* Empty paragraph to maintain space if layout depends on it, or remove footer entirely */}
        </footer>
    </div>
  );
};

export default IntroScreen;
