import React from 'react';

const Button = ({ text, onClick, color }) => {
  const baseStyles =
    'w-full mt-4 py-2 rounded-lg text-white hover:opacity-90 transition-all';

  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${colorStyles[color] || 'bg-gray-500'}`}
    >
      {text}
    </button>
  );
};

export default Button;
