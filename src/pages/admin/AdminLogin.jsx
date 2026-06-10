import React, { useState } from 'react';
import { authStorage } from '../../auth/storage';

const AdminLogin = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return setError('Password is required.');
    const adminPwdVal = await authStorage.getAdminPassword();
    if (password !== adminPwdVal) return setError('Invalid admin password.');
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <form onSubmit={submit} className="w-full max-w-sm p-6 rounded-lg border border-slate-200/80 bg-white/95 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Admin Authentication</h2>
        <p className="text-xs text-slate-500 mt-1">Please enter the administrative bypass password.</p>
        
        <input 
          type="password" 
          value={password} 
          onChange={(e) => { setPassword(e.target.value); setError(''); }} 
          placeholder="Admin Password" 
          autoComplete="new-password"
          className="mt-4 w-full px-3 py-2 rounded border border-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-950 text-sm"
        />
        {error && <p className="text-red-600 text-xs mt-2 font-medium">{`[ERROR] ${error}`}</p>}
        <button className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded shadow-sm transition-all">
          Access Admin Dashboard
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
