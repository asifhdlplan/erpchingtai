import React, { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderReceive from './pages/OrderReceive';
import PlanningSheetCreation from './pages/PlanningSheetCreation';
import AllPlanningSheets from './pages/AllPlanningSheets';

const ERPApp = () => {
  const [currentPage, setCurrentPage] = useState('order_receive');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const { login, logout, session } = useAuth();

  const isAdminRoute = useMemo(() => window.location.pathname === '/admin', []);

  const renderERPPage = () => {
    switch (currentPage) {
      case 'order_receive': return <OrderReceive />;
      case 'planning_creation': return <PlanningSheetCreation />;
      case 'all_planning': return <AllPlanningSheets />;
      default: return <OrderReceive />;
    }
  };

  if (isAdminRoute) {
    return (
      <AdminProtectedRoute
        unlocked={adminUnlocked}
        fallback={<AdminLogin onSuccess={() => setAdminUnlocked(true)} />}
      >
        <AdminDashboard />
      </AdminProtectedRoute>
    );
  }

  return (
    <ProtectedRoute fallback={<LoginPage onLogin={login} />}>
      <div className="app-container">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-3 py-2 shadow">
          <span className="text-sm text-slate-700">Welcome, {session?.username}</span>
          <button onClick={logout} className="text-xs px-3 py-1 rounded bg-slate-900 text-white">Logout</button>
        </div>

        {renderERPPage()}

        <div className="fixed bottom-6 right-6 flex gap-2 z-50 bg-slate-900/80 p-2 rounded-full backdrop-blur shadow-2xl border border-slate-700">
          <button onClick={() => setCurrentPage('order_receive')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentPage === 'order_receive' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>Order Receive</button>
          <button onClick={() => setCurrentPage('planning_creation')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentPage === 'planning_creation' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>Planning Creation</button>
          <button onClick={() => setCurrentPage('all_planning')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentPage === 'all_planning' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>All Planning Sheets</button>
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <ERPApp />
    </AuthProvider>
  );
}

export default App;
