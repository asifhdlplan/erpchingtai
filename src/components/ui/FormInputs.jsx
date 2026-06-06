import React from 'react';

export const FormInput = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 py-1.5 text-xs rounded border bg-white text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
          required && !value ? 'border-red-300 bg-red-50/10' : 'border-slate-300'
        }`}
      />
    </div>
  );
};

export const SelectInput = ({ label, name, value, onChange, options, required = false, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`px-3 py-1.5 text-xs rounded border bg-white text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
          required && !value ? 'border-red-300 bg-red-50/10' : 'border-slate-300'
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
        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-3 py-1.5 w-full text-xs rounded border border-slate-300 bg-white text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
    </div>
  );
};
