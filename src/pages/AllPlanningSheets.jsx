import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { PlanningSheetPreview } from '../components/planning/PlanningSheetPreview';
import { planningStorage, PLANNING_STORAGE_KEY } from '../services/planningStorage';
import { SearchBar } from '../components/ui/FormInputs';

const AllPlanningSheets = () => {
  const [sheets, setSheets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = () => {
    const data = planningStorage.getAllSheets();
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this planning sheet? This action cannot be undone.')) {
      const updatedSheets = sheets.filter(s => s.id !== id);
      localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(updatedSheets));
      loadSheets();
      if (selectedSheet?.id === id) {
        setSelectedSheet(null);
        setIsPreviewMode(false);
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
    <PageLayout>
      <header className="bg-white border-b p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Planning <span className="text-blue-600">Archive</span></h1>
          <p className="text-xs font-medium text-slate-500">All Generated Planning Sheets</p>
        </div>
        {isPreviewMode && (
          <button 
            onClick={() => setIsPreviewMode(false)}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200 transition-all"
          >
            BACK TO LIST
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {!isPreviewMode ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Search Planning Sheet</h2>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 max-w-xs">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Set No</label>
                  <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Enter Set No (e.g. 10001)..." />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all shadow-md"
                >
                  SEARCH
                </button>
                <button 
                  onClick={handleClear}
                  className="px-6 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200 transition-all"
                >
                  CLEAR
                </button>
              </div>
            </section>

            {/* Results Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 border-b">Set No</th>
                      <th className="p-4 border-b">Buyer</th>
                      <th className="p-4 border-b">Style/Code</th>
                      <th className="p-4 border-b">Date</th>
                      <th className="p-4 border-b">Order Ref</th>
                      <th className="p-4 border-b">Weave</th>
                      <th className="p-4 border-b">Colour</th>
                      <th className="p-4 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredSheets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-12 text-center text-slate-400 italic">
                          No Planning Sheets found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredSheets.map(sheet => (
                        <tr key={sheet.id} className="hover:bg-blue-50 transition-colors border-b last:border-b-0">
                          <td className="p-4 font-bold text-blue-600">{sheet.setNo}</td>
                          <td className="p-4 text-slate-700">{sheet.buyer}</td>
                          <td className="p-4 text-slate-600">{sheet.styleCode}</td>
                          <td className="p-4 text-slate-600">{sheet.date}</td>
                          <td className="p-4 text-slate-600">{sheet.orderRef}</td>
                          <td className="p-4 text-slate-600">{sheet.weave}</td>
                          <td className="p-4 text-slate-600">{sheet.colour}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleView(sheet)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-all"
                                title="View"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button 
                                onClick={() => handlePrint(sheet)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded transition-all"
                                title="Print/PDF"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(sheet.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-all"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tr>
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
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
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
