import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { key: 'order_receive', label: 'Order Receive' },
    { key: 'planning_creation', label: 'Planning Creation' },
    { key: 'all_planning', label: 'All Planning Sheets' }
  ];

  return (
    <aside className="w-64 h-screen bg-[#d8e3f1] text-[#1f3c5e] flex flex-col border-r border-[#8ea6c3]">
      <div className="p-4 sap-header">
        <h1 className="text-lg font-bold tracking-tight">HCT <span className="text-[#0b4f8a]">ERP</span></h1>
        <p className="text-[10px] uppercase tracking-wider mt-1 text-[#3a5f86]">Planning Module</p>
      </div>
      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate?.(item.key)}
            className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bold border ${currentPage === item.key ? 'bg-[#0b4f8a] text-white border-[#0a3d6a]' : 'sap-btn border-[#8ea6c3]'}`}
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
    <div className="flex h-screen bg-[#e7edf5] overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 sap-header px-4 flex items-center justify-end">
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="sap-btn text-xs px-3 py-1">User: {session?.username}</button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-[#f3f6fa] border border-[#8ea6c3] rounded-sm shadow-lg p-2 z-40">
                <button onClick={logout} className="w-full text-left text-xs px-2 py-1 sap-btn">Logout</button>
              </div>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};
