import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { SearchBar } from '../ui/FormInputs';

export const OrderSearch = ({ onOrderSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    const allOrders = storageService.getAllOrders();
    const filtered = allOrders.filter(order => {
      const s = query.toLowerCase();
      return (
        order.piNo?.toLowerCase().includes(s) ||
        order.buyer?.toLowerCase().includes(s) ||
        order.customer?.toLowerCase().includes(s) ||
        order.orderRef?.toLowerCase().includes(s)
      );
    });
    setResults(filtered);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Search Order</label>
          <SearchBar value={query} onChange={setQuery} placeholder="PI No, Buyer, Style, etc..." />
        </div>
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all"
        >
          SEARCH
        </button>
        <button 
          onClick={() => { setQuery(''); setResults([]); }}
          className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200 transition-all"
        >
          CLEAR
        </button>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto border rounded-md max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 sticky top-0 border-b">
              <tr>
                <th className="p-2 font-bold text-slate-600">PI No</th>
                <th className="p-2 font-bold text-slate-600">Buyer</th>
                <th className="p-2 font-bold text-slate-600">Customer</th>
                <th className="p-2 font-bold text-slate-600">Order Ref</th>
                <th className="p-2 font-bold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map(order => (
                <tr key={order.id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="p-2">{order.piNo}</td>
                  <td className="p-2">{order.buyer}</td>
                  <td className="p-2">{order.customer}</td>
                  <td className="p-2">{order.orderRef}</td>
                  <td className="p-2">
                    <button 
                      onClick={() => onOrderSelect(order)}
                      className="text-blue-600 font-bold hover:underline"
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
