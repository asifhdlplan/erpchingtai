import React from 'react';

export const FormInput = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-2 py-1 text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-700 transition-all bg-white ${
          required && !value ? 'border-red-400' : 'border-slate-400'
        }`}
      />
    </div>
  );
};

export const SelectInput = ({ label, name, value, onChange, options, required = false, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`px-2 py-1 text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-700 transition-all bg-white ${
          required && !value ? 'border-red-400' : 'border-slate-400'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative w-full max-w-md">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 w-full text-sm border border-slate-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-700 bg-white"
      />
    </div>
  );
};
