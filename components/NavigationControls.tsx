
import React from 'react';

interface NavigationControlsProps {
  onHomeClick: () => void;
  onBackClick: () => void;
  onOverviewClick: () => void;
  isChatActive: boolean;
  isFilesLockedActive: boolean;    // Renamed from isGalleryActive
  isFilesUnlockedActive: boolean; // Renamed from isGalleryUnlockedActive
  isBrowserActive: boolean;
  isCalculatorActive: boolean; 
  isOverviewVisible: boolean;
}

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
  </svg>
);

const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const OverviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
  </svg>
);


const NavigationControls: React.FC<NavigationControlsProps> = ({ 
    onHomeClick, 
    onBackClick, 
    onOverviewClick,
    isChatActive, 
    isFilesLockedActive,    // Renamed
    isFilesUnlockedActive, // Renamed
    isBrowserActive,
    isCalculatorActive, 
    isOverviewVisible
}) => {
  const canGoBack = isChatActive || isFilesLockedActive || isFilesUnlockedActive || isBrowserActive || isCalculatorActive || isOverviewVisible;

  return (
    <nav className="w-full bg-gray-900 bg-opacity-80 backdrop-blur-sm shadow-t-lg border-t border-gray-700">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <button
          onClick={onBackClick}
          aria-label={canGoBack ? "Go Back" : "Back (disabled)"}
          className={`p-3 rounded-full text-gray-300 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors duration-150 ${!canGoBack ? 'opacity-50 cursor-default' : 'hover:text-white'}`}
          disabled={!canGoBack}
        >
          <BackIcon className="w-7 h-7" />
        </button>
        <button
          onClick={onHomeClick}
          aria-label="Go to Home Screen"
          className="p-3 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:bg-gray-700 transition-colors duration-150"
        >
          <HomeIcon className="w-7 h-7" />
        </button>
        <button
          onClick={onOverviewClick}
          aria-label="Overview of open applications"
          className={`p-3 rounded-full text-gray-300 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors duration-150 ${isOverviewVisible ? 'text-teal-400 bg-gray-700' : 'hover:text-white'}`}
        >
            <OverviewIcon className="w-6 h-6" /> 
        </button>
      </div>
    </nav>
  );
};

export default NavigationControls;
