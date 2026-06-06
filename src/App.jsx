import React, { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderReceive from './pages/OrderReceive';
import ActiveOrders from './pages/ActiveOrders';
import CompletedOrders from './pages/CompletedOrders';
import PlanningSheetCreation from './pages/PlanningSheetCreation';
import AllPlanningSheets from './pages/AllPlanningSheets';

const ERPApp = () => {
  const [currentPage, setCurrentPage] = useState('order_receive');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const { login, logout, session } = useAuth();

  const isAdminRoute = window.location.pathname === '/admin';

  const handleNavigate = (page) => {
    if (page === 'order_receive') {
      setEditingOrder(null);
    }
    setCurrentPage(page);
  };

  const renderERPPage = () => {
    switch (currentPage) {
      case 'order_receive': 
        return (
          <OrderReceive 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
          />
        );
      case 'active_orders':
        return (
          <ActiveOrders 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            onEditOrder={(order) => { setEditingOrder(order); setCurrentPage('order_receive'); }}
          />
        );
      case 'completed_orders':
        return (
          <CompletedOrders 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            onEditOrder={(order) => { setEditingOrder(order); setCurrentPage('order_receive'); }}
          />
        );
      case 'planning_creation': 
        return <PlanningSheetCreation currentPage={currentPage} onNavigate={handleNavigate} onAdminClick={() => setShowAdminPanel(true)} />;
      case 'all_planning': 
        return <AllPlanningSheets currentPage={currentPage} onNavigate={handleNavigate} onAdminClick={() => setShowAdminPanel(true)} />;
      default: 
        return (
          <OrderReceive 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
          />
        );
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
