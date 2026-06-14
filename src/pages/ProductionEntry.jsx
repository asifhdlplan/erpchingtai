import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { productionStorage } from '../services/productionStorage';
import { planningStorage } from '../services/planningStorage';
import { PasswordPromptModal } from '../components/ui/PasswordPromptModal';

const ProductionEntry = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [entries, setEntries] = useState([]);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    setNo: '',
    loomNo: '',
    shift: 'A shift',
    loomOperator: '',
    shiftIncharge: '',
    productionQty: ''
  });

  const [cloudStatus, setCloudStatus] = useState({
    checked: false,
    exists: true,
    error: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const dbCheck = await productionStorage.checkCloudTable();
      setCloudStatus({
        checked: true,
        exists: dbCheck.exists,
        error: dbCheck.error || null
      });

      if (dbCheck.exists) {
        const [entriesData, sheetsData] = await Promise.all([
          productionStorage.getAllProductionEntries(),
          planningStorage.getAllSheets()
        ]);
        setEntries(entriesData);
        setSets(sheetsData);
        if (setStatus) setStatus({ text: 'Loaded daily production logs and active sizing sets.', type: 'S' });
      }
    } catch (e) {
      console.error('Failed to load production entry data:', e);
      if (setStatus) setStatus({ text: 'Error fetching database records.', type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.setNo || !form.loomNo || !form.loomOperator || !form.shiftIncharge || !form.productionQty) {
      alert('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      if (setStatus) setStatus({ text: 'Saving production entry to database...', type: 'W' });
      await productionStorage.saveProductionEntry(form);
      
      setForm({
        date: new Date().toISOString().split('T')[0],
        setNo: '',
        loomNo: '',
        shift: 'A shift',
        loomOperator: '',
        shiftIncharge: '',
        productionQty: ''
      });
      
      const updatedEntries = await productionStorage.getAllProductionEntries();
      setEntries(updatedEntries);
      if (setStatus) setStatus({ text: 'Production entry registered successfully.', type: 'S' });
    } catch (err) {
      console.error(err);
      if (setStatus) setStatus({ text: 'Failed to save production log.', type: 'E' });
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget;
    setDeleteTarget(null);

    if (!window.confirm('Are you sure you want to permanently delete this production log entry?')) return;

    try {
      if (setStatus) setStatus({ text: 'Deleting production record...', type: 'W' });
      await productionStorage.deleteProductionEntry(targetId);
      const updatedEntries = await productionStorage.getAllProductionEntries();
      setEntries(updatedEntries);
      if (setStatus) setStatus({ text: 'Production log entry deleted.', type: 'S' });
    } catch (err) {
      console.error(err);
      if (setStatus) setStatus({ text: 'Failed to delete record.', type: 'E' });
      alert(`Delete failed: ${err.message}`);
    }
  };

  const copyMigrationSQL = () => {
    const sql = `-- Create erp_production_entries table
create table if not exists erp_production_entries (
  id text primary key,
  "setNo" bigint not null,
  date text not null,
  "loomNo" text not null,
  shift text not null check (shift in ('A shift', 'B shift', 'C shift')),
  "loomOperator" text not null,
  "shiftIncharge" text not null,
  "productionQty" numeric not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_production_entries
alter table erp_production_entries enable row level security;

-- Create policy for erp_production_entries
create policy "Allow all actions for anon on erp_production_entries" on erp_production_entries
  for all to anon using (true) with check (true);`;

    navigator.clipboard.writeText(sql)
      .then(() => {
        if (setStatus) setStatus({ text: 'SQL migration script copied to clipboard!', type: 'S' });
      })
      .catch((err) => {
        console.error(err);
        if (setStatus) setStatus({ text: 'Failed to copy SQL script.', type: 'E' });
      });
  };

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
          <button onClick={loadData} className="sap-btn" title="Refresh records">🔄 Refresh</button>
          <button onClick={() => onNavigate('set_wise_production')} className="sap-btn sap-btn-secondary" title="View Management Report">📊 Set-Wise Report</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Daily Production Entry
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors flex flex-col">
        {/* Warning Banner */}
        {!cloudStatus.exists && cloudStatus.checked && (
          <div className="p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/40 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                  Database Table Missing - Cloud Sync Error
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                  The table "erp_production_entries" was not found in your Supabase database instance. Please create the table to enable log entry.
                </p>
              </div>
            </div>
            <button
              onClick={copyMigrationSQL}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              📋 Copy SQL Migration
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Entry Form Card */}
          <div className="office-card lg:col-span-1">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
              Log Production Entry
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="sap-label mb-1">Production Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  className="sap-required"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="sap-label mb-1">Set Number</label>
                <select 
                  name="setNo"
                  value={form.setNo}
                  onChange={handleInputChange}
                  className="sap-required"
                  required
                >
                  <option value="">-- Select Sizing Set --</option>
                  {sets.map(set => (
                    <option key={set.setNo} value={set.setNo}>
                      Set {set.setNo} ({set.buyer} - {set.styleCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="sap-label mb-1">Loom Number</label>
                <input 
                  type="text" 
                  name="loomNo"
                  placeholder="e.g. L-12"
                  value={form.loomNo}
                  onChange={handleInputChange}
                  className="sap-required"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="sap-label mb-1">Shift</label>
                <select 
                  name="shift"
                  value={form.shift}
                  onChange={handleInputChange}
                  className="sap-required"
                  required
                >
                  <option value="A shift">A shift</option>
                  <option value="B shift">B shift</option>
                  <option value="C shift">C shift</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="sap-label mb-1">Loom Operator</label>
                <input 
                  type="text" 
                  name="loomOperator"
                  placeholder="e.g. Asif"
                  value={form.loomOperator}
                  onChange={handleInputChange}
                  className="sap-required"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="sap-label mb-1">Shift Incharge</label>
                <input 
                  type="text" 
                  name="shiftIncharge"
                  placeholder="e.g. Incharge Name"
                  value={form.shiftIncharge}
                  onChange={handleInputChange}
                  className="sap-required"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="sap-label mb-1">Production Qty (YD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="productionQty"
                  placeholder="Enter quantity in yards"
                  value={form.productionQty}
                  onChange={handleInputChange}
                  className="sap-required font-bold font-mono text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={saving || !cloudStatus.exists}
                className="w-full sap-btn mt-2"
              >
                {saving ? 'Saving...' : '💾 Save Entry'}
              </button>
            </form>
          </div>

          {/* History Grid Card */}
          <div className="office-card lg:col-span-2 flex flex-col h-[560px]">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
              Daily Production Logs List
            </div>
            
            <div className="flex-grow overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="sap-alv-table min-w-[700px] w-full text-xs">
                <thead>
                  <tr>
                    <th className="w-24 text-center">Date</th>
                    <th className="w-20 text-center">Set No</th>
                    <th className="w-20 text-center">Loom No</th>
                    <th className="w-24">Shift</th>
                    <th>Operator</th>
                    <th>Incharge</th>
                    <th className="w-24 text-right">Qty (YD)</th>
                    <th className="w-16 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 font-mono text-slate-400">
                        Loading production logs...
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 font-mono text-slate-400 italic">
                        No production records found. Enter production logs on the left.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="text-center font-mono text-slate-600 dark:text-slate-400">{entry.date}</td>
                        <td className="text-center font-bold text-blue-600 dark:text-blue-400 font-mono">{entry.setNo}</td>
                        <td className="text-center font-mono text-slate-800 dark:text-slate-200">{entry.loomNo}</td>
                        <td className="text-slate-600 dark:text-slate-400">{entry.shift}</td>
                        <td className="font-semibold text-slate-700 dark:text-slate-300">{entry.loomOperator}</td>
                        <td className="text-slate-600 dark:text-slate-400">{entry.shiftIncharge}</td>
                        <td className="text-right font-mono font-bold text-emerald-650 dark:text-emerald-400">
                          {(parseFloat(entry.productionQty) || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                        </td>
                        <td className="text-center p-1">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded transition"
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
          </div>
        </div>
      </div>

      {/* Delete password confirmation modal */}
      <PasswordPromptModal
        isOpen={deleteTarget !== null}
        title="Delete Production Entry Log"
        onClose={() => setDeleteTarget(null)}
        onSubmit={executeDelete}
      />
    </PageLayout>
  );
};

export default ProductionEntry;
