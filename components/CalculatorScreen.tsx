
import React, { useState, useEffect } from 'react';

interface CalculatorScreenProps {
  initialDisplayValue: string;
  onDisplayChange: (value: string) => void;
}

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ initialDisplayValue, onDisplayChange }) => {
  const [currentInput, setCurrentInput] = useState<string>(initialDisplayValue);
  const [previousInput, setPreviousInput] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [shouldResetInput, setShouldResetInput] = useState<boolean>(false);

  useEffect(() => {
    // Update internal state if the initialDisplayValue prop changes
    // This is important if the value is reset externally (e.g., by task manager closure)
    // and the component re-renders with a new initial value.
    if (initialDisplayValue !== currentInput) {
      setCurrentInput(initialDisplayValue);
      // If reset to "0", ensure it doesn't immediately chain with previous operations.
      if (initialDisplayValue === "0") {
        setPreviousInput(null);
        setOperator(null);
        setShouldResetInput(false);
      }
    }
  }, [initialDisplayValue]); // Removed currentInput from dependencies to avoid potential loop with onDisplayChange effect

  useEffect(() => {
    onDisplayChange(currentInput);
  }, [currentInput, onDisplayChange]);

  const handleNumberClick = (num: string) => {
    if (currentInput === 'Error') {
      setCurrentInput(num);
      setShouldResetInput(false);
      return;
    }
    if (shouldResetInput || currentInput === '0' && num !== '.') { // Ensure '0.' is possible
      setCurrentInput(num);
      setShouldResetInput(false);
    } else {
      setCurrentInput(prev => (prev.length < 15 ? prev + num : prev));
    }
  };

  const handleDecimalClick = () => {
    if (currentInput === 'Error') {
        setCurrentInput('0.');
        setShouldResetInput(false);
        return;
    }
    if (shouldResetInput) {
      setCurrentInput('0.');
      setShouldResetInput(false);
      return;
    }
    if (!currentInput.includes('.')) {
      setCurrentInput(prev => prev + '.');
    }
  };

  const handleOperatorClick = (op: string) => {
    if (currentInput === 'Error') return;

    if (previousInput !== null && operator && !shouldResetInput) {
      // If there's a pending operation and new input wasn't reset, calculate first
      const tempCurrent = currentInput; // Store current input before it's potentially overwritten by calculateResult
      calculateResult(); 
      // After calculation, currentInput holds the result. Set this as new previousInput for chaining.
      setPreviousInput(currentInput); // currentInput is now the result of previous op
      setOperator(op); 
      setShouldResetInput(true); 
    } else {
      // Standard operator click: store current input as previous, set operator
      setPreviousInput(currentInput);
      setOperator(op);
      setShouldResetInput(true);
    }
  };

  const calculateResult = () => {
    if (previousInput === null || operator === null || currentInput === 'Error') {
      return;
    }

    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    let result: number;

    switch (operator) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '*':
        result = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          setCurrentInput('Error');
          setPreviousInput(null);
          setOperator(null);
          setShouldResetInput(true);
          return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }
    
    // Format result: remove trailing zeros if it's a whole number, limit precision for floats
    const resultStr = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(8)));
    
    if (resultStr.length > 15) {
        setCurrentInput('Error');
        setPreviousInput(null); // Clear previousInput on error
    } else {
        setCurrentInput(resultStr);
        setPreviousInput(resultStr); // Store the result as previousInput for potential chaining
    }
    // Keep operator for potential chaining if user presses another operator next
    // setOperator(null); // Don't nullify operator for chaining like 2+2+2
    setShouldResetInput(true); // Next number input should replace the result
  };

  const handleEqualsClick = () => {
    calculateResult();
    // After equals, the result is shown. If user then presses an operator, this result becomes previousInput.
    // If user presses a number, it should start a new calculation.
    setOperator(null); // Reset operator after equals, for classic calculator behavior
  };

  const handleClearClick = () => {
    setCurrentInput('0');
    setPreviousInput(null);
    setOperator(null);
    setShouldResetInput(false);
  };

  const buttonClass = "text-2xl sm:text-3xl font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95";
  const numButtonClass = `${buttonClass} bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400 p-4 sm:p-5`;
  const opButtonClass = `${buttonClass} bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400 p-4 sm:p-5`;
  const specialButtonClass = `${buttonClass} bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500 p-4 sm:p-5`;


  return (
    <div 
      className="flex flex-col items-center justify-center h-full w-full p-2 sm:p-4"
      style={{
        backgroundImage: "url('https://wallpapers.com/images/hd/hacking-background-bryw246r4lx5pyue.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-xs sm:max-w-sm bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700/50">
        {/* Display */}
        <div className="bg-gray-900 text-right p-4 sm:p-6 rounded-lg mb-4 shadow-inner">
          <span 
            className="text-3xl sm:text-5xl font-mono break-all"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            aria-live="polite"
          >
            {currentInput}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <button onClick={handleClearClick} className={`${specialButtonClass} col-span-2`}>AC</button>
          <button disabled className={`${buttonClass} bg-gray-700 opacity-0`}>%</button> {/* Placeholder */}
          <button onClick={() => handleOperatorClick('/')} className={opButtonClass}>÷</button>

          <button onClick={() => handleNumberClick('7')} className={numButtonClass}>7</button>
          <button onClick={() => handleNumberClick('8')} className={numButtonClass}>8</button>
          <button onClick={() => handleNumberClick('9')} className={numButtonClass}>9</button>
          <button onClick={() => handleOperatorClick('*')} className={opButtonClass}>×</button>

          <button onClick={() => handleNumberClick('4')} className={numButtonClass}>4</button>
          <button onClick={() => handleNumberClick('5')} className={numButtonClass}>5</button>
          <button onClick={() => handleNumberClick('6')} className={numButtonClass}>6</button>
          <button onClick={() => handleOperatorClick('-')} className={opButtonClass}>-</button>

          <button onClick={() => handleNumberClick('1')} className={numButtonClass}>1</button>
          <button onClick={() => handleNumberClick('2')} className={numButtonClass}>2</button>
          <button onClick={() => handleNumberClick('3')} className={numButtonClass}>3</button>
          <button onClick={() => handleOperatorClick('+')} className={opButtonClass}>+</button>

          <button onClick={() => handleNumberClick('0')} className={`${numButtonClass} col-span-2`}>0</button>
          <button onClick={handleDecimalClick} className={numButtonClass}>.</button>
          <button onClick={handleEqualsClick} className={opButtonClass}>=</button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorScreen;
