
import React from 'react';

interface AppIconProps {
  icon: React.ReactElement<{ className?: string }>; // Updated type
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ icon, label, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-3 space-y-2 rounded-lg 
                  hover:bg-gray-700/70 focus:bg-gray-600/90 focus:outline-none 
                  focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75
                  transition-all duration-150 ease-in-out transform hover:scale-105
                  active:scale-95
                  ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100 active:scale-100' : 'cursor-pointer'}`}
      aria-label={`Open ${label} app`}
    >
      <div className={`p-3 rounded-xl shadow-lg ${disabled ? 'bg-gray-600' : 'bg-gray-800'}`}>
        {React.cloneElement(icon, { // Removed 'as React.ReactElement' cast
          className: `w-10 h-10 sm:w-12 sm:h-12 ${disabled ? 'text-gray-400' : 'text-teal-400'}`
        })}
      </div>
      <span className={`text-xs sm:text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-200'}`}>{label}</span>
    </button>
  );
};

export default AppIcon;
