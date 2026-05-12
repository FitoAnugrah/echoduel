import React from 'react';

// Reusable neumorphism button component.
const Button = ({ children, type = 'button', onClick, className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`neu-button rounded-2xl px-5 py-3 text-sm font-semibold text-slate-900 transition duration-200 hover:shadow-neu-sm disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
