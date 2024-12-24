import React from "react";

const OtpInput = ({ otp, setOtp }) => {
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Allow only one digit per box
    setOtp(newOtp);

    // Move focus to next input
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <div className="flex justify-center gap-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          value={digit}
          maxLength="1"
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 text-center text-2xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ))}
    </div>
  );
};

export default OtpInput;
