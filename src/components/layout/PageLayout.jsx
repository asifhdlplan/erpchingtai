import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const PageLayout = ({ 
  children, 
  currentPage, 
  onNavigate, 
  onAdminClick,
  status = { text: '', type: '' },
  setStatus
}) => {
  const { session, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [treeExpanded, setTreeExpanded] = useState({
    easyAccess: true,
    logistics: true,
    sales: true,
    production: true,
    materials: true,
    infoSystems: true,
    admin: false
  });

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



  const getTransactionInfo = () => {
    switch (currentPage) {
      case 'order_receive':
        return { code: 'VA01', title: 'Create Sales Order' };
      case 'active_orders':
        return { code: 'VA05', title: 'Active Sales Orders List' };
      case 'completed_orders':
        return { code: 'VA05_COMP', title: 'Completed Sales Orders Archive' };
      case 'planning_creation':
        return { code: 'CO01', title: 'Create Production Sizing Plan' };
      case 'all_planning':
        return { code: 'COOIS', title: 'Production Plan Archive' };
      case 'admin_dashboard':
        return { code: 'SU01', title: 'User Maintenance & Access' };
      case 'activity_overview':
        return { code: 'ZACT', title: 'System Activity Overview' };
      case 'yarn_stock_overview':
        return { code: 'MMBE', title: 'Yarn Warehouse Stock Status' };
      case 'yarn_stock_entry':
        return { code: 'MIGO', title: 'Yarn Stock Goods Receipt' };
      case 'yarn_demand_creation':
        return { code: 'ZDEM_NEW', title: 'Yarn Demand Creation' };
      case 'all_yarn_demands':
        return { code: 'ZDEM_LIST', title: 'All Yarn Demands Archive' };
      case 'sap_easy_access':
      default:
        return { code: 'Home', title: 'Main Menu Gateway' };
    }
  };

  const currentInfo = getTransactionInfo();

  const toggleFolder = (folder) => {
    setTreeExpanded(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  return (
    <div className="flex flex-col h-screen select-none bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans">
      {/* 1. Modern Top Navigation Bar */}
      <header className="h-14 bg-white dark:bg-[#151D30] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Collapse Sidebar Button */}
          <button 
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
            title="Toggle Menu Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-extrabold text-sm tracking-wider uppercase text-blue-600 dark:text-blue-400 font-sans">
              Ha-meem Ching Tai
            </span>
          </div>
          
          <div className="hidden md:flex w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          {/* Active Breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {currentInfo.title}
            </span>
          </div>
        </div>



        {/* Right Section: System Actions & Profile */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* User Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {session?.username?.slice(0, 2) || 'AS'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {session?.username || 'ASIF'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                 Narshingdi Plant
              </span>
            </div>
          </div>

          {/* Logoff Button */}
          <button 
            onClick={logout}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition font-semibold"
            title="Log off"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace and Sidebar Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 top-14 bg-black/40 z-20"
          />
        )}

        {/* Navigation Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col select-none overflow-y-auto shrink-0 z-30 shadow-lg fixed md:relative top-14 bottom-0 left-0 md:top-0 md:bottom-0">
            <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Navigation Menu</span>
            </div>

            {/* Folder Tree listing */}
            <div className="p-3 space-y-1 font-sans text-xs flex-1">
              {/* Home / Easy Access Menu */}
              <div 
                onClick={() => onNavigate('sap_easy_access')}
                className={`flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer transition ${currentPage === 'sap_easy_access' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <span>🏠</span>
                <span>ERP Portal Home</span>
              </div>

              <div className="h-[1px] bg-slate-800 my-2"></div>

              {/* Logistics Folder */}
              <div>
                <div 
                  className="flex items-center justify-between gap-1 py-1.5 px-2 hover:bg-slate-800/50 hover:text-white cursor-pointer font-bold rounded"
                  onClick={() => toggleFolder('logistics')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-sm">📦</span>
                    <span>Logistics</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{treeExpanded.logistics ? '▼' : '▶'}</span>
                </div>

                {treeExpanded.logistics && (
                  <div className="pl-3 border-l border-slate-800 space-y-1 mt-1 ml-3">
                    {/* Sales & Distribution */}
                    <div>
                      <div 
                        className="flex items-center justify-between gap-1 py-1 px-2 hover:bg-slate-800/50 hover:text-white cursor-pointer font-semibold rounded text-[11px]"
                        onClick={() => toggleFolder('sales')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">🛍</span>
                          <span>Sales & Distribution</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{treeExpanded.sales ? '▼' : '▶'}</span>
                      </div>

                      {treeExpanded.sales && (
                        <div className="pl-3 border-l border-slate-850 space-y-0.5 mt-0.5 ml-2">
                          <div 
                            onClick={() => onNavigate('order_receive')}
                            className={`sap-tree-item ${currentPage === 'order_receive' ? 'active' : ''}`}
                          >
                            Order Receive
                          </div>
                          <div 
                            onClick={() => onNavigate('active_orders')}
                            className={`sap-tree-item ${currentPage === 'active_orders' ? 'active' : ''}`}
                          >
                            Active Orders
                          </div>
                          <div 
                            onClick={() => onNavigate('completed_orders')}
                            className={`sap-tree-item ${currentPage === 'completed_orders' ? 'active' : ''}`}
                          >
                            Completed Orders
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Production Planning */}
                    <div>
                      <div 
                        className="flex items-center justify-between gap-1 py-1 px-2 hover:bg-slate-800/50 hover:text-white cursor-pointer font-semibold rounded text-[11px]"
                        onClick={() => toggleFolder('production')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">🏭</span>
                          <span>Production Planning</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{treeExpanded.production ? '▼' : '▶'}</span>
                      </div>

                      {treeExpanded.production && (
                        <div className="pl-3 border-l border-slate-850 space-y-0.5 mt-0.5 ml-2">
                          <div 
                            onClick={() => onNavigate('planning_creation')}
                            className={`sap-tree-item ${currentPage === 'planning_creation' ? 'active' : ''}`}
                          >
                            Sizing Plan Creation
                          </div>
                          <div 
                            onClick={() => onNavigate('all_planning')}
                            className={`sap-tree-item ${currentPage === 'all_planning' ? 'active' : ''}`}
                          >
                            Sizing Plan Archive
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Materials Management (Warehouse) */}
                    <div>
                      <div 
                        className="flex items-center justify-between gap-1 py-1 px-2 hover:bg-slate-800/50 hover:text-white cursor-pointer font-semibold rounded text-[11px]"
                        onClick={() => toggleFolder('materials')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">📦</span>
                          <span>Materials Management</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{treeExpanded.materials ? '▼' : '▶'}</span>
                      </div>

                      {treeExpanded.materials && (
                        <div className="pl-3 border-l border-slate-850 space-y-0.5 mt-0.5 ml-2">
                          <div 
                            onClick={() => onNavigate('yarn_stock_entry')}
                            className={`sap-tree-item ${currentPage === 'yarn_stock_entry' ? 'active' : ''}`}
                          >
                            Yarn Stock Entry
                          </div>
                          <div 
                            onClick={() => onNavigate('yarn_stock_overview')}
                            className={`sap-tree-item ${currentPage === 'yarn_stock_overview' ? 'active' : ''}`}
                          >
                            Yarn Stock Status
                          </div>
                          <div 
                            onClick={() => onNavigate('yarn_demand_creation')}
                            className={`sap-tree-item ${currentPage === 'yarn_demand_creation' ? 'active' : ''}`}
                          >
                            Yarn Demand Creation
                          </div>
                          <div 
                            onClick={() => onNavigate('all_yarn_demands')}
                            className={`sap-tree-item ${currentPage === 'all_yarn_demands' ? 'active' : ''}`}
                          >
                            All Yarn Demands
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Information Systems */}
              <div>
                <div 
                  className="flex items-center justify-between gap-1 py-1.5 px-2 hover:bg-slate-800/50 hover:text-white cursor-pointer font-bold rounded"
                  onClick={() => toggleFolder('infoSystems')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-sm">📊</span>
                    <span>Info Systems</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{treeExpanded.infoSystems ? '▼' : '▶'}</span>
                </div>

                {treeExpanded.infoSystems && (
                  <div className="pl-3 border-l border-slate-800 space-y-1 mt-1 ml-3">
                    <div 
                      onClick={() => onNavigate('activity_overview')}
                      className={`sap-tree-item ${currentPage === 'activity_overview' ? 'active' : ''}`}
                    >
                      Activity Overview
                    </div>
                  </div>
                )}
              </div>

              {/* Administration */}
              <div>
                <div 
                  className="flex items-center justify-between gap-1 py-1.5 px-2 hover:bg-slate-800/50 hover:text-white cursor-pointer font-bold rounded"
                  onClick={() => toggleFolder('admin')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">🛡</span>
                    <span>Administration</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{treeExpanded.admin ? '▼' : '▶'}</span>
                </div>

                {treeExpanded.admin && (
                  <div className="pl-3 border-l border-slate-800 space-y-1 mt-1 ml-3">
                    <div 
                      onClick={() => onNavigate('admin_dashboard')}
                      className={`sap-tree-item ${currentPage === 'admin_dashboard' ? 'active' : ''}`}
                    >
                      User Maintenance
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Contact Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/20 text-[10px] text-slate-500 space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-slate-400 pb-0.5 border-b border-slate-800">Support Panel</div>
              <div className="flex items-center gap-1.5"><span>📞</span><span>WA: +8801748460707</span></div>
              <div className="flex items-center gap-1.5"><span>✉️</span><span>asifjahandesh@gmail.com</span></div>
              <div className="flex items-center gap-1.5"><span>💼</span><span>LI: mdasifjahan</span></div>
            </div>
          </aside>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
          {children}
        </main>
      </div>

      {/* 3. Sleek Toast Status Bar (Bottom Strip) */}
      <footer className="h-7 bg-white dark:bg-[#151D30] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 text-[11px] text-slate-500 dark:text-slate-400 select-none z-40">
        <div className="flex items-center gap-2 font-medium">
          {status.text ? (
            <div className="flex items-center gap-1.5 animate-pulse">
              {status.type === 'S' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
              {status.type === 'E' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
              {status.type === 'W' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
              <span className={`font-semibold ${status.type === 'S' ? 'text-emerald-600 dark:text-emerald-400' : status.type === 'E' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {status.text}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>System Core Ready</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 font-mono text-[10px] tracking-wider">
          <span>SYS: <span className="font-semibold text-slate-700 dark:text-slate-300">CT1</span></span>
          <span>CLIENT: <span className="font-semibold text-slate-700 dark:text-slate-300">300</span></span>
          <span>USER: <span className="font-semibold text-blue-600 dark:text-blue-400">{session?.username || 'ASIF'}</span></span>
          <span>LANGUAGE: <span className="font-semibold text-slate-700 dark:text-slate-300">EN</span></span>
        </div>
      </footer>
    </div>
  );
};
