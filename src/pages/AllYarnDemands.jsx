import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { yarnDemandStorage } from '../services/yarnDemandStorage';
import { YarnDemandPreview } from '../components/planning/YarnDemandPreview';
import { PasswordPromptModal } from '../components/ui/PasswordPromptModal';

const AllYarnDemands = ({ currentPage, onNavigate, onAdminClick, onEditDemand, status, setStatus }) => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Preview state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Database table state
  const [cloudStatus, setCloudStatus] = useState({
    checked: false,
    exists: true,
    error: null,
    isPlaceholder: false
  });

  useEffect(() => {
    loadDemands();
  }, []);

  const loadDemands = async () => {
    setLoading(true);

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
        const data = await yarnDemandStorage.getAllYarnDemands();
        setDemands(data);
        if (setStatus) setStatus({ text: `Yarn Demands ledger: ${data.length} records retrieved.`, type: 'S' });
      }
    } catch (e) {
      console.error('Failed to load demands:', e);
      if (setStatus) setStatus({ text: 'Error loading yarn demand records.', type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (demand) => {
    setSelectedDemand(demand);
    setIsPreviewMode(true);
    if (setStatus) setStatus({ text: `Printing Yarn Demand PR ${demand.prNo}...`, type: 'S' });
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleView = (demand) => {
    setSelectedDemand(demand);
    setIsPreviewMode(true);
    if (setStatus) setStatus({ text: `Displaying Yarn Demand PR ${demand.prNo}`, type: 'S' });
  };

  const handleDelete = (id, prNo) => {
    setDeleteTarget({ id, prNo });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id, prNo } = deleteTarget;
    setDeleteTarget(null);

    const doubleConfirm = window.confirm(`Are you sure you want to permanently delete Yarn Demand PR NO: ${prNo}?`);
    if (!doubleConfirm) return;

    try {
      if (setStatus) setStatus({ text: `Deleting demand record PR ${prNo}...`, type: 'W' });
      await yarnDemandStorage.deleteYarnDemand(id);
      if (setStatus) setStatus({ text: `Yarn Demand PR ${prNo} deleted successfully.`, type: 'S' });
      loadDemands();
    } catch (err) {
      console.error('Delete demand error:', err);
      if (setStatus) setStatus({ text: 'Failed to delete demand record.', type: 'E' });
      alert(`Delete failed: ${err.message}`);
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

  const filteredDemands = React.useMemo(() => {
    return demands.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchPR = d.prNo?.toString().includes(q);
      const matchDate = d.date?.includes(q);
      const matchItems = (d.items || []).some(item => 
        (item.yarnCount || '').toLowerCase().includes(q) ||
        (item.preferredBrand || '').toLowerCase().includes(q) ||
        (item.mktConcern || '').toLowerCase().includes(q) ||
        (item.reasonForDemand || '').toLowerCase().includes(q)
      );
      return matchPR || matchDate || matchItems;
    });
  }, [demands, searchQuery]);

  if (isPreviewMode && selectedDemand) {
    return (
      <div className="relative min-h-screen bg-slate-800 p-8 flex flex-col items-center">
        {/* Floating Print Overlay Control */}
        <div className="fixed top-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl flex items-center gap-2 z-50 select-none">
          <button 
            onClick={() => handlePrint(selectedDemand)}
            className="sap-btn"
          >
            🖨 Print / PDF
          </button>
          <button 
            onClick={() => setIsPreviewMode(false)}
            className="sap-btn sap-btn-secondary"
          >
            ❌ Close Preview
          </button>
        </div>

        {/* Printable Sheet */}
        <YarnDemandPreview data={selectedDemand} />
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
      {/* Transaction Action Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none transition-colors">
        <div className="flex flex-wrap gap-2">
          <button onClick={loadDemands} className="sap-btn" title="Refresh demands ledger">🔄 Refresh</button>
          <button onClick={() => onNavigate('yarn_demand_creation')} className="sap-btn sap-btn-secondary" title="Create a new Special Yarn Demand">➕ New Demand</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          All Yarn Demands Archive
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors flex flex-col">
        
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
                    : `The table "erp_yarn_demands" was not found in your Supabase database instance. Please create the table in your Supabase editor to enable records.`}
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

        {/* Filter Panel Card */}
        <div className="office-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="sap-label text-slate-600 dark:text-slate-400">Search PR No / Count / Brand / Concern:</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter table rows..."
                className="w-72"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="sap-btn sap-btn-secondary px-3 py-1 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Total records: <span className="font-bold text-blue-600 dark:text-blue-400">{filteredDemands.length}</span>
          </div>
        </div>

        {/* Demands Archive Grid Table */}
        <div className="flex-grow overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="sap-alv-table min-w-[950px] w-full text-xs">
            <thead>
              <tr>
                <th className="w-24 text-center">PR NO</th>
                <th className="w-32">Document Date</th>
                <th>Yarn Counts Included</th>
                <th>Preferred Brands</th>
                <th>Market Concerns</th>
                <th className="w-32 text-right">Total Req (KG)</th>
                <th className="w-32 text-right">Total Req (MT)</th>
                <th className="w-64 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 font-mono text-slate-400">
                    Querying Supabase database instance...
                  </td>
                </tr>
              ) : filteredDemands.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 font-mono text-slate-400 italic">
                    No Yarn Demand documents found. Click "New Demand" to create one.
                  </td>
                </tr>
              ) : (
                filteredDemands.map((demand) => {
                  const counts = Array.from(new Set((demand.items || []).map(i => i.yarnCount).filter(Boolean))).join(', ');
                  const brands = Array.from(new Set((demand.items || []).map(i => i.preferredBrand).filter(Boolean))).join(', ');
                  const concerns = Array.from(new Set((demand.items || []).map(i => i.mktConcern).filter(Boolean))).join(', ');
                  const totalKg = (demand.items || []).reduce((sum, i) => sum + (parseFloat(i.reqQtyKg) || 0), 0);
                  const totalTon = (demand.items || []).reduce((sum, i) => sum + (parseFloat(i.demandQtyTon) || 0), 0);

                  return (
                    <tr key={demand.id}>
                      <td className="font-bold text-blue-650 dark:text-blue-400 font-mono text-center">{demand.prNo}</td>
                      <td className="font-mono text-slate-600 dark:text-slate-400">{demand.date}</td>
                      <td className="font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate" title={counts}>{counts || '-'}</td>
                      <td className="text-slate-700 dark:text-slate-350 max-w-xs truncate" title={brands}>{brands || '-'}</td>
                      <td className="text-slate-700 dark:text-slate-350 max-w-xs truncate" title={concerns}>{concerns || '-'}</td>
                      <td className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {totalKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-650 dark:text-emerald-405">
                        {totalTon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-center p-1 space-x-1.5 select-none">
                        <button
                          onClick={() => handleView(demand)}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded transition"
                        >
                          📄 View PDF
                        </button>
                        <button
                          onClick={() => setEditTarget(demand)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-750 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-750 rounded transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(demand.id, demand.prNo)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Edit password confirmation popup */}
        <PasswordPromptModal
          isOpen={editTarget !== null}
          title={editTarget ? `Edit Yarn Demand PR: ${editTarget.prNo}` : ''}
          onClose={() => setEditTarget(null)}
          onSubmit={async () => {
            const target = editTarget;
            setEditTarget(null);
            onEditDemand(target);
          }}
        />

        {/* Delete password confirmation popup */}
        <PasswordPromptModal
          isOpen={deleteTarget !== null}
          title={deleteTarget ? `Delete Yarn Demand PR: ${deleteTarget.prNo}` : ''}
          onClose={() => setDeleteTarget(null)}
          onSubmit={executeDelete}
        />
      </div>
    </PageLayout>
  );
};

export default AllYarnDemands;
