import React, { useState } from 'react';
import { authStorage } from '../../auth/storage';

const AdminLogin = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!password) return setError('Password is required.');
    if (password !== authStorage.getAdminPassword()) return setError('Invalid admin password.');
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm p-6 rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
        <h2 className="text-xl font-bold">Admin Panel Access</h2>
        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Admin Password" className="mt-4 w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"/>
        {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
        <button className="w-full mt-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500">Enter Admin Panel</button>
      </form>
    </div>
  );
};

export default AdminLogin;
