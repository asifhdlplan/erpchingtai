import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Username and password are required.');
      return;
    }
    const ok = onLogin(form.username, form.password);
    if (!ok) setError('Invalid username or password.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.35),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,.2),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,.25),transparent_30%)] animate-pulse" />
      <div className="w-full max-w-md relative z-10 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold tracking-tight">Ha-meem Ching Tai ERP Solution</h1>
        <p className="text-slate-200 text-sm mt-1">(Planning Module)</p>
        <p className="text-slate-300 text-xs mt-2">Created By Asif</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            value={form.username}
            onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(''); }}
          />
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-4 py-3 pr-16 outline-none focus:border-blue-500"
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-3 text-xs text-slate-300 hover:text-white">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <button className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold transition">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
