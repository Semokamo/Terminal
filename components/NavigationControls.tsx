
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

  const baseButtonClasses = "p-3 rounded-full text-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500";
  const interactiveButtonClasses = "hover:bg-gray-700 hover:text-white active:bg-gray-600";

  const handleBackClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onBackClick();
    (event.currentTarget as HTMLButtonElement).blur();
  };

  const handleHomeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onHomeClick();
    (event.currentTarget as HTMLButtonElement).blur();
  };

  const handleOverviewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onOverviewClick();
    (event.currentTarget as HTMLButtonElement).blur();
  };

  return (
    <nav className="w-full bg-gray-900 bg-opacity-80 backdrop-blur-sm shadow-t-lg border-t border-gray-700">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2"> {/* Increased height from h-16 to h-20 */}
        <button
          onClick={handleBackClick}
          aria-label={canGoBack ? "Go Back" : "Back (disabled)"}
          className={`${baseButtonClasses} ${!canGoBack ? 'opacity-50 cursor-default' : interactiveButtonClasses}`}
          disabled={!canGoBack}
        >
          <BackIcon className="w-7 h-7" />
        </button>
        <button
          onClick={handleHomeClick}
          aria-label="Go to Home Screen"
          className={`${baseButtonClasses} ${interactiveButtonClasses}`}
        >
          <HomeIcon className="w-7 h-7" />
        </button>
        <button
          onClick={handleOverviewClick}
          aria-label="Overview of open applications"
          className={`${baseButtonClasses} ${
            isOverviewVisible
              ? 'text-teal-400 bg-gray-700' // "ON" state for overview mode
              : interactiveButtonClasses    // Standard interactive classes when overview is "OFF"
          }`}
        >
            <OverviewIcon className="w-6 h-6" /> 
        </button>
      </div>
    </nav>
  );
};

export default NavigationControls;
