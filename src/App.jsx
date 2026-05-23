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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { login, logout, session } = useAuth();

  const isAdminRoute = window.location.pathname === '/admin';

  const renderERPPage = () => {
    switch (currentPage) {
      case 'order_receive': return <OrderReceive currentPage={currentPage} onNavigate={setCurrentPage} />;
      case 'planning_creation': return <PlanningSheetCreation currentPage={currentPage} onNavigate={setCurrentPage} />;
      case 'all_planning': return <AllPlanningSheets currentPage={currentPage} onNavigate={setCurrentPage} />;
      default: return <OrderReceive currentPage={currentPage} onNavigate={setCurrentPage} />;
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
        {showAdminPanel && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setShowAdminPanel(false)}
                className="absolute -top-10 right-0 text-white/90 text-sm px-2 py-1"
              >
                Close
              </button>
              <AdminLogin onSuccess={() => { setAdminUnlocked(true); setShowAdminPanel(false); window.history.pushState({}, '', '/admin'); }} />
            </div>
          </div>
        )}

        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-3 py-2 shadow">
          <button onClick={() => setShowAdminPanel(true)} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">Admin Panel</button>
          <span className="text-sm text-slate-700">Welcome, {session?.username}</span>
          <button onClick={logout} className="text-xs px-3 py-1 rounded bg-slate-900 text-white">Logout</button>
        </div>

        {renderERPPage()}
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
