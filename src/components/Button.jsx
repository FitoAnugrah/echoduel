import React from 'react';

// Reusable neumorphism button component.
const Button = ({ children, type = 'button', onClick, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`neu-button rounded-2xl px-5 py-3 text-sm font-semibold text-slate-900 transition duration-200 hover:shadow-neu-sm ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
