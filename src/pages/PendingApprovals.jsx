import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { planningStorage } from '../services/planningStorage';
import { PlanningSheetPreview } from '../components/planning/PlanningSheetPreview';
import { authStorage } from '../auth/storage';
import { useAuth } from '../context/AuthContext';

export const PendingApprovals = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [searchFilter, setSearchFilter] = useState('');
  const [reviewSheet, setReviewSheet] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { session } = useAuth();
  const currentUser = session?.username || 'ADMIN';
  const isApprover = session?.canApprovePlans || currentUser.toUpperCase() === 'ADMIN';

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    setLoading(true);
    try {
      const data = await planningStorage.getAllSheets();
      setSheets(data);
      if (setStatus) {
        const pendingCount = data.filter(s => s.approvalStatus === 'Pending').length;
        setStatus({ 
          text: `Retrieved ${data.length} sizing plans. ${pendingCount} plan(s) currently awaiting approval.`, 
          type: pendingCount > 0 ? 'W' : 'S' 
        });
      }
    } catch (e) {
      console.error(e);
      if (setStatus) setStatus({ text: `Failed to load sizing plans: ${e.message}`, type: 'E' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sheet) => {
    if (!sheet) return;
    if (!window.confirm(`Are you sure you want to AUTHORIZE and APPROVE Sizing Plan Set #${sheet.setNo}? This will unlock the Print / Save PDF document.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await planningStorage.approveSheet(sheet.id, currentUser);
      if (setStatus) setStatus({ text: `Sizing Plan Set #${sheet.setNo} APPROVED successfully by ${currentUser}.`, type: 'S' });
      alert(`Sizing Plan Set #${sheet.setNo} has been authorized & approved. Print/PDF is now unlocked.`);
      if (reviewSheet?.id === sheet.id) {
        setReviewSheet(null);
      }
      setSelectedRowIds(prev => prev.filter(id => id !== sheet.id));
      await loadSheets();
    } catch (e) {
      console.error(e);
      alert(`Approval failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    const selectedPending = sheets.filter(
      s => selectedRowIds.includes(s.id) && s.approvalStatus === 'Pending'
    );

    if (selectedPending.length === 0) {
      alert('Please select at least one pending sizing plan from the table using the checkboxes.');
      return;
    }

    const count = selectedPending.length;
    const sampleSets = selectedPending.map(s => `#${s.setNo}`).slice(0, 4).join(', ') + (count > 4 ? ` and ${count - 4} more` : '');

    if (!window.confirm(`Are you sure you want to AUTHORIZE and BULK APPROVE ${count} Sizing Plan(s) (${sampleSets})?\n\nThis will instantly unlock Print & PDF documents for all selected plans.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const ids = selectedPending.map(s => s.id);
      const approvedCount = await planningStorage.bulkApproveSheets(ids, currentUser);
      if (setStatus) setStatus({ text: `Bulk authorized ${approvedCount} sizing plans successfully by ${currentUser}.`, type: 'S' });
      alert(`Successfully authorized & bulk approved ${approvedCount} sizing plan(s)!\nPrint & PDF copies are now released.`);
      setSelectedRowIds([]);
      await loadSheets();
    } catch (e) {
      console.error(e);
      alert(`Bulk approval failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAllPending = async () => {
    const allPending = sheets.filter(s => s.approvalStatus === 'Pending');
    if (allPending.length === 0) {
      alert('There are no sizing plans currently awaiting approval.');
      return;
    }

    if (!window.confirm(`⚡ APPROVE ALL PENDING:\n\nAre you sure you want to AUTHORIZE and APPROVE ALL ${allPending.length} pending Sizing Plan(s)?\n\nThis will release official Print/PDF copies for every pending plan.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const ids = allPending.map(s => s.id);
      const approvedCount = await planningStorage.bulkApproveSheets(ids, currentUser);
      if (setStatus) setStatus({ text: `All ${approvedCount} pending sizing plans authorized by ${currentUser}.`, type: 'S' });
      alert(`Successfully authorized and approved all ${approvedCount} pending sizing plan(s)!`);
      setSelectedRowIds([]);
      await loadSheets();
    } catch (e) {
      console.error(e);
      alert(`Approve all failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;

    setActionLoading(true);
    try {
      await planningStorage.rejectSheet(rejectTarget.id, currentUser, rejectionReason.trim());
      if (setStatus) setStatus({ text: `Sizing Plan Set #${rejectTarget.setNo} was REJECTED by ${currentUser}.`, type: 'E' });
      alert(`Sizing Plan Set #${rejectTarget.setNo} has been marked as Rejected.`);
      setRejectTarget(null);
      setRejectionReason('');
      if (reviewSheet?.id === rejectTarget.id) {
        setReviewSheet(null);
      }
      setSelectedRowIds(prev => prev.filter(id => id !== rejectTarget.id));
      await loadSheets();
    } catch (e) {
      console.error(e);
      alert(`Rejection failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const counts = useMemo(() => {
    const pending = sheets.filter(s => s.approvalStatus === 'Pending').length;
    const approved = sheets.filter(s => s.approvalStatus === 'Approved').length;
    const rejected = sheets.filter(s => s.approvalStatus === 'Rejected').length;
    return { pending, approved, rejected, total: sheets.length };
  }, [sheets]);

  const filteredSheets = useMemo(() => {
    return sheets.filter(sheet => {
      // Tab filter
      if (activeTab === 'pending' && sheet.approvalStatus !== 'Pending') return false;
      if (activeTab === 'approved' && sheet.approvalStatus !== 'Approved') return false;

      // Text search
      if (!searchFilter.trim()) return true;
      const term = searchFilter.toLowerCase();
      return (
        String(sheet.setNo || '').toLowerCase().includes(term) ||
        String(sheet.buyer || '').toLowerCase().includes(term) ||
        String(sheet.styleCode || '').toLowerCase().includes(term) ||
        String(sheet.orderRef || '').toLowerCase().includes(term) ||
        String(sheet.submittedBy || '').toLowerCase().includes(term) ||
        String(sheet.approvedBy || '').toLowerCase().includes(term)
      );
    });
  }, [sheets, activeTab, searchFilter]);

  const visiblePendingSheets = useMemo(() => {
    return filteredSheets.filter(s => s.approvalStatus === 'Pending');
  }, [filteredSheets]);

  const selectedPendingCount = useMemo(() => {
    return sheets.filter(s => selectedRowIds.includes(s.id) && s.approvalStatus === 'Pending').length;
  }, [sheets, selectedRowIds]);

  const isAllSelected = useMemo(() => {
    if (visiblePendingSheets.length === 0) return false;
    return visiblePendingSheets.every(s => selectedRowIds.includes(s.id));
  }, [visiblePendingSheets, selectedRowIds]);

  const handleSelectAll = () => {
    const pendingIds = visiblePendingSheets.map(s => s.id);
    if (pendingIds.length === 0) return;

    if (isAllSelected) {
      // Deselect visible pending
      setSelectedRowIds(prev => prev.filter(id => !pendingIds.includes(id)));
    } else {
      // Select all visible pending
      setSelectedRowIds(prev => Array.from(new Set([...prev, ...pendingIds])));
    }
  };

  const handleToggleSelect = (sheetId) => {
    setSelectedRowId(sheetId);
    setSelectedRowIds(prev => 
      prev.includes(sheetId) ? prev.filter(id => id !== sheetId) : [...prev, sheetId]
    );
  };

  const selectedSheet = useMemo(() => {
    if (selectedRowId) {
      const found = sheets.find(s => s.id === selectedRowId);
      if (found) return found;
    }
    if (selectedRowIds.length > 0) {
      return sheets.find(s => s.id === selectedRowIds[0]) || null;
    }
    return null;
  }, [sheets, selectedRowId, selectedRowIds]);

  return (
    <PageLayout
      currentPage={currentPage}
      onNavigate={onNavigate}
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Module Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Pending Approvals - Sizing Plans
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and authorize submitted production sizing sheets. Print and PDF copies are released upon approval.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isApprover && (
              <div className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1 rounded border border-amber-300 dark:border-amber-800 font-medium">
                ⚠️ Read-Only: Only authorized approvers can grant final plan approval.
              </div>
            )}
            <button 
              onClick={loadSheets} 
              className="sap-btn sap-btn-secondary"
              disabled={loading || actionLoading}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Tab Selection & Metric Counts */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>⏳ Pending Authorization</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                counts.pending > 0 
                  ? 'bg-amber-500 text-slate-950 font-bold' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'approved'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>✓ Approved History</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                {counts.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>All Plans</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                {counts.total}
              </span>
            </button>
          </div>

          {/* Quick Filter Search */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search Set, Buyer, Style, Ref..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* ALV Action Bar with Bulk Approval Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (selectedSheet) setReviewSheet(selectedSheet);
                else alert('Please select a sizing plan from the grid first.');
              }}
              disabled={!selectedSheet}
              className="sap-btn"
            >
              👓 Inspect & Review Specs
            </button>

            {isApprover && (
              <>
                {/* Bulk Approve Checked Plans */}
                <button
                  onClick={handleBulkApprove}
                  disabled={actionLoading || selectedPendingCount === 0}
                  className="sap-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  title="Authorize all currently checked pending sizing plans"
                >
                  <span>⚡ Bulk Approve ({selectedPendingCount})</span>
                </button>

                {/* Quick 1-Click Approve All Pending Plans */}
                {counts.pending > 0 && (
                  <button
                    onClick={handleApproveAllPending}
                    disabled={actionLoading}
                    className="sap-btn bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    title="Authorize and approve all pending plans in the system at once"
                  >
                    <span>⚡ Approve All Pending ({counts.pending})</span>
                  </button>
                )}

                {/* Single Approve (when only 1 row is focused) */}
                {selectedSheet && selectedSheet.approvalStatus === 'Pending' && selectedPendingCount <= 1 && (
                  <button
                    onClick={() => handleApprove(selectedSheet)}
                    disabled={actionLoading}
                    className="sap-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                  >
                    ✅ Approve Selected
                  </button>
                )}

                <button
                  onClick={() => {
                    if (selectedSheet) {
                      setRejectTarget(selectedSheet);
                      setRejectionReason('');
                    } else {
                      alert('Please select a sizing plan from the grid first.');
                    }
                  }}
                  disabled={!selectedSheet || actionLoading || selectedSheet?.approvalStatus === 'Rejected'}
                  className="sap-btn bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
                >
                  ❌ Reject Selected
                </button>
              </>
            )}

            {selectedSheet?.approvalStatus === 'Approved' && (
              <button
                onClick={() => {
                  setReviewSheet(selectedSheet);
                  setTimeout(() => window.print(), 300);
                }}
                className="sap-btn sap-btn-secondary"
              >
                🖨 Print / PDF
              </button>
            )}
          </div>

          {/* Selection Status Badge */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
            <span>
              Selected: <strong className="text-slate-900 dark:text-slate-100">{selectedRowIds.length}</strong>
              {selectedPendingCount > 0 && (
                <span className="ml-1 text-amber-600 dark:text-amber-400 font-semibold">
                  ({selectedPendingCount} pending)
                </span>
              )}
            </span>
            {selectedRowIds.length > 0 && (
              <button
                onClick={() => setSelectedRowIds([])}
                className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-sans"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ALV Grid Table with Checkboxes */}
        <div className="border border-slate-200 dark:border-slate-800 rounded overflow-x-auto shadow-sm bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs border-collapse font-sans sap-alv-table">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <th className="w-10 text-center border-r border-slate-200 dark:border-slate-800 p-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={visiblePendingSheets.length === 0}
                    title={isAllSelected ? "Deselect All Visible" : "Select All Visible Pending"}
                    className="w-3.5 h-3.5 cursor-pointer rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800">Set No</th>
                <th className="border-r border-slate-200 dark:border-slate-800">Date</th>
                <th className="border-r border-slate-200 dark:border-slate-800">Buyer</th>
                <th className="border-r border-slate-200 dark:border-slate-800">Style / Code</th>
                <th className="border-r border-slate-200 dark:border-slate-800">Order Ref</th>
                <th className="border-r border-slate-200 dark:border-slate-800 text-right">Set Length (Yds)</th>
                <th className="border-r border-slate-200 dark:border-slate-800">Created By</th>
                <th className="border-r border-slate-200 dark:border-slate-800 text-center">Approval Status</th>
                <th className="border-r border-slate-200 dark:border-slate-800">Authorizer / Date</th>
                <th className="text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-400 italic">
                    Loading sizing plan records...
                  </td>
                </tr>
              ) : filteredSheets.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-400 italic">
                    {activeTab === 'pending' 
                      ? 'No sizing plans currently awaiting approval. All plans are clear!' 
                      : 'No matching sizing plans found.'}
                  </td>
                </tr>
              ) : (
                filteredSheets.map((sheet) => {
                  const isChecked = selectedRowIds.includes(sheet.id);
                  const isFocused = selectedRowId === sheet.id;
                  const isPending = sheet.approvalStatus === 'Pending';
                  const isApproved = sheet.approvalStatus === 'Approved';
                  const isRejected = sheet.approvalStatus === 'Rejected';

                  return (
                    <tr
                      key={sheet.id}
                      onClick={() => {
                        setSelectedRowId(sheet.id);
                      }}
                      className={`cursor-pointer border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 ${
                        isChecked 
                          ? 'bg-amber-50/50 dark:bg-amber-950/20' 
                          : isFocused 
                          ? 'bg-slate-100/70 dark:bg-slate-800/60' 
                          : ''
                      }`}
                    >
                      <td 
                        className="text-center border-r border-slate-200 dark:border-slate-800 p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(sheet.id)}
                          className="w-3.5 h-3.5 cursor-pointer rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="font-mono font-bold text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-800 p-2">
                        #{sheet.setNo}
                      </td>
                      <td className="font-mono border-r border-slate-200 dark:border-slate-800 p-2">
                        {sheet.date || '—'}
                      </td>
                      <td className="font-bold border-r border-slate-200 dark:border-slate-800 p-2">
                        {sheet.buyer || '—'}
                      </td>
                      <td className="font-mono border-r border-slate-200 dark:border-slate-800 p-2">
                        {sheet.styleCode || '—'}
                      </td>
                      <td className="font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 p-2">
                        {sheet.orderRef || '—'}
                      </td>
                      <td className="font-mono text-right font-bold border-r border-slate-200 dark:border-slate-800 p-2">
                        {sheet.setLength ? Number(sheet.setLength).toLocaleString() : '—'}
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 p-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {sheet.submittedBy || 'ASIF'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {sheet.submittedAt ? new Date(sheet.submittedAt).toLocaleDateString() : ''}
                        </span>
                      </td>
                      <td className="text-center border-r border-slate-200 dark:border-slate-800 p-2">
                        {isPending && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            ⏳ Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            ✓ Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            ✕ Rejected
                          </span>
                        )}
                      </td>
                      <td className="border-r border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {sheet.approvedBy ? (
                          <>
                            <div className="font-bold text-emerald-700 dark:text-emerald-400">{sheet.approvedBy}</div>
                            <div className="text-[10px] text-slate-400">
                              {sheet.approvedAt ? new Date(sheet.approvedAt).toLocaleDateString() : ''}
                            </div>
                          </>
                        ) : isRejected ? (
                          <div className="text-rose-600 dark:text-rose-400 italic text-[11px]">
                            {sheet.rejectionReason || 'Rejected'}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting action</span>
                        )}
                      </td>
                      <td className="p-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewSheet(sheet);
                            }}
                            className="px-2 py-0.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded"
                            title="Inspect specifications"
                          >
                            Inspect
                          </button>
                          {isApprover && isPending && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(sheet);
                              }}
                              className="px-2 py-0.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded"
                              title="Authorize plan"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Full Plan Review & Inspection */}
        {reviewSheet && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-5xl w-full mx-auto my-auto shadow-2xl p-4 space-y-4">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Sizing Plan Review — Set #{reviewSheet.setNo}
                  </span>
                  {reviewSheet.approvalStatus === 'Pending' && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ⏳ Pending Approval (Print Locked)
                    </span>
                  )}
                  {reviewSheet.approvalStatus === 'Approved' && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Authorized & Approved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {reviewSheet.approvalStatus === 'Approved' ? (
                    <button
                      onClick={() => window.print()}
                      className="sap-btn sap-btn-secondary flex items-center gap-1"
                    >
                      <span>🖨</span>
                      <span>Print / Save PDF</span>
                    </button>
                  ) : (
                    isApprover && (
                      <button
                        onClick={() => handleApprove(reviewSheet)}
                        disabled={actionLoading}
                        className="sap-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        ✓ Grant Final Approval
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setReviewSheet(null)}
                    className="sap-btn sap-btn-secondary"
                  >
                    Close (Esc)
                  </button>
                </div>
              </div>

              {/* Printable Sizing Sheet Document */}
              <div className="max-h-[75vh] overflow-y-auto p-2 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                <PlanningSheetPreview data={reviewSheet} />
              </div>
            </div>
          </div>
        )}

        {/* Modal: Rejection Reason Dialog */}
        {rejectTarget && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleRejectConfirm} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-4 space-y-4 shadow-2xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Reject Sizing Plan Set #{rejectTarget.setNo}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Please provide a reason or modification note for the planner.
                </p>
              </div>

              <div>
                <label className="sap-label mb-1">Rejection Remarks</label>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Beam length calculation mismatch, please recalculate."
                  className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="sap-btn sap-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="sap-btn bg-rose-600 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PendingApprovals;
