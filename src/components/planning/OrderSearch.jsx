import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { SearchBar } from '../ui/FormInputs';

export const OrderSearch = ({ onOrderSelect }) => {
  const [query, setQuery] = useState('');
  const [allOrders, setAllOrders] = useState([]);
  const [results, setResults] = useState([]);

  const loadOrders = async () => {
    const orders = await storageService.getAllOrders();
    setAllOrders(orders);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filterOrders = (searchText) => {
    const s = (searchText || '').toLowerCase().trim();

    if (!s) {
      setResults(allOrders);
      return;
    }

    const filtered = allOrders.filter((order) => {
      return (
        order.piNo?.toLowerCase().includes(s) ||
        order.buyer?.toLowerCase().includes(s) ||
        order.customer?.toLowerCase().includes(s) ||
        order.orderRef?.toLowerCase().includes(s)
      );
    });
    setResults(filtered);
  };

  useEffect(() => {
    filterOrders(query);
  }, [query, allOrders]);

  useEffect(() => {
    const refresh = () => loadOrders();
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return (
    <div className="sap-panel p-5 space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase mb-1.5 block">Search Order</label>
          <SearchBar value={query} onChange={setQuery} placeholder="PI No, Buyer, Style, etc..." />
        </div>
        <button 
          onClick={() => filterOrders(query)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition-all"
        >
          SEARCH
        </button>
        <button 
          onClick={() => { setQuery(''); filterOrders(''); }}
          className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded shadow-xs transition-all"
        >
          CLEAR
        </button>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-md max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="p-2 border-r border-slate-200 text-slate-500 font-bold uppercase text-[10px]">PI No</th>
                <th className="p-2 border-r border-slate-200 text-slate-500 font-bold uppercase text-[10px]">Buyer</th>
                <th className="p-2 border-r border-slate-200 text-slate-500 font-bold uppercase text-[10px]">Customer</th>
                <th className="p-2 border-r border-slate-200 text-slate-500 font-bold uppercase text-[10px]">Order Ref</th>
                <th className="p-2 text-slate-500 font-bold uppercase text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {results.map(order => (
                <tr key={order.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-2 border-r border-slate-200 font-medium">{order.piNo}</td>
                  <td className="p-2 border-r border-slate-200">{order.buyer}</td>
                  <td className="p-2 border-r border-slate-200">{order.customer}</td>
                  <td className="p-2 border-r border-slate-200">{order.orderRef}</td>
                  <td className="p-2">
                    <button 
                      onClick={() => onOrderSelect(order)}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Select Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
