import React, { useState, useEffect, useRef } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { yarnDemandStorage } from '../services/yarnDemandStorage';

const YarnDemandCreation = ({ currentPage, onNavigate, onAdminClick, editingDemand, setEditingDemand, status, setStatus }) => {
  const entryAreaRef = useRef(null);
  const [prNo, setPrNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([
    {
      yarnCount: '',
      preferredBrand: '',
      reqQtyKg: '',
      demandQtyTon: '0.00',
      mktConcern: '',
      reasonForDemand: '',
      reqByDate: '',
      costingPrice: '',
      tc: '',
      remarks: ''
    }
  ]);
  const [loading, setLoading] = useState(true);
  
  // Database table state
  const [cloudStatus, setCloudStatus] = useState({
    checked: false,
    exists: true,
    error: null,
    isPlaceholder: false
  });

  useEffect(() => {
    checkTableAndLoadPR();
  }, [editingDemand]);

  const checkTableAndLoadPR = async () => {
    setLoading(true);
    
    // Check if Supabase configured
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          !import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');
                          
    if (isPlaceholder) {
      setCloudStatus({
        checked: true,
        exists: false,
        error: 'Supabase credentials are not configured.',
        isPlaceholder: true
      });
      setPrNo('500001');
      setLoading(false);
      return;
    }

    try {
      const result = await yarnDemandStorage.checkCloudTable();
      setCloudStatus({
        checked: true,
        exists: result.exists,
        error: result.error || null,
        isPlaceholder: false
      });

      if (result.exists) {
        if (editingDemand) {
          setPrNo(editingDemand.prNo);
          setDate(editingDemand.date);
          setItems(editingDemand.items || []);
        } else {
          const nextPR = await yarnDemandStorage.getNextPRNo();
          setPrNo(nextPR.toString());
        }
      } else {
        setPrNo('500001');
      }
    } catch (e) {
      console.error('Failed to init Yarn Demand Creation:', e);
      setCloudStatus({
        checked: true,
        exists: false,
        error: e.message || String(e),
        isPlaceholder: false
      });
      setPrNo('500001');
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto-calculate Demand Qty (ton) if Req Qty (KG) changes
    if (field === 'reqQtyKg') {
      const kgVal = parseFloat(value) || 0;
      updated[index]['demandQtyTon'] = (kgVal / 1000).toFixed(2);
    }

    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        yarnCount: '',
        preferredBrand: '',
        reqQtyKg: '',
        demandQtyTon: '0.00',
        mktConcern: '',
        reasonForDemand: '',
        reqByDate: '',
        costingPrice: '',
        tc: '',
        remarks: ''
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (items.length === 1) {
      alert("At least one demand item row is required.");
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleSave = async () => {
    // Basic validation
    if (!cloudStatus.exists) {
      alert("Cannot save. Supabase table is not configured. Please run SQL migration first.");
      return;
    }

    const invalid = items.some(
      item => !item.yarnCount || !item.preferredBrand || !item.reqQtyKg || !item.mktConcern || !item.reasonForDemand || !item.reqByDate || !item.costingPrice
    );

    if (invalid) {
      alert("Please fill in all mandatory columns for all rows:\nYarn Count, Preferred Brand, Req Qty (KG), MKT Concern, Reason, Required by Date, Costing Price.");
      return;
    }

    try {
      if (setStatus) setStatus({ text: 'Saving Yarn Demand Sheet to Supabase...', type: 'W' });
      
      const payload = {
        id: editingDemand?.id || null, // Keep ID if editing
        prNo: parseInt(prNo) || 500001,
        date,
        items
      };

      await yarnDemandStorage.saveYarnDemand(payload);
      
      if (setStatus) setStatus({ text: `Yarn Demand PR ${prNo} posted successfully.`, type: 'S' });
      alert(`Yarn Demand PR ${prNo} saved successfully!`);
      
      if (setEditingDemand) setEditingDemand(null);
      onNavigate('all_yarn_demands');
    } catch (err) {
      console.error('Save demand error:', err);
      if (setStatus) setStatus({ text: `Failed to save demand: ${err.message}`, type: 'E' });
      alert(`Failed to save demand: ${err.message}`);
    }
  };

  const resetForm = () => {
    if (window.confirm("Are you sure you want to clear current entries?")) {
      setItems([
        {
          yarnCount: '',
          preferredBrand: '',
          reqQtyKg: '',
          demandQtyTon: '0.00',
          mktConcern: '',
          reasonForDemand: '',
          reqByDate: '',
          costingPrice: '',
          tc: '',
          remarks: ''
        }
      ]);
      if (setStatus) setStatus({ text: 'Form cleared.', type: 'W' });
    }
  };

  const handleCopySQL = () => {
    const sqlScript = `-- Create erp_yarn_demands table
create table if not exists erp_yarn_demands (
  id text primary key,
  "prNo" bigint not null unique,
  date text not null,
  items jsonb default '[]'::jsonb,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_yarn_demands
alter table erp_yarn_demands enable row level security;

-- Create policy for erp_yarn_demands
create policy "Allow all actions for anon on erp_yarn_demands" on erp_yarn_demands
  for all to anon using (true) with check (true);`;

    navigator.clipboard.writeText(sqlScript)
      .then(() => {
        if (setStatus) setStatus({ text: 'SQL migration script copied to clipboard successfully!', type: 'S' });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        if (setStatus) setStatus({ text: 'Failed to copy SQL script. Please copy it manually.', type: 'E' });
      });
  };

  const focusByOffset = (currentEl, offset) => {
    const root = entryAreaRef.current;
    if (!root) return;
    const fields = Array.from(
      root.querySelectorAll('input, select, textarea, button')
    ).filter((el) => !el.disabled && !el.readOnly && el.type !== 'hidden' && el.tabIndex !== -1 && !el.classList.contains('pointer-events-none'));
    const idx = fields.indexOf(currentEl);
    if (idx < 0) return;
    const nextIdx = idx + offset;
    if (nextIdx >= 0 && nextIdx < fields.length) {
      fields[nextIdx].focus();
      if (fields[nextIdx].select) fields[nextIdx].select();
    }
  };

  const handleEntryKeyDown = (e) => {
    const currentEl = e.target;
    const tag = currentEl.tagName;
    if (!['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;

    // Grid navigation inside table body
    const tr = currentEl.closest('tbody tr');
    if (!tr) {
      // Linear tab-like navigation fallback outside of the main specification grid
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        focusByOffset(currentEl, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        focusByOffset(currentEl, -1);
      } else if (e.key === 'Enter' && tag !== 'TEXTAREA' && currentEl.type !== 'submit') {
        e.preventDefault();
        focusByOffset(currentEl, 1);
      }
      return;
    }

    const tbody = tr.closest('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const rowIndex = rows.indexOf(tr);

    const getRowFocusables = (rowEl) => {
      return Array.from(
        rowEl.querySelectorAll('input, select, textarea, button')
      ).filter((el) => !el.disabled && !el.readOnly && el.type !== 'hidden' && el.tabIndex !== -1 && !el.classList.contains('pointer-events-none'));
    };

    const currentFocusables = getRowFocusables(tr);
    const colIndex = currentFocusables.indexOf(currentEl);
    if (colIndex < 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (colIndex < currentFocusables.length - 1) {
        const nextEl = currentFocusables[colIndex + 1];
        nextEl.focus();
        if (nextEl.select) nextEl.select();
      } else if (rowIndex < rows.length - 1) {
        const nextRowFocusables = getRowFocusables(rows[rowIndex + 1]);
        if (nextRowFocusables.length > 0) {
          nextRowFocusables[0].focus();
          if (nextRowFocusables[0].select) nextRowFocusables[0].select();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (colIndex > 0) {
        const prevEl = currentFocusables[colIndex - 1];
        prevEl.focus();
        if (prevEl.select) prevEl.select();
      } else if (rowIndex > 0) {
        const prevRowFocusables = getRowFocusables(rows[rowIndex - 1]);
        if (prevRowFocusables.length > 0) {
          const lastEl = prevRowFocusables[prevRowFocusables.length - 1];
          lastEl.focus();
          if (lastEl.select) lastEl.select();
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < rows.length - 1) {
        const nextRowFocusables = getRowFocusables(rows[rowIndex + 1]);
        const targetEl = nextRowFocusables[colIndex] || nextRowFocusables[nextRowFocusables.length - 1];
        if (targetEl) {
          targetEl.focus();
          if (targetEl.select) targetEl.select();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const prevRowFocusables = getRowFocusables(rows[rowIndex - 1]);
        const targetEl = prevRowFocusables[colIndex] || prevRowFocusables[prevRowFocusables.length - 1];
        if (targetEl) {
          targetEl.focus();
          if (targetEl.select) targetEl.select();
        }
      }
    } else if (e.key === 'Enter') {
      if (currentEl.type !== 'submit' && tag !== 'TEXTAREA') {
        e.preventDefault();
        if (colIndex < currentFocusables.length - 1) {
          const nextEl = currentFocusables[colIndex + 1];
          nextEl.focus();
          if (nextEl.select) nextEl.select();
        } else if (rowIndex < rows.length - 1) {
          const nextRowFocusables = getRowFocusables(rows[rowIndex + 1]);
          if (nextRowFocusables.length > 0) {
            nextRowFocusables[0].focus();
            if (nextRowFocusables[0].select) nextRowFocusables[0].select();
          }
        }
      }
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
          <button onClick={handleSave} className="sap-btn" title="Post/Save Yarn Demand Data" disabled={loading}>💾 Save/Post</button>
          {!editingDemand && <button onClick={resetForm} className="sap-btn sap-btn-secondary" title="Reset current inputs">♻ Reset Form</button>}
          <button onClick={() => { if (setEditingDemand) setEditingDemand(null); onNavigate('all_yarn_demands'); }} className="sap-btn sap-btn-secondary" title="Go to All Yarn Demands list">📋 All Demands</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          {editingDemand ? 'Edit Yarn Demand' : 'Yarn Demand Entry'}
        </div>
      </div>

      <div ref={entryAreaRef} onKeyDown={handleEntryKeyDown} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors flex flex-col">
        
        {/* Database connection missing warning */}
        {!cloudStatus.exists && cloudStatus.checked && (
          <div className="p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/40 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0" role="img" aria-label="warning">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                  Cloud Database Sync Warning - Demands Table Missing
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                  {cloudStatus.isPlaceholder 
                    ? "Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable yarn demand records."
                    : `The table "erp_yarn_demands" was not found in your Supabase database instance. Please create the table in your Supabase editor to enable saves.`}
                </p>
              </div>
            </div>
            {!cloudStatus.isPlaceholder && (
              <button
                onClick={handleCopySQL}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded transition flex items-center gap-1.5 shrink-0 shadow-sm shadow-amber-600/10"
              >
                📋 Copy SQL Migration
              </button>
            )}
          </div>
        )}

        {/* Header Metadata Card */}
        <section className="office-card">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Yarn Demand Header Info
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PR NO */}
            <div className="flex items-center">
              <label className="w-32 sap-label">PR NO</label>
              <input 
                type="text" 
                value={prNo} 
                className="flex-grow font-mono font-bold text-blue-650 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed" 
                readOnly
              />
            </div>

            {/* Date */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Document Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="flex-grow sap-required"
              />
            </div>
          </div>
        </section>

        {/* Items Data Grid Card */}
        <section className="office-card flex-grow flex flex-col p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Demand Items Specification Grid
            </div>
            <button 
              onClick={handleAddRow}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded transition flex items-center gap-1 shrink-0"
            >
              ➕ Add Row
            </button>
          </div>

          <div className="overflow-x-auto flex-grow">
            <table className="sap-alv-table min-w-[1200px] w-full text-xs">
              <thead>
                <tr>
                  <th className="w-12 text-center">SL</th>
                  <th>Yarn Count *</th>
                  <th>Preferred Brand *</th>
                  <th className="w-28 text-right">Req Qty (KG) *</th>
                  <th className="w-28 text-right bg-slate-50 dark:bg-slate-900">Req Qty (MT)</th>
                  <th>MKT Concern *</th>
                  <th>Reason (Style//Qty//Buyer) *</th>
                  <th className="w-36 text-center">Required by (Start) *</th>
                  <th className="w-28 text-right">Costing Price ($) *</th>
                  <th className="w-32">TC</th>
                  <th>Remarks</th>
                  <th className="w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="text-center py-10 font-mono text-slate-400">
                      Verifying cloud server state...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-10 font-mono text-slate-400 italic">
                      No demand items. Click "Add Row" to append rows.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center font-mono text-slate-500 font-bold">{index + 1}</td>
                      <td>
                        <input 
                          type="text" 
                          value={item.yarnCount} 
                          onChange={(e) => handleRowChange(index, 'yarnCount', e.target.value)}
                          placeholder="e.g. 7 RSL033B LT"
                          className="w-full sap-required"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={item.preferredBrand} 
                          onChange={(e) => handleRowChange(index, 'preferredBrand', e.target.value)}
                          placeholder="e.g. Sapphire"
                          className="w-full sap-required"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.reqQtyKg} 
                          onChange={(e) => handleRowChange(index, 'reqQtyKg', e.target.value)}
                          placeholder="0.00"
                          className="w-full text-right font-mono sap-required"
                        />
                      </td>
                      <td className="bg-slate-50 dark:bg-slate-900">
                        <input 
                          type="text" 
                          value={item.demandQtyTon} 
                          className="w-full text-right font-mono font-bold text-slate-500 dark:text-slate-400 bg-transparent border-0 pointer-events-none" 
                          readOnly
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={item.mktConcern} 
                          onChange={(e) => handleRowChange(index, 'mktConcern', e.target.value)}
                          placeholder="e.g. Rahul"
                          className="w-full sap-required"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={item.reasonForDemand} 
                          onChange={(e) => handleRowChange(index, 'reasonForDemand', e.target.value)}
                          placeholder="e.g. R17937-307-Regen // 109K // ZARA"
                          className="w-full sap-required font-mono text-[10px]"
                        />
                      </td>
                      <td>
                        <input 
                          type="date" 
                          value={item.reqByDate} 
                          onChange={(e) => handleRowChange(index, 'reqByDate', e.target.value)}
                          className="w-full text-center sap-required"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.costingPrice} 
                          onChange={(e) => handleRowChange(index, 'costingPrice', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full text-right font-mono sap-required"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={item.tc} 
                          onChange={(e) => handleRowChange(index, 'tc', e.target.value)}
                          placeholder="e.g. GRS, BCI"
                          className="w-full font-mono text-[10px]"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={item.remarks} 
                          onChange={(e) => handleRowChange(index, 'remarks', e.target.value)}
                          placeholder="Comments..."
                          className="w-full"
                        />
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleRemoveRow(index)}
                          className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 rounded text-[11px]"
                          title="Remove this row"
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
        </section>
      </div>
    </PageLayout>
  );
};

export default YarnDemandCreation;
