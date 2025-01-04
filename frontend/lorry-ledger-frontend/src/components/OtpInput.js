import React, { useRef } from "react"; // Added useRef import

const OtpInput = ({ otp, setOtp, firstInputRef }) => {
  // Create array of refs with first ref from props
  const inputRefs = [
    firstInputRef, 
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Allow only one digit per box
    setOtp(newOtp);

    // Move focus to next input using refs instead of getElementById
    if (value && index < otp.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace using refs
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty and not first input, move to previous
        inputRefs[index - 1].current?.focus();
      } else if (otp[index]) {
        // If current input has value, clear it
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    
    // Handle right arrow
    if (e.key === "ArrowRight" && index < otp.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle paste functionality
  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/[^0-9]/g, '').slice(0, 4);
    
    if (pastedNumbers) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedNumbers.length && index + i < 4; i++) {
        newOtp[index + i] = pastedNumbers[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit, idx) => !digit && idx >= index);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 4) {
        inputRefs[nextEmptyIndex].current?.focus();
      } else {
        inputRefs[3].current?.focus();
      }
    }
  };

  return (
    <div className="flex justify-center gap-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric" // Shows numeric keyboard on mobile
          value={digit}
          maxLength="1"
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          className="w-12 h-12 text-center text-2xl border rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-primary 
                   transition-all duration-200 
                   bg-white dark:bg-gray-800 
                   border-gray-300 dark:border-gray-600
                   focus:border-primary dark:focus:border-primary"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;