
import React, { useState, useRef } from 'react';

interface FilesPinScreenProps { // Renamed from GalleryPinScreenProps
  onBack: () => void; 
  onPinSuccess: (pin: string) => boolean; 
}

const FilesPinScreen: React.FC<FilesPinScreenProps> = ({ onBack, onPinSuccess }) => { // Renamed component
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      setError('');

      // Focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin.length !== 6) {
      setError('PIN must be 6 digits.');
      return;
    }
    
    if (!onPinSuccess(enteredPin)) {
      setError('Access Denied. Invalid PIN.');
      setPin(Array(6).fill('')); // Clear PIN on error
      inputRefs.current[0]?.focus(); // Focus first input on error
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center h-full w-full p-4"
      style={{
        backgroundImage: "url('https://wallpapers.com/images/hd/hacking-background-bryw246r4lx5pyue.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-sm text-center border border-gray-700/50">
        <svg className="w-16 h-16 text-teal-400 mx-auto mb-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C9.79 2 8 3.79 8 6V8H7C5.9 8 5 8.9 5 10V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V10C19 8.9 18.1 8 17 8H16V6C16 3.79 14.21 2 12 2ZM12 4C13.1 4 14 4.9 14 6V8H10V6C10 4.9 10.9 4 12 4ZM7 10H17V20H7V10Z" />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-gray-100">Files Locked</h2> 
        <p className="text-gray-400 mb-6">Enter your 6-digit PIN to access files.</p> 
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center space-x-2 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                type="password" 
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-semibold bg-gray-700 text-white border border-gray-500 rounded-md outline-none caret-teal-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                autoComplete="off"
              />
            ))}
          </div>

          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
          >
            Unlock Files 
          </button>
        </form>
        <button
            onClick={onBack}
            className="mt-6 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
            Cancel (Back to Home)
        </button>
      </div>
    </div>
  );
};

export default FilesPinScreen;