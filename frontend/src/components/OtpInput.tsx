import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Array of 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty input or first input
    const firstEmptyIndex = digits.findIndex(d => !d);
    const targetIndex = firstEmptyIndex === -1 ? 5 : firstEmptyIndex;
    if (inputsRef.current[targetIndex] && !disabled) {
      inputsRef.current[targetIndex]?.focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.slice(-1); // Take last entered character
    if (!/^\d*$/.test(char)) return; // Only allow digits

    const newDigits = [...digits];
    newDigits[index] = char;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newOtp.length === 6 && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const numericOnly = pasteData.replace(/\D/g, '').slice(0, 6);
    if (!numericOnly) return;

    onChange(numericOnly);

    const focusIdx = Math.min(numericOnly.length, 5);
    inputsRef.current[focusIdx]?.focus();

    if (numericOnly.length === 6 && onComplete) {
      onComplete(numericOnly);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 my-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl border transition-all outline-none 
            ${
              digits[i]
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-sm shadow-purple-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white'
            }
            focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};
