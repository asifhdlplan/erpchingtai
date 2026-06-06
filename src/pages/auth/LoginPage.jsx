import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    const ok = await onLogin(form.username, form.password);
    if (!ok) setError('Invalid username or password.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="w-full max-w-md relative z-10 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="HCT ERP Logo" className="w-20 h-20 object-contain drop-shadow-md animate-pulse-soft" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
            Ha-meem Ching Tai Pocketing & Accessories Ltd.
          </h1>
          <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mt-1">
            ERP Solution
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Polash, Narshingdi
          </p>
          <div className="mt-2.5">
            <span className="inline-block text-[11px] font-black uppercase px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 shadow-sm animate-pulse-soft animate-color-flow animate-border-flow whitespace-nowrap">
              Created By Asif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Office Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full rounded bg-white border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={form.username}
              onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(''); }}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Password</label>
              <button type="button" onClick={() => setShow((s) => !s)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold focus:outline-none">
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full rounded bg-white border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
            />
          </div>

          {error && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200">
              <p className="text-red-700 text-xs font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all duration-150">
            Sign In to ERP
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
