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
        order.orderRef?.toLowerCase().includes(s) ||
        order.items?.some(item => item.styleNo?.toLowerCase().includes(s))
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
    <div className="office-card space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 block">Search Order</label>
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
          className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold rounded shadow-xs transition-all"
        >
          CLEAR
        </button>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
              <tr>
                <th className="p-2 border-r border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">PI No</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Buyer</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Customer</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Style(s)</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Order Ref</th>
                <th className="p-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {results.map(order => {
                const styles = [...new Set(order.items?.map(item => item.styleNo))].filter(Boolean).join(', ');
                return (
                  <tr key={order.id} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2 border-r border-slate-200 dark:border-slate-750 font-medium text-slate-900 dark:text-slate-100">{order.piNo}</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-750">{order.buyer}</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-750">{order.customer}</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-750 font-mono text-slate-600 dark:text-slate-400 font-semibold max-w-[150px] truncate" title={styles}>{styles || '-'}</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-750">{order.orderRef}</td>
                    <td className="p-2">
                      <button 
                        onClick={() => onOrderSelect(order)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline"
                      >
                        Select Order
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
