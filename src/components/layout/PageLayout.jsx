import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { key: 'order_receive', label: 'Order Receive' },
    { key: 'planning_creation', label: 'Planning Creation' },
    { key: 'all_planning', label: 'All Planning Sheets' }
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
      <div className="p-6 bg-slate-950 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">HCT <span className="text-blue-400">ERP</span></h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Planning Module</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate?.(item.key)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${currentPage === item.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800/40 text-slate-200 hover:bg-slate-800'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export const PageLayout = ({ children, currentPage, onNavigate }) => {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b px-6 flex items-center justify-end">
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="text-sm px-3 py-1 rounded border bg-slate-50">Welcome, {session?.username}</button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg p-2 z-40">
                <button onClick={logout} className="w-full text-left text-sm px-2 py-1 hover:bg-slate-100 rounded">Logout</button>
              </div>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};
