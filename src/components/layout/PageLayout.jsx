import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentPage, onNavigate, onAdminClick, isOpen, onClose }) => {
  const { session, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { key: 'order_receive', label: 'Order Receive' },
    { key: 'active_orders', label: 'Active Orders' },
    { key: 'completed_orders', label: 'Completed Orders' },
    { key: 'planning_creation', label: 'Planning Creation' },
    { key: 'all_planning', label: 'All Planning Sheets' }
  ];

  const handleNavClick = (key) => {
    onNavigate?.(key);
    onClose?.(); // Close mobile drawer after navigation
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 select-none transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo block */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-2 relative">
          {/* Mobile drawer close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden text-slate-400 hover:text-white p-1"
            title="Close Drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="HCT ERP Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
              HCT <span className="text-blue-400 block text-[10px] tracking-widest mt-0.5">ERP</span>
            </h1>
          </div>
          <div>
            <span className="inline-block text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-950/30 shadow-sm animate-pulse-soft animate-color-flow animate-border-flow whitespace-nowrap">
              Created By Asif
            </span>
          </div>
        </div>

        {/* User / Session Information Card */}
        <div className="p-3 mx-3 mt-3 rounded border border-slate-800 bg-slate-950/20 shadow-sm flex flex-col gap-2">
          <div className="text-xs text-slate-300 font-semibold flex flex-col gap-1">
            <span className="text-[9px] uppercase text-slate-500 font-extrabold tracking-wider">Active Session</span>
            <span className="text-blue-400 font-bold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {session?.username}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-t border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 font-extrabold tracking-wider">Appearance</span>
            <button 
              onClick={toggleTheme}
              className="text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              {theme === 'dark' ? (
                <>
                  <span className="text-amber-400 text-xs">☀️</span> Light
                </>
              ) : (
                <>
                  <span className="text-indigo-400 text-xs">🌙</span> Dark
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-800">
            <button 
              onClick={() => { onAdminClick?.(); onClose?.(); }}
              className="w-full text-center text-[10px] font-bold py-1.5 px-2 rounded-sm border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all uppercase tracking-wider"
            >
              Admin Panel
            </button>
            <button 
              onClick={() => { logout(); onClose?.(); }}
              className="w-full text-center text-[10px] font-bold py-1.5 px-2 rounded-sm border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-all uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation block */}
        <nav className="flex-1 p-3 mt-2 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`w-full text-left px-3 py-2.5 rounded text-xs font-semibold border transition-all ${
                currentPage === item.key 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Contact Support Section */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/20 flex flex-col gap-2">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-blue-400 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>if face any issue pls contact :</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* WhatsApp */}
            <a
              href="https://wa.me/8801748460707"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-emerald-950/40 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/20 hover:border-emerald-500 hover:text-white transition-all text-[10px] font-bold"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.012 2C6.506 2 2.023 6.478 2.022 11.984a9.96 9.96 0 001.335 4.978L2 22l5.177-1.356A9.897 9.897 0 0012.01 22c5.506 0 9.989-4.478 9.99-9.984C22 6.507 17.518 2 12.012 2zm6.36 13.917c-.278.786-1.624 1.5-2.22 1.567-.544.062-1.25.1-3.666-.897-3.09-1.274-5.07-4.414-5.224-4.62-.154-.206-1.25-1.66-1.25-3.168 0-1.508.788-2.25 1.066-2.544.278-.293.608-.36.81-.36.202 0 .405.002.582.01.185.008.43-.075.674.514.248.6.843 2.062.918 2.213.074.152.124.327.024.526-.1.2-.15.326-.298.502-.149.176-.312.392-.446.526-.149.15-.306.313-.13.614.177.302.788 1.298 1.688 2.098.9 1 1.66 1.31 1.96 1.46.3.15.474.125.652-.075.177-.2.756-.88.958-1.18.203-.3.405-.25.684-.15.278.1.1.758.82.909.72.15 1.216.604 1.393.754.177.15.354.225.278.425z" fill="#25D366"/>
              </svg>
              <span>WhatsApp Chat</span>
            </a>

            {/* Email */}
            <a
              href="mailto:asifjahandesh@gmail.com"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:border-red-500 hover:text-white transition-all text-[10px] font-bold"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#EA4335"/>
                <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Email Support</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/mdasifjahan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-blue-950/40 bg-blue-950/10 text-blue-400 hover:bg-blue-950/20 hover:border-blue-500 hover:text-white transition-all text-[10px] font-bold"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0A66C2"/>
              </svg>
              <span>LinkedIn Profile</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export const PageLayout = ({ children, currentPage, onNavigate, onAdminClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        onAdminClick={onAdminClick} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile Header Toggle Bar */}
        <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center md:hidden justify-between z-30 select-none">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white transition-all"
            title="Open Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="HCT ERP Logo" className="w-6 h-6 object-contain" />
            <span className="text-xs font-black text-white uppercase tracking-wider">HCT ERP</span>
          </div>
          <div className="w-8"></div> {/* Balance spacer */}
        </header>

        {/* Scrollable Main Area Container */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
