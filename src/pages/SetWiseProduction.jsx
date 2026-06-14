import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { productionStorage } from '../services/productionStorage';
import { planningStorage } from '../services/planningStorage';

const SetWiseProduction = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [entries, setEntries] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSetDetail, setSelectedSetDetail] = useState(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesData, sheetsData] = await Promise.all([
        productionStorage.getAllProductionEntries(),
        planningStorage.getAllSheets()
      ]);
      setEntries(entriesData);
      setSheets(sheetsData);
      if (setStatus) setStatus({ text: 'Aggregated set-wise production statistics.', type: 'S' });
    } catch (e) {
      console.error('Failed to load set production logs:', e);
      if (setStatus) setStatus({ text: 'Error fetching database records.', type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  // Group production entries by setNo
  const setWiseData = useMemo(() => {
    const groups = {};
    
    // Initialize groups from sheets
    sheets.forEach(sheet => {
      const setNo = sheet.setNo;
      groups[setNo] = {
        setNo,
        buyer: sheet.buyer || '-',
        styleCode: sheet.styleCode || '-',
        setLength: parseFloat(sheet.setLength) || 0,
        weave: sheet.weave || '-',
        colour: sheet.colour || '-',
        orderQnty: sheet.orderQnty || '-',
        orderRef: sheet.orderRef || '-',
        date: sheet.date || '-',
        productionQty: 0,
        logs: []
      };
    });

    // Add production entries (even if the sizing plan sheet is missing)
    entries.forEach(entry => {
      const setNo = entry.setNo;
      if (!groups[setNo]) {
        groups[setNo] = {
          setNo,
          buyer: 'Unknown',
          styleCode: 'Unknown',
          setLength: 0,
          weave: '-',
          colour: '-',
          orderQnty: '-',
          orderRef: '-',
          date: '-',
          productionQty: 0,
          logs: []
        };
      }
      groups[setNo].productionQty += (parseFloat(entry.productionQty) || 0);
      groups[setNo].logs.push(entry);
    });

    return Object.values(groups).sort((a, b) => b.setNo - a.setNo);
  }, [entries, sheets]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return setWiseData;
    return setWiseData.filter(d => 
      d.setNo.toString().includes(q) ||
      d.buyer.toLowerCase().includes(q) ||
      d.styleCode.toLowerCase().includes(q) ||
      d.orderRef.toLowerCase().includes(q)
    );
  }, [setWiseData, searchQuery]);

  const handleExportExcel = async () => {
    if (!window.ExcelJS) {
      alert('ExcelJS library is loading. Please try again in a moment.');
      return;
    }

    try {
      if (setStatus) setStatus({ text: 'Generating Set-Wise Production spreadsheet...', type: 'W' });
      const workbook = new window.ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Set-Wise Production Report');

      // Styles & Colors
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Royal Blue
      const titleFont = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      const subTitleFont = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FFFFFFFF' } };
      const headerFont = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      const bodyFont = { name: 'Segoe UI', size: 10 };
      const boldFont = { name: 'Segoe UI', size: 10, bold: true };
      
      const thinBorder = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Set Column widths
      worksheet.columns = [
        { width: 12, style: { alignment: { horizontal: 'center' } } }, // Set No
        { width: 22, style: { alignment: { horizontal: 'left' } } },   // Buyer
        { width: 22, style: { alignment: { horizontal: 'left' } } },   // Style/Code
        { width: 15, style: { alignment: { horizontal: 'right' } } },  // Set Length
        { width: 15, style: { alignment: { horizontal: 'right' } } },  // Prod YD
        { width: 15, style: { alignment: { horizontal: 'right' } } },  // Balance YD
        { width: 12, style: { alignment: { horizontal: 'right' } } },  // Completion %
        { width: 18, style: { alignment: { horizontal: 'left' } } },   // Order Ref
      ];

      // Title Banner Rows
      const titleRow = worksheet.addRow(['HA-MEEM CHING TAI POCKETING & ACCESSORIES LTD.']);
      worksheet.mergeCells('A1:H1');
      titleRow.getCell(1).font = titleFont;
      titleRow.getCell(1).fill = headerFill;
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 30;

      const subtitleRow = worksheet.addRow(['SET-WISE PRODUCTION EXECUTIVE REPORT - CLOUD DATABASE']);
      worksheet.mergeCells('A2:H2');
      subtitleRow.getCell(1).font = subTitleFont;
      subtitleRow.getCell(1).fill = headerFill;
      subtitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 18;

      worksheet.addRow([]); // Blank spacer

      // Headers Row
      const headers = ['Set Number', 'Buyer', 'Style/Code', 'Set Length (m)', 'Prod. Yield (yd)', 'Balance (yd)', 'Completion', 'Order Reference'];
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = headerFont;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }; // Accent Blue
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = thinBorder;
      });

      // Data Rows
      let totalLength = 0;
      let totalProd = 0;

      filteredData.forEach((row) => {
        totalLength += row.setLength;
        totalProd += row.productionQty;

        const balance = row.setLength ? (row.setLength - row.productionQty) : 0;
        const completion = row.setLength ? (row.productionQty / row.setLength) : 0;

        const dataRow = worksheet.addRow([
          parseInt(row.setNo),
          row.buyer,
          row.styleCode,
          row.setLength,
          row.productionQty,
          balance,
          completion,
          row.orderRef
        ]);

        dataRow.height = 20;
        dataRow.eachCell((cell, colIndex) => {
          cell.font = bodyFont;
          cell.border = thinBorder;
          if (colIndex === 4 || colIndex === 5 || colIndex === 6) {
            cell.numFmt = '#,##0.00';
          } else if (colIndex === 7) {
            cell.numFmt = '0.0%';
          }
        });
      });

      // Total summary Row
      const summaryRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        totalLength,
        totalProd,
        totalLength - totalProd,
        totalLength ? (totalProd / totalLength) : 0,
        ''
      ]);
      worksheet.mergeCells(`A${summaryRow.number}:C${summaryRow.number}`);
      summaryRow.height = 22;
      summaryRow.eachCell((cell, colIndex) => {
        cell.font = boldFont;
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF1E293B' } },
          bottom: { style: 'double', color: { argb: 'FF1E293B' } }
        };
        if (colIndex >= 4 && colIndex <= 6) {
          cell.numFmt = '#,##0.00';
        } else if (colIndex === 7) {
          cell.numFmt = '0.0%';
        }
      });

      // Write File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SetWise_Production_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      
      if (setStatus) setStatus({ text: 'Spreadsheet exported successfully!', type: 'S' });
    } catch (err) {
      console.error(err);
      if (setStatus) setStatus({ text: 'Export failed.', type: 'E' });
    }
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (isPrintMode) {
    const grandSetLength = filteredData.reduce((sum, r) => sum + r.setLength, 0);
    const grandProdQty = filteredData.reduce((sum, r) => sum + r.productionQty, 0);
    const grandBalance = grandSetLength - grandProdQty;
    const grandCompletion = grandSetLength ? (grandProdQty / grandSetLength * 100) : 0;

    return (
      <div className="relative min-h-screen bg-slate-800 p-8 flex flex-col items-center">
        {/* Floating print banner controls */}
        <div className="fixed top-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl flex items-center gap-2 z-50 select-none">
          <button onClick={() => window.print()} className="sap-btn">🖨 Print / Save PDF</button>
          <button onClick={() => setIsPrintMode(false)} className="sap-btn sap-btn-secondary">❌ Close Print</button>
        </div>

        {/* Print Layout */}
        <div className="bg-white text-black p-6 w-[210mm] min-h-[297mm] mx-auto border shadow-lg" id="printable-sheet">
          <div className="text-center border-b-2 border-black pb-3 mb-6">
            <h1 className="text-2xl font-black uppercase">Ha-Meem Ching Tai Pocketing & Accessories Ltd.</h1>
            <p className="text-xs font-semibold uppercase mt-1">Polash, Narshingdi</p>
            <h2 className="text-xl font-bold uppercase mt-2.5">Set-Wise Production Executive Report</h2>
            <p className="text-[10px] font-mono mt-1 text-gray-500">Report Date: {new Date().toLocaleDateString()} | Data Source: Cloud DB</p>
          </div>

          <table className="w-full text-[11px] border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1.5 text-center">Set No</th>
                <th className="border border-black p-1.5">Buyer</th>
                <th className="border border-black p-1.5">Style/Code</th>
                <th className="border border-black p-1.5 text-right">Set Length (m)</th>
                <th className="border border-black p-1.5 text-right">Prod Yield (yd)</th>
                <th className="border border-black p-1.5 text-right">Balance (yd)</th>
                <th className="border border-black p-1.5 text-right">Completion</th>
                <th className="border border-black p-1.5">Order Ref</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => {
                const balance = row.setLength ? (row.setLength - row.productionQty) : 0;
                const completion = row.setLength ? (row.productionQty / row.setLength * 100) : 0;
                return (
                  <tr key={row.setNo}>
                    <td className="border border-black p-1.5 text-center font-bold font-mono">{row.setNo}</td>
                    <td className="border border-black p-1.5 font-semibold">{row.buyer}</td>
                    <td className="border border-black p-1.5">{row.styleCode}</td>
                    <td className="border border-black p-1.5 text-right font-mono">{row.setLength.toLocaleString()}</td>
                    <td className="border border-black p-1.5 text-right font-mono">{row.productionQty.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                    <td className="border border-black p-1.5 text-right font-mono">{balance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                    <td className="border border-black p-1.5 text-right font-mono">{completion.toFixed(1)}%</td>
                    <td className="border border-black p-1.5 font-mono">{row.orderRef}</td>
                  </tr>
                );
              })}
              {/* Grand Total Row */}
              <tr className="bg-gray-50 font-bold border-t-2 border-black">
                <td colSpan="3" className="border border-black p-2 text-right uppercase">Grand Total:</td>
                <td className="border border-black p-2 text-right font-mono">{grandSetLength.toLocaleString()}</td>
                <td className="border border-black p-2 text-right font-mono">{grandProdQty.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                <td className="border border-black p-2 text-right font-mono">{grandBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                <td className="border border-black p-2 text-right font-mono">{grandCompletion.toFixed(1)}%</td>
                <td className="border border-black p-2"></td>
              </tr>
            </tbody>
          </table>

          {/* Formal signature sections */}
          <div className="grid grid-cols-4 gap-4 mt-28 text-center text-[11px] font-bold">
            <div className="border-t border-black pt-1.5">Prepared By (Concern)</div>
            <div className="border-t border-black pt-1.5">Checked By</div>
            <div className="border-t border-black pt-1.5">GM PLANT</div>
            <div className="border-t border-black pt-1.5">CEO - HTZ</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      currentPage={currentPage}
      onNavigate={onNavigate}
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none transition-colors">
        <div className="flex flex-wrap gap-2">
          <button onClick={loadData} className="sap-btn" title="Refresh data">🔄 Refresh</button>
          <button onClick={handleExportExcel} className="sap-btn sap-btn-secondary" title="Export to XLSX">📊 Export Excel</button>
          <button onClick={handlePrint} className="sap-btn sap-btn-secondary" title="Print formal report">🖨 Print Report</button>
          <button onClick={() => onNavigate('production_entry')} className="sap-btn" title="Log Production Entry">🏭 Daily Production Entry</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Set-Wise Production Report
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors flex flex-col">
        {/* Search & Statistics Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="office-card lg:col-span-2 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <label className="sap-label text-slate-600 dark:text-slate-400 shrink-0">Search Set/Buyer/Ref:</label>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter sets..."
                className="w-full"
              />
            </div>
          </div>

          <div className="office-card p-4 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Set Count</div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{setWiseData.length}</div>
          </div>

          <div className="office-card p-4 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Yield (YD)</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {setWiseData.reduce((sum, r) => sum + r.productionQty, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Aggregated Sets Grid Table */}
        <div className="office-card flex-grow flex flex-col">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
            Set-Wise Yield Progress Tracker (Cloud Ledger)
          </div>
          
          <div className="flex-grow overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="sap-alv-table min-w-[950px] w-full text-xs">
              <thead>
                <tr>
                  <th className="w-24 text-center">Set No</th>
                  <th className="w-40">Buyer</th>
                  <th>Style/Code</th>
                  <th className="w-32 text-right">Target Length (m)</th>
                  <th className="w-32 text-right">Production Yield (yd)</th>
                  <th className="w-32 text-right">Remaining (yd)</th>
                  <th className="w-36 text-center">Completion %</th>
                  <th className="w-36">Order Reference</th>
                  <th className="w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 font-mono text-slate-400">
                      Querying aggregated production details from cloud database...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 font-mono text-slate-400 italic">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => {
                    const balance = row.setLength ? (row.setLength - row.productionQty) : 0;
                    const completion = row.setLength ? (row.productionQty / row.setLength * 100) : 0;
                    const isCompleted = completion >= 100;
                    
                    return (
                      <tr key={row.setNo} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="text-center font-bold text-blue-600 dark:text-blue-400 font-mono">{row.setNo}</td>
                        <td className="font-semibold text-slate-800 dark:text-slate-200">{row.buyer}</td>
                        <td className="text-slate-700 dark:text-slate-300 max-w-xs truncate" title={row.styleCode}>{row.styleCode}</td>
                        <td className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">{row.setLength.toLocaleString()}</td>
                        <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.productionQty.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                        <td className="text-right font-mono font-bold text-slate-600 dark:text-slate-400">{balance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                        <td className="text-center p-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isCompleted ? 'bg-blue-600' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(completion, 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-mono font-bold w-10 text-right shrink-0">{completion.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="font-mono text-slate-600 dark:text-slate-400">{row.orderRef}</td>
                        <td className="text-center p-1">
                          <button
                            onClick={() => setSelectedSetDetail(row)}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded transition"
                          >
                            Breakdown
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Set Shift Logs Breakdown modal */}
        {selectedSetDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#151D30] border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Set {selectedSetDetail.setNo} Production Breakdown</h3>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{selectedSetDetail.buyer} | Style: {selectedSetDetail.styleCode}</span>
                </div>
                <button 
                  onClick={() => setSelectedSetDetail(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-grow">
                {selectedSetDetail.logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic font-mono text-xs">
                    No active shift production logs registered for this set.
                  </div>
                ) : (
                  <table className="sap-alv-table w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-center w-24">Date</th>
                        <th className="text-center w-20">Loom No</th>
                        <th className="w-24">Shift</th>
                        <th>Loom Operator</th>
                        <th>Shift Incharge</th>
                        <th className="text-right w-24">Qty (YD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSetDetail.logs.map(log => (
                        <tr key={log.id}>
                          <td className="text-center font-mono text-slate-500 dark:text-slate-400">{log.date}</td>
                          <td className="text-center font-mono font-bold text-slate-800 dark:text-slate-200">{log.loomNo}</td>
                          <td className="text-slate-600 dark:text-slate-400">{log.shift}</td>
                          <td className="font-semibold text-slate-700 dark:text-slate-300">{log.loomOperator}</td>
                          <td className="text-slate-500 dark:text-slate-450">{log.shiftIncharge}</td>
                          <td className="text-right font-mono font-bold text-emerald-650 dark:text-emerald-450">{parseFloat(log.productionQty).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-850 flex justify-end bg-slate-50/50 dark:bg-slate-900/40">
                <button 
                  onClick={() => setSelectedSetDetail(null)}
                  className="sap-btn sap-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SetWiseProduction;
