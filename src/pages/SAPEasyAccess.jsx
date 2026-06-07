import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';

const SAPEasyAccess = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const quickActions = [
    {
      code: 'VA01',
      title: 'Order Receive',
      desc: 'Register incoming purchase orders',
      page: 'order_receive',
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30'
    },
    {
      code: 'CO01',
      title: 'Create Sizing Plan',
      desc: 'Generate warp sizing programming layouts',
      page: 'planning_creation',
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30'
    },
    {
      code: 'MIGO',
      title: 'Yarn Stock Entry',
      desc: 'Post goods receipt to yarn warehouse ledger',
      page: 'yarn_stock_entry',
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      ),
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
    },
    {
      code: 'MMBE',
      title: 'Yarn Stock Status',
      desc: 'View yarn warehouse stock overview list',
      page: 'yarn_stock_overview',
      icon: (
        <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      bg: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900/30'
    }
  ];

  return (
    <PageLayout 
      currentPage={currentPage} 
      onNavigate={onNavigate} 
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19]">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              ERP Portal Gateway
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ha-meem Ching Tai Pocketing & Accessories Ltd.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Plant Instance:</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              Narshingdi 1000
            </span>
          </div>
        </div>

        {/* Quick actions cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <div 
              key={action.code}
              onClick={() => onNavigate(action.page)}
              className={`office-card border p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between min-h-[130px] ${action.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 shadow-xs border border-slate-100 dark:border-slate-700/50">
                  {action.icon}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {action.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {action.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Splitted Welcome Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Wallpaper (loom picture) */}
          <div className="lg:col-span-2 office-card flex flex-col justify-between min-h-[280px] relative overflow-hidden">
            {/* Subtle grid pattern background */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            
            <div className="z-10 max-w-xl space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">Welcome back</span>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                Corporate Sizing and Inventory Ledger
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Welcome to the Ha-meem Ching Tai enterprise dashboard. Use the navigation panel on the left to access active modules, process orders, and post goods receipts.
              </p>
            </div>

            <div className="z-10 mt-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 relative shadow-inner">
              <img 
                src="/loom.png" 
                alt="Textile Loom" 
                className="w-full h-32 object-cover opacity-80 dark:opacity-60 filter grayscale contrast-125 hover:scale-102 transition duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 dark:from-slate-950/80 to-transparent flex items-end p-4">
                <span className="text-xs text-white/90 font-mono tracking-widest">HA-MEEM CHING TAI MACHINERY OVERVIEW</span>
              </div>
            </div>
          </div>

          {/* Quick tips & info box */}
          <div className="office-card flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                System Guide & Tips
              </h3>
              
              <div className="space-y-3 font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <p>Use the navigation panel on the left to browse and open active screens in Sales, Production, and Warehouse management.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <p>In data entry forms, utilize the search lookup button <span className="font-bold text-blue-600 dark:text-blue-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">🔍</span> next to fields for helpful modal guidelines.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <p>Press the theme switch button (Sun/Moon icon) at the top-right to toggle Light and Dark modes instantly.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
              <span>Environment: Local</span>
              <span>Host ID: Narshingdi_S1</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SAPEasyAccess;
