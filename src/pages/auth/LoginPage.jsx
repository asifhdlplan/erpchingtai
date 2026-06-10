import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: '', password: '', client: '300', lang: 'EN' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please enter both User ID and Password.');
      return;
    }
    setError('');
    setLoading(true);
    const ok = await onLogin(form.username, form.password);
    setLoading(false);
    if (!ok) setError('Logon failed. Please check your username and password.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-[#0B0F19] transition-colors duration-200">
      {/* Center login card */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#151D30] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row min-h-[460px] transition-all duration-200">
        
        {/* Left Side: Illustration / Company Welcome Panel */}
        <div className="w-full md:w-1/2 bg-slate-900 dark:bg-[#090C16] p-8 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="z-10">
            {/* Logo and company */}
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-sm tracking-wider uppercase text-blue-400 font-sans">
                Ha-meem Ching Tai
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight leading-tight mt-12">
              Enterprise Resource Planning Portal
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              Ha-meem Ching Tai Pocketing & Accessories Ltd. provides high-quality textile manufacturing and accessories management.
            </p>
          </div>

          <div className="z-10 py-6">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/40 relative shadow-inner">
              <img 
                src="/loom.png" 
                alt="Textile Loom" 
                className="w-full h-28 object-cover opacity-50 filter grayscale contrast-125 hover:scale-105 transition duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-3">
                <span className="text-[10px] text-slate-300 font-mono tracking-widest">Narshingdi Plant Instance</span>
              </div>
            </div>
          </div>

          <div className="z-10 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-3">
            <span>Server Instance: Production</span>
            <span>Client: 300</span>
          </div>
        </div>

        {/* Right Side: Modern Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white dark:bg-[#151D30] transition-colors duration-200">
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Enter your credentials below to access the ERP modules.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Username Input */}
              <div className="flex flex-col">
                <label className="sap-label mb-1">User ID</label>
                <input 
                  type="text" 
                  value={form.username}
                  onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(''); }}
                  className="w-full uppercase font-mono font-semibold sap-required"
                  placeholder="Enter User ID (e.g. ASIF)"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col">
                <label className="sap-label mb-1">Password</label>
                <div className="relative flex items-center">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
                    className="w-full font-mono sap-required pr-16"
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Client & Language row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Client ID</label>
                  <input 
                    type="text" 
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className="w-full text-center font-mono font-bold"
                    maxLength={3}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Language</label>
                  <input 
                    type="text" 
                    value={form.lang}
                    onChange={(e) => setForm({ ...form, lang: e.target.value })}
                    className="w-full text-center uppercase font-mono font-bold"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 border border-rose-200 dark:border-rose-950/30 bg-rose-50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs leading-normal">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 sap-btn"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-8 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono">Narshingdi, Bangladesh</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Created By Asif</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
