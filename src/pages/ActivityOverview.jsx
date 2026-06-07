import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { storageService } from '../services/storage';
import { planningStorage } from '../services/planningStorage';

const ActivityOverview = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    planningSheets: 0,
    totalQuantity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const orders = await storageService.getAllOrders();
      const sheets = await planningStorage.getAllSheets();
      
      const active = orders.filter(o => o.status !== 'Completed');
      const completed = orders.filter(o => o.status === 'Completed');
      
      const totalQty = active.reduce((sum, order) => {
        const orderQty = order.items?.reduce((s, item) => s + (parseFloat(item.qnty) || 0), 0) || 0;
        return sum + orderQty;
      }, 0);

      setStats({
        activeOrders: active.length,
        completedOrders: completed.length,
        planningSheets: sheets.length,
        totalQuantity: totalQty
      });
      if (setStatus) setStatus({ text: 'Activity Overview data retrieved successfully.', type: 'S' });
    } catch (e) {
      console.error('Failed to load dashboard statistics:', e);
      if (setStatus) setStatus({ text: 'Failed to retrieve activity stats.', type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      currentPage={currentPage} 
      onNavigate={onNavigate} 
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      {/* Transaction Action Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between select-none transition-colors">
        <div className="flex gap-2">
          <button onClick={loadDashboardStats} className="sap-btn" title="Refresh stats data">🔄 Refresh Stats</button>
          <button onClick={() => onNavigate('sap_easy_access')} className="sap-btn sap-btn-secondary" title="Back to Easy Access">🏠 Easy Access</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Display Mode
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-[#0B0F19] space-y-6 transition-colors">
        {/* System Overview Dashboard Box */}
        <div className="office-card">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <span className="text-blue-550">📊</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">ERP System Activity Overview</h2>
          </div>
          
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">Loading statistics from repository database...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat Card 1 */}
              <div 
                className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg flex flex-col hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group" 
                onClick={() => onNavigate('active_orders')}
              >
                <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Active PO Backlog</span>
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2 font-mono">{stats.activeOrders}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">Sales Management</span>
              </div>
              
              {/* Stat Card 2 */}
              <div 
                className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg flex flex-col hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group" 
                onClick={() => onNavigate('completed_orders')}
              >
                <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Completed PO Log</span>
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2 font-mono">{stats.completedOrders}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">Archived Orders</span>
              </div>

              {/* Stat Card 3 */}
              <div 
                className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg flex flex-col hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group" 
                onClick={() => onNavigate('all_planning')}
              >
                <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Warp Planning Sheets</span>
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2 font-mono">{stats.planningSheets}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">Production Planning</span>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg flex flex-col hover:border-blue-500 hover:shadow-md transition-all duration-200">
                <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Total Program Qty</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3 font-mono">{stats.totalQuantity.toLocaleString()} Yds</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">Active demand metric</span>
              </div>
            </div>
          )}
        </div>

        {/* Informative Grid Details */}
        <div className="office-card">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <span className="text-blue-500">ℹ</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">System Status & Component Version</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-lg space-y-2.5">
              <div className="font-bold border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">SAP System Data</div>
              <div className="flex justify-between"><span>System ID:</span><span className="font-bold text-slate-800 dark:text-slate-200">CT1</span></div>
              <div className="flex justify-between"><span>Database:</span><span className="font-bold text-emerald-600 dark:text-emerald-400">Supabase (PostgreSQL)</span></div>
              <div className="flex justify-between"><span>Release:</span><span className="font-bold text-slate-800 dark:text-slate-200">ECC 6.0 (EHP 7)</span></div>
              <div className="flex justify-between"><span>OS Platform:</span><span className="font-bold text-slate-800 dark:text-slate-200">Windows Server NT</span></div>
              <div className="flex justify-between"><span>App Server:</span><span className="font-bold text-slate-800 dark:text-slate-200">Vite Core Node</span></div>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-lg space-y-2.5">
              <div className="font-bold border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">Client Connections</div>
              <div className="flex justify-between"><span>Target Client:</span><span className="font-bold text-slate-800 dark:text-slate-200">300 (Production)</span></div>
              <div className="flex justify-between"><span>Local Fallback Status:</span><span className="font-bold text-blue-600 dark:text-blue-400">Active & Sync'd</span></div>
              <div className="flex justify-between"><span>Active User Logins:</span><span className="font-bold text-slate-800 dark:text-slate-200">1 (ASIF)</span></div>
              <div className="flex justify-between"><span>Status Code:</span><span className="font-bold text-emerald-600 dark:text-emerald-400">200 OK</span></div>
              <div className="flex justify-between"><span>Current Local Time:</span><span className="font-bold text-slate-800 dark:text-slate-200">{new Date().toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ActivityOverview;
