import React, { useState, useRef } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { yarnStockStorage } from '../services/yarnStockStorage';

const YarnStockEntry = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const entryAreaRef = useRef(null);
  const [entryMode, setEntryMode] = useState('single'); // 'single' | 'bulk'
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    plant: '1000',
    storageLocation: 'Y001',
    materialDescription: '',
    unit: 'KG',
    supplierName: '',
    supplierLot: '',
    unrestrictedStock: '',
    lastGoodsReceiptDate: new Date().toISOString().slice(0, 10)
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const requiredFields = ['plant', 'storageLocation', 'materialDescription', 'unit', 'supplierName', 'supplierLot', 'unrestrictedStock', 'lastGoodsReceiptDate'];
    const missing = requiredFields.filter(field => !formData[field]);

    if (missing.length > 0) {
      if (setStatus) setStatus({ text: `Required field missing: ${missing.join(', ')}`, type: 'E' });
      alert(`Please fill in all fields: ${missing.join(', ')}`);
      return;
    }

    try {
      if (setStatus) setStatus({ text: 'Posting goods receipt to ledger...', type: 'W' });
      await yarnStockStorage.saveYarnStock(formData);
      if (setStatus) setStatus({ text: `Goods receipt for lot ${formData.supplierLot} posted successfully.`, type: 'S' });
      alert('Yarn Stock Goods Receipt posted successfully!');
      resetForm();
      onNavigate('yarn_stock_overview');
    } catch (e) {
      console.error('Yarn post error:', e);
      if (setStatus) setStatus({ text: `Post failed: ${e.message}`, type: 'E' });
      alert(`Failed to post goods receipt: ${e.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      plant: '1000',
      storageLocation: 'Y001',
      materialDescription: '',
      unit: 'KG',
      supplierName: '',
      supplierLot: '',
      unrestrictedStock: '',
      lastGoodsReceiptDate: new Date().toISOString().slice(0, 10)
    });
    if (setStatus) setStatus({ text: 'Form cleared.', type: 'W' });
  };

  const handleF4Lookup = (field, options) => {
    const list = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    const choice = window.prompt(`Select ${field} (Enter Option Number):\n\n${list}`);
    if (choice) {
      const idx = parseInt(choice) - 1;
      if (idx >= 0 && idx < options.length) {
        const optVal = options[idx];
        const val = optVal.includes(' - ') ? optVal.split(' - ')[0] : optVal;
        setFormData(prev => ({ ...prev, [field]: val }));
        if (setStatus) setStatus({ text: `Selected ${field}: ${val} via F4 Help`, type: 'S' });
      }
    }
  };

  const parseExcelFile = (file) => {
    if (!window.ExcelJS) {
      alert("ExcelJS library is still loading. Please try again in a moment.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const workbook = new window.ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          alert("No worksheets found in this Excel file.");
          return;
        }

        const rows = [];
        let headers = [];
        let headerRowIndex = 1;

        for (let i = 1; i <= worksheet.rowCount; i++) {
          const rowValues = worksheet.getRow(i).values;
          if (rowValues && rowValues.some(val => val !== undefined && val !== null && val !== '')) {
            headers = rowValues;
            headerRowIndex = i;
            break;
          }
        }

        headers = headers.map(h => String(h || '').trim());
        const headerMap = {};
        headers.forEach((h, index) => {
          if (h) {
            headerMap[h.toLowerCase()] = index;
          }
        });

        for (let r = headerRowIndex + 1; r <= worksheet.rowCount; r++) {
          const row = worksheet.getRow(r);
          if (!row.values || !row.values.some(v => v !== undefined && v !== null && v !== '')) {
            continue;
          }

          const getVal = (colNames) => {
            for (const colName of colNames) {
              const idx = headerMap[colName.toLowerCase()];
              if (idx !== undefined) {
                const cell = row.getCell(idx);
                if (cell && cell.value !== null && cell.value !== undefined) {
                  if (typeof cell.value === 'object') {
                    if (cell.value.result !== undefined) return cell.value.result;
                    if (cell.value.text !== undefined) return cell.value.text;
                    return String(cell.value);
                  }
                  return cell.value;
                }
              }
            }
            return '';
          };

          const materialDescription = String(getVal(['material description', 'material desc', 'yarn name', 'yarn description', 'description']) || '').trim();
          const supplierName = String(getVal(['supplier name', 'supplier', 'suppliername']) || '').trim();
          const supplierLot = String(getVal(['supplier lot', 'lot', 'supplierlot', 'lot number', 'lot no']) || '').trim();
          const unrestrictedStockVal = getVal(['unrestricted stock', 'stock', 'qty', 'quantity', 'unrestrictedstock']);
          const plant = String(getVal(['plant', 'plant code']) || '1000').trim();
          const storageLocation = String(getVal(['storage location', 'storage location code', 'sloc', 'storage_location']) || 'Y001').trim();
          const unit = String(getVal(['unit', 'uom', 'unit of measure']) || 'KG').trim();
          const lastGoodsReceiptDate = String(getVal(['receipt date', 'date', 'goods receipt date']) || new Date().toISOString().slice(0, 10)).trim();

          const unrestrictedStock = parseFloat(unrestrictedStockVal) || 0;

          const errors = [];
          if (!materialDescription) errors.push('Missing Material Description / Yarn Name');
          if (!supplierName) errors.push('Missing Supplier');
          if (!supplierLot) errors.push('Missing Supplier Lot');
          if (isNaN(unrestrictedStock) || unrestrictedStock <= 0) {
            errors.push('Unrestricted Stock must be a positive number');
          }

          rows.push({
            data: {
              plant,
              storageLocation,
              materialDescription,
              unit,
              supplierName,
              supplierLot,
              unrestrictedStock,
              lastGoodsReceiptDate
            },
            valid: errors.length === 0,
            errors
          });
        }

        setParsedRows(rows);
      } catch (err) {
        console.error('Failed to parse excel file:', err);
        alert(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = parseCSVText(text);
        if (lines.length < 2) {
          alert("CSV file seems to be empty or has no header row.");
          return;
        }

        const headers = lines[0].map(h => String(h || '').trim());
        const headerMap = {};
        headers.forEach((h, index) => {
          if (h) {
            headerMap[h.toLowerCase()] = index;
          }
        });

        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          const getVal = (colNames) => {
            for (const colName of colNames) {
              const idx = headerMap[colName.toLowerCase()];
              if (idx !== undefined && row[idx] !== undefined) {
                return row[idx];
              }
            }
            return '';
          };

          const materialDescription = String(getVal(['material description', 'material desc', 'yarn name', 'yarn description', 'description']) || '').trim();
          const supplierName = String(getVal(['supplier name', 'supplier', 'suppliername']) || '').trim();
          const supplierLot = String(getVal(['supplier lot', 'lot', 'supplierlot', 'lot number', 'lot no']) || '').trim();
          const unrestrictedStockVal = getVal(['unrestricted stock', 'stock', 'qty', 'quantity', 'unrestrictedstock']);
          const plant = String(getVal(['plant', 'plant code']) || '1000').trim();
          const storageLocation = String(getVal(['storage location', 'storage location code', 'sloc', 'storage_location']) || 'Y001').trim();
          const unit = String(getVal(['unit', 'uom', 'unit of measure']) || 'KG').trim();
          const lastGoodsReceiptDate = String(getVal(['receipt date', 'date', 'goods receipt date']) || new Date().toISOString().slice(0, 10)).trim();

          const unrestrictedStock = parseFloat(unrestrictedStockVal) || 0;

          const errors = [];
          if (!materialDescription) errors.push('Missing Material Description / Yarn Name');
          if (!supplierName) errors.push('Missing Supplier');
          if (!supplierLot) errors.push('Missing Supplier Lot');
          if (isNaN(unrestrictedStock) || unrestrictedStock <= 0) {
            errors.push('Unrestricted Stock must be a positive number');
          }

          rows.push({
            data: {
              plant,
              storageLocation,
              materialDescription,
              unit,
              supplierName,
              supplierLot,
              unrestrictedStock,
              lastGoodsReceiptDate
            },
            valid: errors.length === 0,
            errors
          });
        }

        setParsedRows(rows);
      } catch (err) {
        console.error('Failed to parse CSV file:', err);
        alert(`Failed to parse CSV file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVText = (text) => {
    const lines = [];
    let row = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry);
        entry = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(entry);
        lines.push(row);
        row = [];
        entry = '';
      } else {
        entry += char;
      }
    }
    if (entry || row.length > 0) {
      row.push(entry);
      lines.push(row);
    }
    return lines;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setBulkFile(file);
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'xlsx') {
        parseExcelFile(file);
      } else if (ext === 'csv') {
        parseCSVFile(file);
      } else {
        alert("Unsupported file type. Please upload a .xlsx or .csv file.");
      }
    }
  };

  const handleBulkImport = async () => {
    const validRows = parsedRows.filter(r => r.valid);
    if (validRows.length === 0) {
      alert("No valid records to import.");
      return;
    }

    const confirmImport = window.confirm(`Are you sure you want to import ${validRows.length} yarn stock records?`);
    if (!confirmImport) return;

    setImporting(true);
    if (setStatus) setStatus({ text: `Importing ${validRows.length} records to stock...`, type: 'W' });

    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        await yarnStockStorage.saveYarnStock(row.data);
        successCount++;
      } catch (err) {
        console.error('Bulk save item failed:', err, row.data);
        failCount++;
      }
    }

    setImporting(false);
    
    if (failCount > 0) {
      if (setStatus) setStatus({ text: `Import completed: ${successCount} successful, ${failCount} failed.`, type: 'E' });
      alert(`Bulk import completed with warnings!\nSuccessfully imported: ${successCount} records.\nFailed to import: ${failCount} records.`);
    } else {
      if (setStatus) setStatus({ text: `Successfully imported ${successCount} yarn stock records.`, type: 'S' });
      alert(`Bulk import successful! Imported ${successCount} records.`);
      onNavigate('yarn_stock_overview');
    }
  };

  const focusByOffset = (currentEl, offset) => {
    const root = entryAreaRef.current;
    if (!root) return;
    const fields = Array.from(root.querySelectorAll('input, select, textarea, button'))
      .filter((el) => !el.disabled && !el.readOnly && el.type !== 'hidden' && el.tabIndex !== -1);
    const idx = fields.indexOf(currentEl);
    if (idx < 0) return;
    const nextIdx = idx + offset;
    if (nextIdx >= 0 && nextIdx < fields.length) {
      fields[nextIdx].focus();
      if (fields[nextIdx].select) fields[nextIdx].select();
    }
  };

  const handleEntryKeyDown = (e) => {
    if (entryMode === 'bulk') return;
    const tag = e.target.tagName;
    if (!['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusByOffset(e.target, 1);
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusByOffset(e.target, -1);
      return;
    }
    if (e.key === 'Enter' && tag !== 'TEXTAREA' && e.target.type !== 'submit') {
      e.preventDefault();
      focusByOffset(e.target, 1);
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
          {entryMode === 'single' ? (
            <>
              <button onClick={handleSave} className="sap-btn" title="Post/Save Goods Receipt Data">💾 Save/Post</button>
              <button onClick={resetForm} className="sap-btn sap-btn-secondary" title="Reset current inputs">♻ Reset Form</button>
            </>
          ) : (
            <>
              <button 
                onClick={handleBulkImport} 
                disabled={importing || parsedRows.filter(r => r.valid).length === 0} 
                className="sap-btn disabled:opacity-50" 
                title="Import all valid parsed records to Supabase"
              >
                {importing ? '⏳ Importing...' : `💾 Import (${parsedRows.filter(r => r.valid).length} Records)`}
              </button>
              <button 
                onClick={() => {
                  setBulkFile(null);
                  setParsedRows([]);
                }} 
                disabled={parsedRows.length === 0}
                className="sap-btn sap-btn-secondary disabled:opacity-50" 
                title="Clear loaded file and preview table"
              >
                🧹 Clear File
              </button>
            </>
          )}
          <button onClick={() => onNavigate('yarn_stock_overview')} className="sap-btn sap-btn-secondary" title="View Yarn Warehouse Stock Overview">📋 Stock Status</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          {entryMode === 'single' ? 'Goods Receipt Mode' : 'Bulk Import Mode'}
        </div>
      </div>

      <div ref={entryAreaRef} onKeyDown={handleEntryKeyDown} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors flex flex-col">
        {/* Tab Headers */}
        <div className="sap-tab-container select-none px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] rounded-t-lg shadow-sm">
          <div 
            onClick={() => setEntryMode('single')}
            className={`sap-tab ${entryMode === 'single' ? 'active' : ''}`}
          >
            Single Goods Receipt
          </div>
          <div 
            onClick={() => setEntryMode('bulk')}
            className={`sap-tab ${entryMode === 'bulk' ? 'active' : ''}`}
          >
            Bulk File Import
          </div>
        </div>

        {entryMode === 'bulk' ? (
          <div className="flex flex-col space-y-6">
            {/* Upload Area Card */}
            <label 
              htmlFor="bulk-file-upload"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="office-card p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/10 hover:border-blue-500 dark:hover:border-blue-500/80 transition rounded-xl group cursor-pointer py-12"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-250 select-none">📥</div>
              <div className="text-center space-y-1.5 max-w-lg select-none">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Click to select or drag and drop your Excel or CSV file
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports .xlsx and .csv files. File must contain columns mapping to: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">Material Description / Yarn Name, Supplier, Lot, Stock / Quantity</span>.
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  Optional columns: Plant (default: 1000), Storage Location (default: Y001), Unit (default: KG), Date.
                </p>
              </div>
              <input 
                id="bulk-file-upload"
                type="file" 
                accept=".xlsx,.csv" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setBulkFile(file);
                    const ext = file.name.split('.').pop().toLowerCase();
                    if (ext === 'xlsx') {
                      parseExcelFile(file);
                    } else if (ext === 'csv') {
                      parseCSVFile(file);
                    } else {
                      alert("Unsupported file type. Please upload a .xlsx or .csv file.");
                    }
                  }
                }}
                className="hidden" 
              />
            </label>

            {bulkFile && (
              <div className="office-card p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{bulkFile.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{(bulkFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setBulkFile(null);
                    setParsedRows([]);
                  }}
                  className="sap-btn sap-btn-secondary px-3 py-1 text-xs"
                >
                  Remove File
                </button>
              </div>
            )}

            {/* Table Preview */}
            {parsedRows.length > 0 && (
              <div className="office-card flex flex-col p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#1E293B]">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Import Preview ({parsedRows.length} Rows Parsed)
                  </div>
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ✅ {parsedRows.filter(r => r.valid).length} Valid
                    </span>
                    {parsedRows.some(r => !r.valid) && (
                      <span className="text-rose-600 dark:text-rose-450 font-bold">
                        ❌ {parsedRows.filter(r => !r.valid).length} Invalid
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[350px]">
                  <table className="sap-alv-table min-w-[900px] w-full text-xs">
                    <thead>
                      <tr>
                        <th className="w-16 text-center">Status</th>
                        <th>Plant</th>
                        <th>SLoc</th>
                        <th>Material Description (Yarn Name)</th>
                        <th>Unit</th>
                        <th>Supplier Name</th>
                        <th>Supplier Lot</th>
                        <th className="text-right">Unrestricted Stock</th>
                        <th>Errors / Warnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((row, index) => (
                        <tr key={index} className={row.valid ? '' : 'bg-rose-50/20 dark:bg-rose-955/5'}>
                          <td className="text-center font-bold text-base">
                            {row.valid ? (
                              <span className="text-emerald-600 dark:text-emerald-450" title="Valid Row">✓</span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-455" title="Invalid Row">⚠️</span>
                            )}
                          </td>
                          <td className="font-mono text-slate-500">{row.data.plant}</td>
                          <td className="font-mono text-slate-500">{row.data.storageLocation}</td>
                          <td className="font-bold text-slate-800 dark:text-slate-100">{row.data.materialDescription || <span className="text-rose-500 italic">[Empty]</span>}</td>
                          <td className="font-mono">{row.data.unit}</td>
                          <td>{row.data.supplierName || <span className="text-rose-500 italic">[Empty]</span>}</td>
                          <td className="font-mono text-blue-600 dark:text-blue-400">{row.data.supplierLot || <span className="text-rose-500 italic">[Empty]</span>}</td>
                          <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {parseFloat(row.data.unrestrictedStock).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-rose-600 dark:text-rose-405 font-mono text-[10px]">
                            {row.errors.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Form Group Block */
          <section className="office-card">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Yarn Goods Receipt (Inventory Posting Header)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {/* Plant */}
              <div className="flex items-center">
                <label className="w-32 sap-label">Plant <span className="text-red-500">*</span></label>
                <div className="flex-grow flex items-center">
                  <input 
                    type="text" 
                    name="plant" 
                    value={formData.plant} 
                    onChange={handleFormChange}
                    className="flex-1 sap-required font-mono rounded-r-none"
                    placeholder="Plant Code"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleF4Lookup('plant', ["1000 - Narshingdi Main Plant", "2000 - Dhaka Spinning Plant", "3000 - Sizing Dyeing Unit"])}
                    className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                    title="F4 Lookup Help"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {/* Storage Location */}
              <div className="flex items-center">
                <label className="w-32 sap-label">Storage Location <span className="text-red-500">*</span></label>
                <div className="flex-grow flex items-center">
                  <input 
                    type="text" 
                    name="storageLocation" 
                    value={formData.storageLocation} 
                    onChange={handleFormChange}
                    className="flex-1 sap-required font-mono rounded-r-none"
                    placeholder="SLoc Code"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleF4Lookup('storageLocation', ["Y001 - Raw Yarn Store", "Y002 - Production Buffer Store", "Y003 - Rejects / Waste Store"])}
                    className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                    title="F4 Lookup Help"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {/* Date of last goods receipt */}
              <div className="flex items-center">
                <label className="w-32 sap-label">Receipt Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  name="lastGoodsReceiptDate" 
                  value={formData.lastGoodsReceiptDate} 
                  onChange={handleFormChange}
                  className="flex-grow sap-required"
                />
              </div>

              {/* Material Description */}
              <div className="flex items-center md:col-span-2 lg:col-span-3">
                <label className="w-32 sap-label">Material Desc <span className="text-red-550">*</span></label>
                <div className="flex-grow flex items-center">
                  <input 
                    type="text" 
                    name="materialDescription" 
                    value={formData.materialDescription} 
                    onChange={handleFormChange}
                    className="flex-1 sap-required rounded-r-none"
                    placeholder="Enter detailed yarn specifications (e.g. 100% Cotton Carded 30s)"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleF4Lookup('materialDescription', [
                      "100% Cotton Carded Yarn 30s",
                      "100% Cotton Combed Yarn 40s",
                      "Polyester Filament DTY 150D/48F",
                      "T/C Yarn (65% Poly, 35% Cotton) 45s",
                      "100% Linen Yarn 25 Lea"
                    ])}
                    className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                    title="F4 Lookup Help"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {/* Unit */}
              <div className="flex items-center">
                <label className="w-32 sap-label">UNIT (UoM) <span className="text-red-550">*</span></label>
                <select 
                  name="unit" 
                  value={formData.unit} 
                  onChange={handleFormChange}
                  className="flex-grow sap-required"
                >
                  <option value="KG">KG - Kilograms</option>
                  <option value="LBS">LBS - Pounds</option>
                  <option value="BAGS">BAGS - Industrial Bags</option>
                  <option value="BALES">BALES - Cotton Bales</option>
                </select>
              </div>

              {/* Supplier Name */}
              <div className="flex items-center">
                <label className="w-32 sap-label">Supplier Name <span className="text-red-550">*</span></label>
                <div className="flex-grow flex items-center">
                  <input 
                    type="text" 
                    name="supplierName" 
                    value={formData.supplierName} 
                    onChange={handleFormChange}
                    className="flex-1 sap-required rounded-r-none"
                    placeholder="Supplier"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleF4Lookup('supplierName', ["Ching Tai Spinning Mills", "Ha-meem Textile Spinning", "Narayanganj Yarn Trading Ltd", "Bhaluka Cotton Traders"])}
                    className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                    title="F4 Lookup Help"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {/* Supplier Lot */}
              <div className="flex items-center">
                <label className="w-32 sap-label">Supplier Lot <span className="text-red-550">*</span></label>
                <input 
                  type="text" 
                  name="supplierLot" 
                  value={formData.supplierLot} 
                  onChange={handleFormChange}
                  className="flex-grow sap-required uppercase font-mono"
                  placeholder="Enter Supplier Batch / Lot No"
                />
              </div>

              {/* Unrestricted Stock (Quantity) */}
              <div className="flex items-center">
                <label className="w-32 sap-label">Unrestricted Stock <span className="text-red-550">*</span></label>
                <div className="flex-grow flex items-center relative">
                  <input 
                    type="number" 
                    name="unrestrictedStock" 
                    value={formData.unrestrictedStock} 
                    onChange={handleFormChange}
                    className="flex-1 text-right font-mono font-bold pr-12 sap-required"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <span className="absolute right-3 text-[11px] font-bold text-slate-400 font-mono pointer-events-none select-none">
                    {formData.unit}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
};

export default YarnStockEntry;
