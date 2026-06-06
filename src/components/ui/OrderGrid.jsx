import React, { useState } from 'react';

export const OrderGrid = ({ rows, setRows }) => {
  const columns = [
    { key: 'styleNo', label: 'StyleNo', required: true },
    { key: 'qnty', label: 'Qnty' },
    { key: 'salesRate', label: 'Sales Rate' },
    { key: 'preCostRate', label: 'PreCostRate' },
    { key: 'approveRate', label: 'ApproveRate' },
    { key: 'delDate', label: 'DelDate', type: 'date' },
    { key: 'compDt', label: 'CompDt', type: 'date' },
    { key: 'piWidth', label: 'PI Width' },
    { key: 'piShrink', label: 'PI Shrink' },
    { key: 'code', label: 'Code', required: true },
    { key: 'salesOty', label: 'SalesOTY' },
    { key: 'construction', label: 'Construction' },
    { key: 'weav', label: 'Weav' },
    { key: 'width', label: 'Width' },
  ];

  const handleInputChange = (rowIndex, key, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [key]: value };
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, {}]);
  };

  const removeRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="p-2 text-[10px] font-bold text-slate-500 uppercase w-10 text-center border-r border-slate-200">#</th>
              {columns.map((col) => (
                <th key={col.key} className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                  {col.label} {col.required && <span className="text-red-500 font-bold">*</span>}
                </th>
              ))}
              <th className="p-2 text-[10px] font-bold text-slate-500 uppercase w-10 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="p-8 text-center text-slate-400 text-xs italic">
                  No items added. Click "ADD ROW" to begin.
                </td>
              </tr>
            )}
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-b-0">
                <td className="p-2 text-center text-xs font-semibold text-slate-400 border-r border-slate-200">{rowIndex + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="p-1 border-r border-slate-200 last:border-r-0">
                    <input
                      type={col.type || 'text'}
                      value={row[col.key] || ''}
                      onChange={(e) => handleInputChange(rowIndex, col.key, e.target.value)}
                      className={`w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded outline-none bg-transparent transition-all ${
                        col.required && !row[col.key] ? 'bg-red-50/30' : ''
                      }`}
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button 
                    onClick={() => removeRow(rowIndex)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-all"
                    title="Remove row"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        onClick={addRow}
        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-all w-fit shadow-sm"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        ADD ROW
      </button>
    </div>
  );
};
