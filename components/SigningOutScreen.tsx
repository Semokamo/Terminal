
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const SigningOutScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-[100]"> {/* Ensure high z-index */}
      <LoadingSpinner size="w-12 h-12" color="text-teal-400" />
      <p className="mt-6 text-xl font-semibold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Signing Out...
      </p>
      <p className="mt-2 text-sm text-gray-400">Clearing session data. Please wait.</p>
    </div>
  );
};

export default SigningOutScreen;
