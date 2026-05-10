import React from 'react';

// Simple controlled input field with label.
const InputField = ({ label, value, onChange, type = 'text', placeholder, id, disabled = false }) => {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
      />
    </label>
  );
};

export default InputField;
