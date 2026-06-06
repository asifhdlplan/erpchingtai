import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { PlanningSheetPreview } from '../components/planning/PlanningSheetPreview';
import { planningStorage, PLANNING_STORAGE_KEY } from '../services/planningStorage';
import { SearchBar } from '../components/ui/FormInputs';

const AllPlanningSheets = ({ currentPage, onNavigate, onAdminClick }) => {
  const [sheets, setSheets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    const data = await planningStorage.getAllSheets();
    setSheets(data);
    setFilteredSheets(data);
  };

  const handleSearch = () => {
    const filtered = sheets.filter(s => s.setNo?.toString().includes(searchQuery));
    setFilteredSheets(filtered);
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilteredSheets(sheets);
  };

  const handleDelete = async (id) => {
    const password = window.prompt('Please enter the delete confirmation password:');
    if (password === null) return; // cancelled
    if (password !== '0707') {
      alert('Invalid password! Deletion cancelled.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this planning sheet? This action cannot be undone.')) {
      try {
        await planningStorage.deletePlanningSheet(id);
        await loadSheets();
        if (selectedSheet?.id === id) {
          setSelectedSheet(null);
          setIsPreviewMode(false);
        }
      } catch (e) {
        alert('Failed to delete planning sheet.');
      }
    }
  };

  const handleView = (sheet) => {
    setSelectedSheet(sheet);
    setIsPreviewMode(true);
  };

  const handlePrint = (sheet) => {
    setSelectedSheet(sheet);
    setIsPreviewMode(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <PageLayout currentPage={currentPage} onNavigate={onNavigate} onAdminClick={onAdminClick}>
      <header className="sap-header border-b border-slate-200 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Planning <span className="text-blue-600">Archive</span></h1>
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">All Generated Planning Sheets</p>
        </div>
        {isPreviewMode && (
          <button 
            onClick={() => setIsPreviewMode(false)}
            className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-xs transition-all"
          >
            BACK TO LIST
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isPreviewMode ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search Section */}
            <section className="sap-panel p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search Planning Sheet</h2>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 max-w-xs">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase mb-1.5 block">Set No</label>
                  <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Enter Set No (e.g. 10001)..." />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition-all"
                >
                  SEARCH
                </button>
                <button 
                  onClick={handleClear}
                  className="px-5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded shadow-xs transition-all"
                >
                  CLEAR
                </button>
              </div>
            </section>

            {/* Results Section */}
            <section className="sap-panel overflow-hidden p-5 animate-in slide-in-from-bottom-4 duration-700">
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3 border-r border-slate-200">Set No</th>
                      <th className="p-3 border-r border-slate-200">Buyer</th>
                      <th className="p-3 border-r border-slate-200">Style/Code</th>
                      <th className="p-3 border-r border-slate-200">Date</th>
                      <th className="p-3 border-r border-slate-200">Order Ref</th>
                      <th className="p-3 border-r border-slate-200">Weave</th>
                      <th className="p-3 border-r border-slate-200">Colour</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-700">
                    {filteredSheets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-400 italic">
                          No Planning Sheets found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredSheets.map(sheet => (
                        <tr key={sheet.id} className="hover:bg-slate-50/70 border-b border-slate-200 last:border-b-0 transition-colors">
                          <td className="p-3 border-r border-slate-200 font-bold text-blue-600">{sheet.setNo}</td>
                          <td className="p-3 border-r border-slate-200 font-medium text-slate-900">{sheet.buyer}</td>
                          <td className="p-3 border-r border-slate-200">{sheet.styleCode}</td>
                          <td className="p-3 border-r border-slate-200">{sheet.date}</td>
                          <td className="p-3 border-r border-slate-200">{sheet.orderRef}</td>
                          <td className="p-3 border-r border-slate-200">{sheet.weave}</td>
                          <td className="p-3 border-r border-slate-200">{sheet.colour}</td>
                          <td className="p-3">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleView(sheet)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                title="View"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => handlePrint(sheet)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-all"
                                title="Print/PDF"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleDelete(sheet.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
            <div className="flex gap-4">
              <button 
                onClick={() => window.print()} 
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-md flex items-center gap-1.5 transition-all"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PRINT / SAVE AS PDF
              </button>
            </div>
            <PlanningSheetPreview data={selectedSheet} />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AllPlanningSheets;
