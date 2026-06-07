import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { storageService } from '../services/storage';
import { PasswordPromptModal } from '../components/ui/PasswordPromptModal';

const ActiveOrders = ({ currentPage, onNavigate, onAdminClick, onEditOrder, status, setStatus }) => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await storageService.getAllOrders();
    const active = data.filter(order => order.status !== 'Completed');
    setOrders(active);
    if (setStatus) setStatus({ text: `Retrieved ${active.length} active purchase orders.`, type: 'S' });
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

  const handleWarpTakenChange = (orderId, val) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, warpTaken: val };
      }
      return order;
    }));
  };

  const handleWarpTakenBlur = async (order) => {
    try {
      await storageService.saveOrder(order);
      if (setStatus) setStatus({ text: `Saved Warp Taken for PI: ${order.piNo}`, type: 'S' });
    } catch (e) {
      console.error('Failed to save warp taken:', e);
      if (setStatus) setStatus({ text: 'Failed to update Warp Taken.', type: 'E' });
    }
  };

  const handleToggleComplete = async (order, shouldComplete) => {
    const updatedOrder = { ...order, status: shouldComplete ? 'Completed' : 'Active' };
    try {
      await storageService.saveOrder(updatedOrder);
      if (setStatus) setStatus({ text: `Order PI: ${order.piNo} marked as Completed.`, type: 'S' });
      await loadOrders();
    } catch (e) {
      if (setStatus) setStatus({ text: 'Status update failed.', type: 'E' });
      alert('Failed to update order status.');
    }
  };

  const handleDelete = (id, piNo) => {
    setDeleteTarget({ id, piNo });
  };

  const handleSort = () => {
    const sorted = [...orders].sort((a, b) => {
      const aVal = a.piNo?.toLowerCase() || '';
      const bVal = b.piNo?.toLowerCase() || '';
      return sortAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setOrders(sorted);
    setSortAscending(!sortAscending);
    if (setStatus) setStatus({ text: `ALV grid sorted by PI No ${sortAscending ? 'Ascending' : 'Descending'}.`, type: 'S' });
  };

  const handleExportExcel = async () => {
    try {
      if (!window.ExcelJS) {
        alert("ExcelJS library is still loading. Please try again in a moment.");
        return;
      }

      const workbook = new window.ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Active Orders');

      // Title Block
      worksheet.getCell('A1').value = 'Ha-meem Ching Tai Pocketing & Accessories Ltd.';
      worksheet.getCell('A1').font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
      worksheet.mergeCells('A1:I1');

      worksheet.getCell('A2').value = 'ERP Solution - Active Sales Orders Report';
      worksheet.getCell('A2').font = { name: 'Segoe UI', size: 11, italic: true, color: { argb: 'FF475569' } };
      worksheet.mergeCells('A2:I2');

      worksheet.getCell('A3').value = `Generated: ${new Date().toLocaleString()}`;
      worksheet.getCell('A3').font = { name: 'Segoe UI', size: 9, color: { argb: 'FF64748B' } };
      worksheet.mergeCells('A3:I3');

      worksheet.addRow([]); // Blank row 4

      // Header Row
      const headerRow = worksheet.getRow(5);
      headerRow.values = [
        'PI No',
        'Order Ref',
        'Buyer',
        'Customer',
        'Style',
        'Delivery Date',
        'Order Qty',
        'Warp Taken (m)',
        'Need to Program'
      ];
      headerRow.height = 26;

      headerRow.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' } // Cobalt Blue
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });

      // Data Rows
      filteredOrders.forEach((order, idx) => {
        const styles = [...new Set(order.items?.map(item => item.styleNo))].filter(Boolean).join(', ') || '-';
        const delDates = [...new Set(order.items?.map(item => item.delDate ? new Date(item.delDate).toLocaleDateString() : ''))].filter(Boolean).join(', ') || '-';
        const qty = calculateTotalOrderQty(order);
        const warp = parseFloat(order.warpTaken) || 0;
        const need = calculateNeedToProgram(order);

        const row = worksheet.addRow([
          order.piNo || '',
          order.orderRef || '',
          order.buyer || '',
          order.customer || '',
          styles,
          delDates,
          qty,
          warp,
          need
        ]);
        row.height = 20;

        const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC'; // zebra striping

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgColor }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };

          if (colNumber <= 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          } else if (colNumber === 6) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            if (colNumber === 7) {
              cell.numFmt = '#,##0';
            } else {
              cell.numFmt = '#,##0.00';
            }
          }
        });
      });

      // Total Row (Only if data exists)
      if (filteredOrders.length > 0) {
        const lastRowIdx = worksheet.rowCount + 1;
        const totalRow = worksheet.getRow(lastRowIdx);
        totalRow.height = 22;
        totalRow.getCell(1).value = 'Total';
        totalRow.getCell(7).value = { formula: `SUM(G6:G${lastRowIdx - 1})` };
        totalRow.getCell(8).value = { formula: `SUM(H6:H${lastRowIdx - 1})` };
        totalRow.getCell(9).value = { formula: `SUM(I6:I${lastRowIdx - 1})` };

        totalRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF94A3B8' } },
            bottom: { style: 'double', color: { argb: 'FF1E293B' } }
          };
          if (colNumber === 1) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          } else if (colNumber >= 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            if (colNumber === 7) {
              cell.numFmt = '#,##0';
            } else {
              cell.numFmt = '#,##0.00';
            }
          }
        });
      }

      // Column widths
      worksheet.columns = [
        { width: 18 }, // PI No
        { width: 18 }, // Order Ref
        { width: 18 }, // Buyer
        { width: 18 }, // Customer
        { width: 25 }, // Style
        { width: 18 }, // Delivery Date
        { width: 15 }, // Order Qty
        { width: 18 }, // Warp Taken
        { width: 18 }  // Need to Program
      ];

      // Write to buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ACTIVE_ORDERS_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (setStatus) setStatus({ text: 'ALV Grid data exported to Excel (.xlsx) successfully.', type: 'S' });
    } catch (error) {
      console.error("Failed to export Excel file:", error);
      if (setStatus) setStatus({ text: 'Failed to export Excel file.', type: 'E' });
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
    <PageLayout 
      currentPage={currentPage} 
      onNavigate={onNavigate} 
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      {/* Transaction Action Toolbar */}
      <div className="bg-slate-100 dark:bg-[#151D30] border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              const target = filteredOrders.find(o => o.id === selectedRowId);
              if (target) onEditOrder(target);
              else alert('Please select a row first.');
            }}
            className="sap-btn"
            disabled={!selectedRowId}
          >
            ✏ Edit Order
          </button>
          <button 
            onClick={() => {
              const target = filteredOrders.find(o => o.id === selectedRowId);
              if (target) handleToggleComplete(target, true);
              else alert('Please select a row first.');
            }}
            className="sap-btn sap-btn-secondary"
            disabled={!selectedRowId}
          >
            ✔ Complete Order
          </button>
          <button onClick={handleSort} className="sap-btn sap-btn-secondary">↕ Sort PI No</button>
          <button onClick={handleExportExcel} className="sap-btn sap-btn-secondary">📥 Export Excel</button>
          <button onClick={loadOrders} className="sap-btn sap-btn-secondary">↻ Refresh</button>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Active List
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0B0F19]">
        {/* Selection / Search criteria */}
        <section className="office-card p-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 font-bold text-xs uppercase text-slate-500">
            Selection Criteria
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <label className="w-24 sap-label">Search Query</label>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search by PI, Buyer, Style..."
                className="w-64"
              />
            </div>
            <button onClick={loadOrders} className="sap-btn">Execute (F8)</button>
          </div>
        </section>

        {/* ALV Grid Listing */}
        <section className="office-card p-5 flex flex-col flex-1">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-slate-500">Active Sales Orders Grid</span>
            <span className="text-[10px] font-mono text-slate-400">Total lines: {filteredOrders.length}</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="sap-alv-table border-collapse">
              <thead>
                <tr>
                  <th className="w-8 text-center border-r border-slate-200 dark:border-slate-800">Sel</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">PI No</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Order Ref</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Buyer</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Customer</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Style</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Delivery Date</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Order Qty</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Warp Taken (m)</th>
                  <th className="border-r border-slate-200 dark:border-slate-800">Need to Program</th>
                  <th className="text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="p-8 text-center text-slate-400 italic">No active orders match the criteria.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id}
                      onClick={() => setSelectedRowId(order.id)}
                      className={`cursor-pointer ${selectedRowId === order.id ? 'sap-selected' : ''}`}
                    >
                      <td className="text-center border-r border-slate-200 dark:border-slate-800">
                        <input 
                          type="radio" 
                          name="active_order_select"
                          checked={selectedRowId === order.id}
                          onChange={() => setSelectedRowId(order.id)}
                          className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 font-mono">{order.piNo}</td>
                      <td className="border-r border-slate-200 dark:border-slate-800">{order.orderRef}</td>
                      <td className="border-r border-slate-200 dark:border-slate-800">{order.buyer}</td>
                      <td className="border-r border-slate-200 dark:border-slate-800">{order.customer}</td>
                      <td className="border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                        {[...new Set(order.items?.map(item => item.styleNo))].filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
                        {[...new Set(order.items?.map(item => item.delDate ? new Date(item.delDate).toLocaleDateString() : ''))].filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 text-right font-mono">{calculateTotalOrderQty(order).toLocaleString()}</td>
                      <td className="p-0 border-r border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-black/10">
                        <input
                          type="number"
                          value={order.warpTaken || ''}
                          onChange={(e) => handleWarpTakenChange(order.id, e.target.value)}
                          onBlur={() => handleWarpTakenBlur(order)}
                          placeholder="0"
                          className="w-full h-[32px] px-2 border-0 outline-none bg-transparent focus:bg-blue-50 dark:focus:bg-blue-950/20 text-right"
                        />
                      </td>
                      <td className="font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 text-right font-mono">
                        {calculateNeedToProgram(order).toFixed(2)}
                      </td>
                      <td className="p-0 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEditOrder(order); }}
                            className="text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 text-xs font-bold"
                          >
                            Edit
                          </button>
                          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800"></div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id, order.piNo); }}
                            className="text-rose-500 hover:underline px-2 py-1 text-xs font-bold"
                          >
                            Delete
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
        <PasswordPromptModal
          isOpen={deleteTarget !== null}
          title={deleteTarget ? `Delete Active Order PI: ${deleteTarget.piNo}` : ''}
          onClose={() => setDeleteTarget(null)}
          onSubmit={async () => {
            const { id, piNo } = deleteTarget;
            setDeleteTarget(null);
            if (window.confirm(`Are you sure you want to delete Active Order PI: ${piNo}?`)) {
              try {
                await storageService.deleteOrder(id);
                if (setStatus) setStatus({ text: `Order PI ${piNo} deleted successfully.`, type: 'S' });
                await loadOrders();
              } catch (e) {
                if (setStatus) setStatus({ text: 'Delete failed.', type: 'E' });
                alert('Failed to delete order.');
              }
            }
          }}
        />
      </div>
    </PageLayout>
  );
};

export default ActiveOrders;
