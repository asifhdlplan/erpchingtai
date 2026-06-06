import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { SearchBar } from '../components/ui/FormInputs';
import { storageService } from '../services/storage';

const CompletedOrders = ({ currentPage, onNavigate, onAdminClick, onEditOrder }) => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await storageService.getAllOrders();
    setOrders(data.filter(order => order.status === 'Completed'));
  };

  const calculateTotalOrderQty = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (parseFloat(item.qnty) || 0), 0);
  };

  const calculateNeedToProgram = (order) => {
    const orderQty = calculateTotalOrderQty(order);
    const warpTaken = parseFloat(order.warpTaken) || 0;
    return (orderQty * 1.0936) - warpTaken;
  };

  const handleToggleComplete = async (order, shouldComplete) => {
    const updatedOrder = { ...order, status: shouldComplete ? 'Completed' : 'Active' };
    try {
      await storageService.saveOrder(updatedOrder);
      await loadOrders();
    } catch (e) {
      alert('Failed to update order status.');
    }
  };

  const handleDelete = async (id) => {
    const password = window.prompt('Please enter the delete confirmation password:');
    if (password === null) return; // cancelled
    if (password !== '0707') {
      alert('Invalid password! Deletion cancelled.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await storageService.deleteOrder(id);
        await loadOrders();
      } catch (e) {
        alert('Failed to delete order.');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchStr = searchQuery.toLowerCase();
    return (
      order.piNo?.toLowerCase().includes(searchStr) ||
      order.buyer?.toLowerCase().includes(searchStr) ||
      order.customer?.toLowerCase().includes(searchStr) ||
      order.orderRef?.toLowerCase().includes(searchStr) ||
      order.items?.some(item => item.styleNo?.toLowerCase().includes(searchStr))
    );
  });

  return (
    <PageLayout currentPage={currentPage} onNavigate={onNavigate} onAdminClick={onAdminClick}>
      <header className="sap-header border-b border-slate-200 p-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Completed Orders</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-full border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-wider">
                {filteredOrders.length} Completed
              </span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
              Polash, Narshingdi
            </p>
          </div>
          <div className="w-full sm:w-80">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search Completed Orders (PI, Buyer, Style)..." />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="sap-panel p-5 animate-in fade-in duration-500">
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 border-r border-slate-200">PI No</th>
                  <th className="p-3 border-r border-slate-200">Order Ref</th>
                  <th className="p-3 border-r border-slate-200">Buyer</th>
                  <th className="p-3 border-r border-slate-200">Customer</th>
                  <th className="p-3 border-r border-slate-200">Order Qty</th>
                  <th className="p-3 border-r border-slate-200">Warp Taken (m)</th>
                  <th className="p-3 border-r border-slate-200">Need to Program</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-500">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400 italic">No completed orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-200 last:border-b-0 bg-slate-50/20">
                      <td className="p-3 font-semibold text-slate-700 border-r border-slate-200">{order.piNo}</td>
                      <td className="p-3 border-r border-slate-200">{order.orderRef}</td>
                      <td className="p-3 border-r border-slate-200">{order.buyer}</td>
                      <td className="p-3 border-r border-slate-200">{order.customer}</td>
                      <td className="p-3 font-semibold text-slate-600 border-r border-slate-200">{calculateTotalOrderQty(order).toLocaleString()}</td>
                      <td className="p-3 border-r border-slate-200">{order.warpTaken || 0}</td>
                      <td className="p-3 font-semibold text-slate-600 border-r border-slate-200">
                        {calculateNeedToProgram(order).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1.5">
                          <button 
                            onClick={() => handleToggleComplete(order, false)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-all"
                            title="Reopen Order (Mark Active)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.89M9 11l3-3 3 3m-3-3v12" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default CompletedOrders;
