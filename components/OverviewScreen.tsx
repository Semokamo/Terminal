
import React, { useState, useRef } from 'react';
import { OverviewApp } from '../App';
import { View } from '../types';

const MessengerIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 2H4C2.89543 2 2 2.89543 2 4V22L6 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2ZM9.00001 11C8.17158 11 7.50001 10.3284 7.50001 9.5C7.50001 8.67157 8.17158 8 9.00001 8C9.82844 8 10.5 8.67157 10.5 9.5C10.5 10.3284 9.82844 11 9.00001 11ZM15 11C14.1716 11 13.5 10.3284 13.5 9.5C13.5 8.67157 14.1716 8 15 8C15.8284 8 16.5 8.67157 16.5 9.5C16.5 10.3284 15.8284 11 15 11Z" />
  </svg>
);

const FilesIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => ( 
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 4H4c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
);

const BrowserIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.65 16.07 16.46 15 15 15H13V13C13 12.45 12.55 12 12 12C11.45 12 11 12.45 11 13V15H9C7.54 15 6.35 16.07 6.1 17.39C4.8 16.07 4 14.12 4 12C4 7.92 7.92 4.01 12 4.01C16.08 4.01 20 7.92 20 12C20 14.12 19.2 16.07 17.9 17.39Z" />
    </svg>
  );

const CalculatorIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 2C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2H7ZM7 4H17V6H7V4ZM7 8H9V10H7V8ZM11 8H13V10H11V8ZM15 8H17V10H15V8ZM7 12H9V14H7V12ZM11 12H13V14H11V12ZM15 12H17V14H15V12ZM7 16H9V18H7V16ZM11 16H17V18H11V16Z" />
  </svg>
);

interface OverviewScreenProps {
  apps: OverviewApp[];
  onSwitchApp: (view: View) => void;
  onClose: () => void; 
  onCloseApp: (viewId: View) => void; 
}

const AppCard: React.FC<{ app: OverviewApp; onSwitchApp: (view: View) => void; onCloseApp: (viewId: View) => void; }> = ({ app, onSwitchApp, onCloseApp }) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const dragThreshold = -80; 

  const startDrag = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'; 
    }
  };

  const drag = (clientY: number) => {
    if (!isDragging) return;
    setCurrentY(clientY);
    if (cardRef.current) {
      const dy = clientY - startY;
      cardRef.current.style.transform = `translateY(${Math.min(0, dy / 1.5)}px)`;
    }
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const dy = currentY - startY;

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out'; 
    }

    if (dy < dragThreshold) {
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateY(-200%) scale(0.8)';
        cardRef.current.style.opacity = '0';
        setTimeout(() => {
          onCloseApp(app.id);
        }, 250); 
      } else {
        onCloseApp(app.id);
      }
    } else {
      if (cardRef.current) {
         cardRef.current.style.transform = 'translateY(0) scale(1)';
      }
      if (Math.abs(dy) < 10) { // If it was more of a tap than a drag
         onSwitchApp(app.id);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; 
    startDrag(e.clientY);
    e.stopPropagation(); 
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    drag(e.clientY);
    e.stopPropagation();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    endDrag();
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientY);
      e.stopPropagation();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length === 1) {
      drag(e.touches[0].clientY);
      e.stopPropagation();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    endDrag();
    e.stopPropagation();
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };


  let icon;
  const iconSize = "w-12 h-12";
  const consistentIconColorClass = "text-teal-400"; 

  if (app.id === 'chat') {
    icon = <MessengerIcon className={iconSize} />;
  } else if (app.id === 'files_locked' || app.id === 'files_unlocked') { 
    icon = <FilesIcon className={iconSize} />; 
  } else if (app.id === 'browser') {
    icon = <BrowserIcon className={iconSize} />;
  } else if (app.id === 'calculator') {
    icon = <CalculatorIcon className={iconSize} />;
  }


  return (
    <button
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragStart={handleDragStart} 
      className={`group bg-gray-700 rounded-lg shadow-xl w-64 h-80 text-white 
                  transition-all duration-150 transform 
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 
                  cursor-grab active:cursor-grabbing 
                  ${isDragging ? 'shadow-2xl' : 'hover:shadow-2xl'}`}
      aria-label={`Application: ${app.title}. Click or drag up to close.`}
      style={{ touchAction: 'none' }} 
    >
      <div 
        className={`w-full h-full p-4 flex flex-col items-center justify-between 
                    transform transition-transform duration-150 
                    group-hover:scale-105 group-active:scale-95 
                    ${isDragging ? 'scale-105' : ''}`}
      >
        <div className="flex flex-col items-center justify-center flex-grow pointer-events-none"> 
          <div className={`p-3 rounded-lg ${consistentIconColorClass}`}> 
              {icon}
          </div>
          <h3 className="mt-3 text-xl font-semibold">{app.title}</h3>
        </div>
        <div className="text-xs text-gray-500 mt-2 pointer-events-none">Tap to open. Drag up to close.</div>
      </div>
    </button>
  );
};

const OverviewScreen: React.FC<OverviewScreenProps> = ({ apps, onSwitchApp, onClose, onCloseApp }) => {
  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="overview-title"
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => {
          if (apps.length > 0) {
            e.stopPropagation(); // Prevent click on content area (but not cards themselves) from closing overview
          } else {
            // If no apps, clicking the "empty content area" (where "No recent apps" msg is) should close
            onClose();
            e.stopPropagation(); // Good practice to still stop after handling
          }
        }}
      >
        <h2 id="overview-title" className="text-3xl font-bold text-gray-200 mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Recent Apps
        </h2>
        {apps.length > 0 ? (
          <div className="flex space-x-6 overflow-x-auto py-4 custom-scrollbar">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} onSwitchApp={onSwitchApp} onCloseApp={onCloseApp} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-lg">No recent apps.</p>
        )}
      </div>
    </div>
  );
};

export default OverviewScreen;
