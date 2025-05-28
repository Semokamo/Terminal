
import React from 'react';

interface SignOutConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SignOutConfirmationDialog: React.FC<SignOutConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      onClick={onCancel} 
      role="alertdialog" 
      aria-modal="true" 
      aria-labelledby="signOutConfirmDialogTitle"
    >
      <div 
        className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="signOutConfirmDialogTitle" className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 text-center">
          Confirm Sign Out
        </h2>
        <p className="text-gray-300 mb-6 text-sm sm:text-base text-center">
          Are you sure you want to sign out? All current progress, including chat history and puzzle states, will be lost. This action cannot be undone.
        </p>
        <div className="flex justify-center space-x-3 sm:space-x-4"> {/* Changed from justify-end to justify-center */}
          <button
            onClick={onCancel}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Cancel sign out"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Confirm sign out"
          >
            Confirm Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirmationDialog;
