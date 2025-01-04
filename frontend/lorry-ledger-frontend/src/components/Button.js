import React from 'react';

const Button = ({ 
  text, 
  onClick, 
  color = 'blue',
  fullWidth = true,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const baseStyles = 'py-2 rounded-lg text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const widthStyles = fullWidth ? 'w-full' : 'w-auto';

  const colorStyles = {
    blue: 'bg-primary',  // Using your tailwind config color
    green: 'bg-accent',  // Using your tailwind config color
    red: 'bg-danger',    // Using your tailwind config color
    gray: 'bg-textSecondary' // Using your tailwind config color
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${widthStyles} ${colorStyles[color] || 'bg-textSecondary'} ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;