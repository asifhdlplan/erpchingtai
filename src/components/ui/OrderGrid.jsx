import React from 'react';

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
    <div className="flex flex-col gap-2 font-sans select-none">
      <div className="overflow-x-auto border border-[#B8C2CC] bg-white">
        <table className="sap-alv-table min-w-[1200px] border-collapse">
          <thead>
            <tr className="bg-[#E8EDF5] border-b border-[#B8C2CC]">
              <th className="w-10 text-center border-r border-[#B8C2CC]">#</th>
              {columns.map((col) => (
                <th key={col.key} className="border-r border-[#B8C2CC] last:border-r-0">
                  {col.label} {col.required && <span className="text-red-600 font-bold">*</span>}
                </th>
              ))}
              <th className="w-12 text-center">Act</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-slate-400 italic">
                  No line items registered. Click "Insert Row" to add.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[#E5E7EB] hover:bg-[#D9E2F3] last:border-b-0">
                  <td className="text-center font-bold text-slate-400 border-r border-[#B8C2CC]">{rowIndex + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-0 border-r border-[#E5E7EB] last:border-r-0">
                      <input
                        type={col.type || 'text'}
                        value={row[col.key] || ''}
                        onChange={(e) => handleInputChange(rowIndex, col.key, e.target.value)}
                        className={`w-full h-[22px] px-1 border-0 outline-none bg-transparent focus:bg-[#D9E2F3] focus:text-black ${
                          col.required && !row[col.key] ? 'sap-required' : ''
                        }`}
                      />
                    </td>
                  ))}
                  <td className="p-0 text-center flex items-center justify-center h-[22px]">
                    <button 
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-600 hover:text-red-700 font-bold text-[10px] w-full h-full hover:bg-red-50 flex items-center justify-center"
                      title="Delete Row"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={addRow}
          className="sap-btn"
          title="Insert Row"
        >
          ➕ Insert Row
        </button>
      </div>
    </div>
  );
};
