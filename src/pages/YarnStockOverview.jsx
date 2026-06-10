import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { yarnStockStorage } from '../services/yarnStockStorage';
import { PasswordPromptModal } from '../components/ui/PasswordPromptModal';

const YarnStockEditModal = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    materialDescription: '',
    supplierName: '',
    supplierLot: '',
    unrestrictedStock: '',
    unit: '',
    plant: '',
    storageLocation: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        materialDescription: item.materialDescription || '',
        supplierName: item.supplierName || '',
        supplierLot: item.supplierLot || '',
        unrestrictedStock: item.unrestrictedStock !== undefined ? String(item.unrestrictedStock) : '',
        unit: item.unit || 'KG',
        plant: item.plant || '',
        storageLocation: item.storageLocation || ''
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...item,
      ...formData,
      unrestrictedStock: parseFloat(formData.unrestrictedStock) || 0
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
        <div className="bg-slate-50 dark:bg-slate-900/60 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
            Edit Yarn Stock Item
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 focus:outline-none text-lg">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Material Description (Yarn Name) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={formData.materialDescription}
                onChange={e => setFormData({ ...formData, materialDescription: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Supplier Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.supplierName}
                  onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Supplier Lot</label>
                <input
                  type="text"
                  value={formData.supplierLot}
                  onChange={e => setFormData({ ...formData, supplierLot: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unrestricted Qty <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.unrestrictedStock}
                  onChange={e => setFormData({ ...formData, unrestrictedStock: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-bold font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unit <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Plant</label>
                <input
                  type="text"
                  value={formData.plant}
                  onChange={e => setFormData({ ...formData, plant: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Storage Location</label>
                <input
                  type="text"
                  value={formData.storageLocation}
                  onChange={e => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="sap-btn sap-btn-secondary py-1.5 px-4 text-xs font-bold">
              Cancel
            </button>
            <button type="submit" className="sap-btn py-1.5 px-4 text-xs font-bold">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const YarnStockOverview = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [cloudStatus, setCloudStatus] = useState({
    checked: false,
    exists: true,
    error: null,
    isPlaceholder: false
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
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
        const result = await yarnStockStorage.checkCloudTable();
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
      const data = await yarnStockStorage.getAllYarnStocks();
      setStocks(data);
      if (setStatus) setStatus({ text: `Yarn Stock Ledger: ${data.length} records retrieved.`, type: 'S' });
    } catch (e) {
      console.error('Failed to load yarn stock status:', e);
      if (setStatus) setStatus({ text: 'Error loading inventory stock data.', type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = () => {
    const sqlScript = `-- Create erp_yarn_stock table
create table if not exists erp_yarn_stock (
  id text primary key,
  plant text,
  "storageLocation" text,
  "materialDescription" text,
  unit text,
  "supplierName" text,
  "supplierLot" text,
  "unrestrictedStock" numeric default 0,
  "lastGoodsReceiptDate" text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on erp_yarn_stock
alter table erp_yarn_stock enable row level security;

-- Create policy for erp_yarn_stock
create policy "Allow all actions for anon on erp_yarn_stock" on erp_yarn_stock
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

  const handleDeleteItem = (item) => {
    setDeleteTarget(item);
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      await yarnStockStorage.saveYarnStock(updatedItem);
      if (setStatus) setStatus({ text: `Yarn stock item "${updatedItem.materialDescription}" updated successfully.`, type: 'S' });
      setEditingItem(null);
      loadStocks();
    } catch (error) {
      console.error('Update stock error:', error);
      if (setStatus) setStatus({ text: 'Failed to update yarn stock item.', type: 'E' });
    }
  };

  const sortedStocks = React.useMemo(() => {
    const filtered = stocks.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        (item.plant || '').toLowerCase().includes(search) ||
        (item.storageLocation || '').toLowerCase().includes(search) ||
        (item.materialDescription || '').toLowerCase().includes(search) ||
        (item.unit || '').toLowerCase().includes(search) ||
        (item.supplierName || '').toLowerCase().includes(search) ||
        (item.supplierLot || '').toLowerCase().includes(search)
      );
    });

    return [...filtered].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'unrestrictedStock') {
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
  }, [stocks, searchTerm, sortField, sortAsc]);

  const handleExportCSV = () => {
    if (stocks.length === 0) return;
    const headers = ['Plant', 'Storage Location', 'Material Description', 'UNIT', 'Supplier Name', 'Supplier Lot', 'Unrestricted Stock', 'Date of last goods receipt'];
    const rows = stocks.map(item => [
      item.plant,
      item.storageLocation,
      item.materialDescription,
      item.unit,
      item.supplierName,
      item.supplierLot,
      item.unrestrictedStock,
      item.lastGoodsReceiptDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `YARN_STOCK_STATUS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (setStatus) setStatus({ text: 'Stock ledger data exported as CSV file.', type: 'S' });
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
          <button onClick={loadStocks} className="sap-btn" title="Refresh stock ledger">🔄 Refresh</button>
          <button onClick={handleExportCSV} disabled={stocks.length === 0} className="sap-btn sap-btn-secondary disabled:opacity-50" title="Export current list to CSV">📥 Export CSV</button>
          <button onClick={() => onNavigate('yarn_stock_entry')} className="sap-btn sap-btn-secondary" title="Go to Yarn Stock Entry Form">➕ Yarn Stock Entry</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Stock Overview
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 bg-slate-50 dark:bg-[#0B0F19] flex flex-col space-y-4 transition-colors">
        {/* Cloud Warning Banner */}
        {!cloudStatus.exists && cloudStatus.checked && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0" role="img" aria-label="warning">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                  Cloud Database Sync Warning - Running in Local Browser Mode
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                  {cloudStatus.isPlaceholder 
                    ? "Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable global cloud database syncing."
                    : `The table "erp_yarn_stock" was not found in your Supabase database instance. To store yarn stock globally, you need to create the table.`}
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

        {/* Search & Statistics Filter Bar */}
        <div className="office-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="sap-label text-slate-600 dark:text-slate-400">Search Material / Supplier / Plant:</label>
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
            Total records: <span className="font-bold text-blue-600 dark:text-blue-400">{sortedStocks.length}</span>
          </div>
        </div>

        {/* ALV Grid Listing Table */}
        <div className="flex-grow overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="sap-alv-table min-w-[1000px]">
            <thead>
              <tr className="cursor-pointer select-none">
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
                <th onClick={() => handleSort('unrestrictedStock')} className="text-right">
                  Unrestricted Stock {sortField === 'unrestrictedStock' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('lastGoodsReceiptDate')}>
                  Date of last goods receipt {sortField === 'lastGoodsReceiptDate' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 font-mono text-xs text-slate-400 dark:text-slate-500">
                    Querying Supabase database instance...
                  </td>
                </tr>
              ) : sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 font-mono text-xs text-slate-400 dark:text-slate-550 italic">
                    No warehouse inventory stock items found. Click "Yarn Stock Entry" to register new stock.
                  </td>
                </tr>
              ) : (
                sortedStocks.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="font-mono text-slate-600 dark:text-slate-400">{item.plant}</td>
                    <td className="font-mono text-slate-600 dark:text-slate-400">{item.storageLocation}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100">{item.materialDescription}</td>
                    <td>
                      <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-bold font-mono text-slate-600 dark:text-slate-300">
                        {item.unit}
                      </span>
                    </td>
                    <td className="text-slate-700 dark:text-slate-300">{item.supplierName}</td>
                    <td className="font-mono text-blue-600 dark:text-blue-400">{item.supplierLot}</td>
                    <td className="text-right font-mono font-bold">
                      {parseFloat(item.unrestrictedStock || 0) <= 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 animate-pulse text-[11px] bg-rose-50 dark:bg-rose-955/20 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                          Need to procure item
                        </span>
                      ) : parseFloat(item.unrestrictedStock || 0) < 500 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-amber-600 dark:text-amber-400">
                            {parseFloat(item.unrestrictedStock || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 text-[9px] font-bold bg-amber-50 dark:bg-amber-955/20 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900/40 uppercase tracking-wider block">
                            ⚠ Re-stock / Procure
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {parseFloat(item.unrestrictedStock || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-slate-500 dark:text-slate-400">
                      {item.lastGoodsReceiptDate ? new Date(item.lastGoodsReceiptDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="text-center p-1 flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => setEditTarget(item)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded transition"
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
        <PasswordPromptModal
          isOpen={editTarget !== null}
          title={editTarget ? `Edit Yarn Stock: ${editTarget.materialDescription}` : ''}
          onClose={() => setEditTarget(null)}
          onSubmit={async () => {
            const item = editTarget;
            setEditTarget(null);
            setEditingItem(item);
          }}
        />
        <PasswordPromptModal
          isOpen={deleteTarget !== null}
          title={deleteTarget ? `Delete Yarn Stock: ${deleteTarget.materialDescription}` : ''}
          onClose={() => setDeleteTarget(null)}
          onSubmit={async () => {
            const item = deleteTarget;
            setDeleteTarget(null);
            const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${item.materialDescription}" (Lot: ${item.supplierLot || 'N/A'})?`);
            if (!confirmDelete) return;
            
            try {
              await yarnStockStorage.deleteYarnStock(item.id);
              if (setStatus) setStatus({ text: `Item "${item.materialDescription}" deleted from stock ledger successfully.`, type: 'S' });
              loadStocks();
            } catch (error) {
              console.error('Delete error:', error);
              if (setStatus) setStatus({ text: 'Failed to delete item from stock.', type: 'E' });
            }
          }}
        />
        <YarnStockEditModal
          isOpen={editingItem !== null}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      </div>
    </PageLayout>
  );
};

export default YarnStockOverview;
