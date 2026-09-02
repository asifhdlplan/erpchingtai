import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { PlanningSheetPreview } from '../components/planning/PlanningSheetPreview';
import { planningStorage } from '../services/planningStorage';
import { yarnStockStorage } from '../services/yarnStockStorage';
import { SearchBar } from '../components/ui/FormInputs';
import { PasswordPromptModal } from '../components/ui/PasswordPromptModal';

const AllPlanningSheets = ({ currentPage, onNavigate, onAdminClick, onEditPlan, status, setStatus }) => {
  const [sheets, setSheets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    const data = await planningStorage.getAllSheets();
    setSheets(data);
    setFilteredSheets(data);
    if (setStatus) setStatus({ text: `Retrieved ${data.length} planning records from DB.`, type: 'S' });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredSheets(sheets);
      return;
    }
    const filtered = sheets.filter(s => s.setNo?.toString().includes(searchQuery));
    setFilteredSheets(filtered);
    if (setStatus) setStatus({ text: `Filter applied: ${filtered.length} plans found matching Set No: ${searchQuery}`, type: 'S' });
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilteredSheets(sheets);
    if (setStatus) setStatus({ text: 'Filters cleared.', type: 'W' });
  };

  const handleDelete = (id, setNo) => {
    setDeleteTarget({ id, setNo });
  };

  const handleView = (sheet) => {
    setSelectedSheet(sheet);
    setIsPreviewMode(true);
    if (setStatus) setStatus({ text: `Displaying Planning Sheet Set ${sheet.setNo}`, type: 'S' });
  };

  const handlePrint = (sheet) => {
    setSelectedSheet(sheet);
    setIsPreviewMode(true);
    if (setStatus) setStatus({ text: `Printing Planning Sheet Set ${sheet.setNo}...`, type: 'S' });
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSort = () => {
    const sorted = [...filteredSheets].sort((a, b) => {
      const aVal = parseInt(a.setNo) || 0;
      const bVal = parseInt(b.setNo) || 0;
      return sortAscending ? aVal - bVal : bVal - aVal;
    });
    setFilteredSheets(sorted);
    setSortAscending(!sortAscending);
    if (setStatus) setStatus({ text: `ALV grid sorted by Set No ${sortAscending ? 'Ascending' : 'Descending'}.`, type: 'S' });
  };

  const handleExportExcel = async () => {
    try {
      if (!window.ExcelJS) {
        alert("ExcelJS library is still loading. Please try again in a moment.");
        return;
      }

      const workbook = new window.ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Production Plans');

      // Title Block
      worksheet.getCell('A1').value = 'Ha-meem Ching Tai Pocketing & Accessories Ltd.';
      worksheet.getCell('A1').font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
      worksheet.mergeCells('A1:G1');

      worksheet.getCell('A2').value = 'ERP Solution - Production Planning Archive';
      worksheet.getCell('A2').font = { name: 'Segoe UI', size: 11, italic: true, color: { argb: 'FF475569' } };
      worksheet.mergeCells('A2:G2');

      worksheet.getCell('A3').value = `Generated: ${new Date().toLocaleString()}`;
      worksheet.getCell('A3').font = { name: 'Segoe UI', size: 9, color: { argb: 'FF64748B' } };
      worksheet.mergeCells('A3:G3');

      worksheet.addRow([]); // Blank row 4

      // Header Row
      const headerRow = worksheet.getRow(5);
      headerRow.values = [
        'Set No',
        'Buyer',
        'Style/Code',
        'Date',
        'Order Ref',
        'Weave',
        'Colour'
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
      filteredSheets.forEach((sheet, idx) => {
        const row = worksheet.addRow([
          sheet.setNo || '',
          sheet.buyer || '',
          sheet.styleCode || '',
          sheet.date || '',
          sheet.orderRef || '',
          sheet.weave || '',
          sheet.colour || ''
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

          // Alignment
          if (colNumber === 1 || colNumber === 4 || colNumber === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        });
      });

      // Column widths
      worksheet.columns = [
        { width: 12 }, // Set No
        { width: 18 }, // Buyer
        { width: 20 }, // Style/Code
        { width: 15 }, // Date
        { width: 18 }, // Order Ref
        { width: 15 }, // Weave
        { width: 15 }  // Colour
      ];

      // Write to buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `PLAN_ARCHIVE_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (setStatus) setStatus({ text: 'ALV Grid data exported to Excel (.xlsx) successfully.', type: 'S' });
    } catch (error) {
      console.error("Failed to export Excel file:", error);
      if (setStatus) setStatus({ text: 'Failed to export Excel file.', type: 'E' });
    }
  };

  return (
    <PageLayout 
      currentPage={currentPage} 
      onNavigate={onNavigate} 
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      {/* Transaction Action Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none transition-colors">
        <div className="flex flex-wrap gap-2">
          {isPreviewMode ? (
            <button onClick={() => setIsPreviewMode(false)} className="sap-btn sap-btn-secondary">⬅ Back to ALV Grid</button>
          ) : (
            <>
              <button 
                onClick={() => {
                  const target = filteredSheets.find(s => s.id === selectedRowId);
                  if (target) handleView(target);
                  else alert('Please select a row in the ALV Grid first.');
                }} 
                className="sap-btn"
                disabled={!selectedRowId}
              >
                👓 Display Plan
              </button>
              <button 
                onClick={() => {
                  const target = filteredSheets.find(s => s.id === selectedRowId);
                  if (target) setEditTarget(target);
                  else alert('Please select a row in the ALV Grid first.');
                }} 
                className="sap-btn sap-btn-secondary"
                disabled={!selectedRowId}
              >
                ✏ Edit Plan
              </button>
              <button 
                onClick={() => {
                  const target = filteredSheets.find(s => s.id === selectedRowId);
                  if (!target) return alert('Please select a row in the ALV Grid first.');
                  if (target.approvalStatus === 'Pending') {
                    alert(`Sizing Plan Set #${target.setNo} is currently PENDING AUTHORIZATION.\n\nPrint and PDF export are locked until an authorized manager approves it in the "Pending Approvals" module.`);
                    return;
                  }
                  handlePrint(target);
                }} 
                className="sap-btn sap-btn-secondary"
                disabled={!selectedRowId}
              >
                🖨 Print / PDF
              </button>
              <button onClick={handleSort} className="sap-btn sap-btn-secondary">↕ Sort Set No</button>
              <button onClick={handleExportExcel} className="sap-btn sap-btn-secondary">📥 Export Excel</button>
              <button onClick={loadSheets} className="sap-btn sap-btn-secondary">↻ Refresh</button>
            </>
          )}
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Information System
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors">
        {!isPreviewMode ? (
          <>
            {/* 1. Selection Criteria Screen */}
            <section className="office-card">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selection Criteria
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <label className="w-24 sap-label">Set Number</label>
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Enter Set No..."
                    className="w-40 font-mono"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  />
                </div>
                <button onClick={handleSearch} className="sap-btn">Execute (F8)</button>
                <button onClick={handleClear} className="sap-btn sap-btn-secondary">Clear Filter</button>
              </div>
            </section>

            {/* 2. ALV Grid Table */}
            <section className="office-card flex flex-col flex-1">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-4 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Production Plan ALV List</span>
                <span className="text-xs font-mono text-slate-400">Records found: {filteredSheets.length}</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="sap-alv-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">Sel</th>
                      <th>Set No</th>
                      <th>Buyer</th>
                      <th>Style/Code</th>
                      <th>Date</th>
                      <th>Order Ref</th>
                      <th>Weave</th>
                      <th>Colour</th>
                      <th className="text-center">Approval Status</th>
                      <th className="text-center w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSheets.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="p-8 text-center text-slate-400 dark:text-slate-500 italic">No plans match the search criteria.</td>
                      </tr>
                    ) : (
                      filteredSheets.map(sheet => (
                        <tr 
                          key={sheet.id}
                          onClick={() => setSelectedRowId(sheet.id)}
                          className={`cursor-pointer ${selectedRowId === sheet.id ? 'sap-selected' : ''}`}
                        >
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="radio" 
                              name="row_select"
                              checked={selectedRowId === sheet.id}
                              onChange={() => setSelectedRowId(sheet.id)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-750 dark:border-gray-600"
                            />
                          </td>
                          <td className="font-bold text-blue-600 dark:text-blue-400 font-mono">{sheet.setNo}</td>
                          <td className="font-semibold text-slate-900 dark:text-slate-100">{sheet.buyer}</td>
                          <td className="text-slate-700 dark:text-slate-300">{sheet.styleCode}</td>
                          <td className="font-mono text-slate-700 dark:text-slate-300">{sheet.date}</td>
                          <td className="text-slate-700 dark:text-slate-300">{sheet.orderRef}</td>
                          <td className="text-slate-700 dark:text-slate-300">{sheet.weave}</td>
                          <td className="text-slate-700 dark:text-slate-300">{sheet.colour}</td>
                          <td className="text-center p-2">
                            {sheet.approvalStatus === 'Pending' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                ⏳ Pending
                              </span>
                            ) : sheet.approvalStatus === 'Rejected' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                ✕ Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                ✓ Approved
                              </span>
                            )}
                          </td>
                          <td className="p-1 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleView(sheet)}
                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2 py-1 text-xs font-semibold rounded"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => setEditTarget(sheet)}
                                className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-955/20 px-2 py-1 text-xs font-semibold rounded"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(sheet.id, sheet.setNo)}
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 text-xs font-semibold rounded"
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
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            {selectedSheet?.approvalStatus === 'Pending' && (
              <div className="w-full max-w-4xl p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded text-xs flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔒</span>
                  <div>
                    <div className="font-bold text-xs">Awaiting Manager Authorization (Status: Pending Approval)</div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300">
                      This Sizing Plan is pending authorization. Print and PDF export will be enabled once an authorized manager approves it.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-amber-200 dark:bg-amber-900/60 font-bold border border-amber-400 dark:border-amber-700 shrink-0">
                  Print Locked
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                disabled={selectedSheet?.approvalStatus === 'Pending'}
                onClick={() => window.print()} 
                className={`sap-btn font-bold text-xs ${
                  selectedSheet?.approvalStatus === 'Pending'
                    ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-200'
                }`}
                title={selectedSheet?.approvalStatus === 'Pending' ? "Locked pending authorization" : "Print planning sheet"}
              >
                {selectedSheet?.approvalStatus === 'Pending' ? '🔒 Print / Save PDF (Pending Approval)' : '🖨 Print Planning Sheet'}
              </button>
              <button 
                onClick={() => setIsPreviewMode(false)} 
                className="sap-btn sap-btn-secondary"
              >
                ⬅ Back to ALV Grid
              </button>
            </div>
            <PlanningSheetPreview data={selectedSheet} />
          </div>
        )}
        <PasswordPromptModal
          isOpen={editTarget !== null}
          title={editTarget ? `Edit Plan Set: ${editTarget.setNo}` : ''}
          onClose={() => setEditTarget(null)}
          onSubmit={async () => {
            const target = editTarget;
            setEditTarget(null);
            onEditPlan(target);
          }}
        />
        <PasswordPromptModal
          isOpen={deleteTarget !== null}
          title={deleteTarget ? `Delete Plan Set: ${deleteTarget.setNo}` : ''}
          onClose={() => setDeleteTarget(null)}
          onSubmit={async () => {
            const { id, setNo } = deleteTarget;
            setDeleteTarget(null);
            if (window.confirm(`Are you sure you want to delete Planning Sheet Set: ${setNo}?`)) {
              try {
                // Fetch sheet details first to re-add used quantity to stock
                const allSheets = await planningStorage.getAllSheets();
                const targetSheet = allSheets.find(s => s.id === id);
                
                if (targetSheet) {
                  const warping = targetSheet.warpingRows || [];
                  const weaving = targetSheet.weavingRows || [];
                  const returns = {};
                  
                  for (const row of warping) {
                    if (row.yarnStockId && row.qtyKg) {
                      const qty = parseFloat(row.qtyKg) || 0;
                      if (qty > 0) {
                        returns[row.yarnStockId] = (returns[row.yarnStockId] || 0) + qty;
                      }
                    }
                  }
                  
                  for (const row of weaving) {
                    if (row.yarnStockId && row.qtyKg) {
                      const qty = parseFloat(row.qtyKg) || 0;
                      if (qty > 0) {
                        returns[row.yarnStockId] = (returns[row.yarnStockId] || 0) + qty;
                      }
                    }
                  }
                  
                  const allStocks = await yarnStockStorage.getAllYarnStocks();
                  for (const [stockId, totalReturnQty] of Object.entries(returns)) {
                    const currentItem = allStocks.find(s => s.id === stockId);
                    if (currentItem) {
                      const newQty = (parseFloat(currentItem.unrestrictedStock) || 0) + totalReturnQty;
                      await yarnStockStorage.saveYarnStock({
                        ...currentItem,
                        unrestrictedStock: newQty,
                        lastGoodsReceiptDate: new Date().toISOString()
                      });
                    }
                  }
                }

                await planningStorage.deletePlanningSheet(id);
                if (setStatus) setStatus({ text: `Planning Sheet Set ${setNo} deleted successfully. Yarn stock restored.`, type: 'S' });
                await loadSheets();
                if (selectedSheet?.id === id) {
                  setSelectedSheet(null);
                  setIsPreviewMode(false);
                }
              } catch (e) {
                console.error(e);
                if (setStatus) setStatus({ text: 'Delete failed.', type: 'E' });
                alert('Failed to delete planning sheet.');
              }
            }
          }}
        />
      </div>
    </PageLayout>
  );
};

export default AllPlanningSheets;
