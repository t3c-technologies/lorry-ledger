import React, { forwardRef } from "react";

const InputField = forwardRef(({ placeholder, value, onChange }, ref) => {
  // Handle input change to allow only numbers and limit to 10 digits
  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Allow only digits (0-9) and limit to 10 characters
    if (/^\d{0,10}$/.test(inputValue)) {
      onChange(e); // Call the parent onChange function if valid
    }
  };

  return (
    <input
      ref={ref}
      type="text" // Use text for better control
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
});

// Add a display name for better debugging
InputField.displayName = 'InputField';

export default InputField;