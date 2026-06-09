import React, { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import { PasswordPromptModal } from './components/ui/PasswordPromptModal';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderReceive from './pages/OrderReceive';
import ActiveOrders from './pages/ActiveOrders';
import CompletedOrders from './pages/CompletedOrders';
import PlanningSheetCreation from './pages/PlanningSheetCreation';
import AllPlanningSheets from './pages/AllPlanningSheets';
import SAPEasyAccess from './pages/SAPEasyAccess';
import ActivityOverview from './pages/ActivityOverview';
import YarnStockOverview from './pages/YarnStockOverview';
import YarnStockEntry from './pages/YarnStockEntry';
import YarnDemandCreation from './pages/YarnDemandCreation';
import AllYarnDemands from './pages/AllYarnDemands';

const ERPApp = () => {
  const [currentPage, setCurrentPage] = useState('sap_easy_access');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingDemand, setEditingDemand] = useState(null);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [navTargetPage, setNavTargetPage] = useState(null);
  const { login, logout, session } = useAuth();

  const isAdminRoute = window.location.pathname === '/admin';

  const handleNavigate = (page) => {
    // Clear status bar and editing targets upon changing screens
    setStatus({ text: '', type: '' });
    if (page === 'order_receive') {
      setEditingOrder(null);
    }
    if (page === 'planning_creation') {
      setEditingPlan(null);
    }
    if (page === 'yarn_demand_creation') {
      setEditingDemand(null);
    }
    
    if (page === 'admin_dashboard') {
      setNavTargetPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const renderERPPage = () => {
    switch (currentPage) {
      case 'sap_easy_access':
        return (
          <SAPEasyAccess
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onAdminClick={() => setShowAdminPanel(true)}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'order_receive': 
        return (
          <OrderReceive 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'active_orders':
        return (
          <ActiveOrders 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            onEditOrder={(order) => { 
              setEditingOrder(order); 
              handleNavigate('order_receive'); 
            }}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'completed_orders':
        return (
          <CompletedOrders 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            onEditOrder={(order) => { 
              setEditingOrder(order); 
              handleNavigate('order_receive'); 
            }}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'planning_creation': 
        return (
          <PlanningSheetCreation 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            editingPlan={editingPlan}
            setEditingPlan={setEditingPlan}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'all_planning': 
        return (
          <AllPlanningSheets 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            onEditPlan={(plan) => {
              setEditingPlan(plan);
              handleNavigate('planning_creation');
            }}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'activity_overview':
        return (
          <ActivityOverview 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            status={status}
            setStatus={setStatus}
          />
        );
      case 'yarn_stock_overview':
        return (
          <YarnStockOverview 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            status={status}
            setStatus={setStatus}
          />
        );
      case 'yarn_stock_entry':
        return (
          <YarnStockEntry 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            status={status}
            setStatus={setStatus}
          />
        );
      case 'yarn_demand_creation':
        return (
          <YarnDemandCreation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onAdminClick={() => setShowAdminPanel(true)}
            editingDemand={editingDemand}
            setEditingDemand={setEditingDemand}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'all_yarn_demands':
        return (
          <AllYarnDemands
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onAdminClick={() => setShowAdminPanel(true)}
            onEditDemand={(demand) => {
              setEditingDemand(demand);
              setCurrentPage('yarn_demand_creation');
            }}
            status={status}
            setStatus={setStatus}
          />
        );
      case 'admin_dashboard':
        return (
          <AdminDashboard 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onAdminClick={() => setShowAdminPanel(true)} 
            status={status}
            setStatus={setStatus}
          />
        );
      default: 
        return (
          <SAPEasyAccess
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onAdminClick={() => setShowAdminPanel(true)}
            status={status}
            setStatus={setStatus}
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

        <PasswordPromptModal 
          isOpen={navTargetPage !== null} 
          title="User Maintenance Entry" 
          onClose={() => setNavTargetPage(null)} 
          onSubmit={() => {
            setCurrentPage(navTargetPage);
            setNavTargetPage(null);
          }} 
        />

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
