import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { yarnReceiptStorage } from '../services/yarnReceiptStorage';
import { yarnStockStorage } from '../services/yarnStockStorage';

const AllYarnList = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('rcvDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [cloudStatus, setCloudStatus] = useState({
    checked: false,
    exists: true,
    error: null,
    isPlaceholder: false
  });

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);

    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          !import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          import.meta.env.VITE_SUPABASE_URL.includes('your-project-id') ||
                          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-public-key');
                          
    if (isPlaceholder) {
      setCloudStatus({
        checked: true,
        exists: false,
        error: 'Supabase credentials are not configured.',
        isPlaceholder: true
      });
    } else {
      try {
        const result = await yarnReceiptStorage.checkCloudTable();
        setCloudStatus({
          checked: true,
          exists: result.exists,
          error: result.error || null,
          isPlaceholder: false
        });
      } catch (checkErr) {
        console.error('Database connection check error:', checkErr);
        setCloudStatus({
          checked: true,
          exists: false,
          error: checkErr.message || String(checkErr),
          isPlaceholder: false
        });
      }
    }

    try {
      const stockItems = await yarnStockStorage.getAllYarnStocks();
      await yarnReceiptStorage.backfillReceiptsFromStock(stockItems);
      const data = await yarnReceiptStorage.getAllYarnReceipts();
      setReceipts(data);
      if (setStatus) setStatus({ text: `Yarn Receipts: ${data.length} records retrieved.`, type: 'S' });
    } catch (e) {
      console.error('Failed to load yarn receipts:', e);
      if (setStatus) setStatus({ text: 'Error loading goods receipt logs.', type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = () => {
    const sqlScript = `-- Create erp_yarn_receipts table
create table if not exists erp_yarn_receipts (
  id text primary key,
  plant text,
  "storageLocation" text,
  "materialDescription" text,
  unit text,
  "supplierName" text,
  "supplierLot" text,
  "receiveQty" numeric default 0,
  "rcvDate" text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_yarn_receipts
alter table erp_yarn_receipts enable row level security;

-- Create policy for erp_yarn_receipts
create policy "Allow all actions for anon on erp_yarn_receipts" on erp_yarn_receipts
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedReceipts = React.useMemo(() => {
    const filtered = receipts.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        (item.plant || '').toLowerCase().includes(search) ||
        (item.storageLocation || '').toLowerCase().includes(search) ||
        (item.materialDescription || '').toLowerCase().includes(search) ||
        (item.unit || '').toLowerCase().includes(search) ||
        (item.supplierName || '').toLowerCase().includes(search) ||
        (item.supplierLot || '').toLowerCase().includes(search) ||
        (item.rcvDate || '').toLowerCase().includes(search)
      );
    });

    return [...filtered].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'receiveQty') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [receipts, searchTerm, sortField, sortAsc]);

  const handleExportCSV = () => {
    if (receipts.length === 0) return;
    const headers = ['Plant', 'Storage Location', 'Date', 'Material Description', 'UNIT', 'Supplier Name', 'Supplier Lot', 'Received Qty'];
    const rows = receipts.map(item => [
      item.plant,
      item.storageLocation,
      item.rcvDate,
      item.materialDescription,
      item.unit,
      item.supplierName,
      item.supplierLot,
      item.receiveQty
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `YARN_GOODS_RECEIPTS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (setStatus) setStatus({ text: 'Receipt logs exported as CSV file.', type: 'S' });
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
          <button onClick={loadReceipts} className="sap-btn" title="Refresh receipt list">🔄 Refresh</button>
          <button onClick={handleExportCSV} disabled={receipts.length === 0} className="sap-btn sap-btn-secondary disabled:opacity-50" title="Export current list to CSV">📥 Export CSV</button>
          <button onClick={() => onNavigate('yarn_stock_entry')} className="sap-btn sap-btn-secondary" title="Go to Yarn Stock Entry Form">➕ Yarn Stock Entry</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          All Yarn List
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 bg-slate-50 dark:bg-[#0B0F19] flex flex-col space-y-4 transition-colors">
        {/* Cloud Warning Banner */}
        {!cloudStatus.exists && cloudStatus.checked && (
          <div className="p-4 bg-amber-50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/40 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0" role="img" aria-label="warning">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                  Cloud Database Sync Warning - Running in Local Browser Mode
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/85 mt-1">
                  {cloudStatus.isPlaceholder 
                    ? "Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable global cloud database syncing."
                    : `The table "erp_yarn_receipts" was not found in your Supabase database instance. To store yarn receipts globally, you need to create the table.`}
                </p>
              </div>
            </div>
            {!cloudStatus.isPlaceholder && (
              <button
                onClick={handleCopySQL}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded transition flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                📋 Copy SQL Migration
              </button>
            )}
          </div>
        )}

        {/* Search & Statistics Filter Bar */}
        <div className="office-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="sap-label text-slate-600 dark:text-slate-400">Search Material / Supplier / Lot:</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter table rows..."
                className="w-64"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="sap-btn sap-btn-secondary px-3 py-1 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Total receipts: <span className="font-bold text-blue-600 dark:text-blue-400">{sortedReceipts.length}</span>
          </div>
        </div>

        {/* ALV Grid Listing Table */}
        <div className="flex-grow overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="sap-alv-table min-w-[1000px]">
            <thead>
              <tr className="cursor-pointer select-none">
                <th onClick={() => handleSort('rcvDate')} className="w-32">
                  Receive Date {sortField === 'rcvDate' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('plant')}>
                  Plant {sortField === 'plant' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('storageLocation')}>
                  Storage Location {sortField === 'storageLocation' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('materialDescription')}>
                  Material Description {sortField === 'materialDescription' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('unit')}>
                  UNIT {sortField === 'unit' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('supplierName')}>
                  Supplier Name {sortField === 'supplierName' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('supplierLot')}>
                  Supplier Lot {sortField === 'supplierLot' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('receiveQty')} className="text-right w-40">
                  Received Qty {sortField === 'receiveQty' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 font-mono text-xs text-slate-400 dark:text-slate-500">
                    Querying Supabase database instance...
                  </td>
                </tr>
              ) : sortedReceipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 font-mono text-xs text-slate-400 dark:text-slate-550 italic">
                    No historical yarn goods receipt records found. Click "Yarn Stock Entry" to post receipts.
                  </td>
                </tr>
              ) : (
                sortedReceipts.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="font-mono text-slate-700 dark:text-slate-350">
                      {item.rcvDate ? new Date(item.rcvDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="font-mono text-slate-500">{item.plant}</td>
                    <td className="font-mono text-slate-500">{item.storageLocation}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100">{item.materialDescription}</td>
                    <td>
                      <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-bold font-mono text-slate-600 dark:text-slate-300">
                        {item.unit}
                      </span>
                    </td>
                    <td className="text-slate-700 dark:text-slate-300">{item.supplierName}</td>
                    <td className="font-mono text-blue-600 dark:text-blue-400">{item.supplierLot}</td>
                    <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-450">
                      {parseFloat(item.receiveQty || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
};

export default AllYarnList;
