import React, { useRef, useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { OrderSearch } from '../components/planning/OrderSearch';
import { PlanningSheetPreview } from '../components/planning/PlanningSheetPreview';
import { planningStorage } from '../services/planningStorage';
import { usePlanningCalculations } from '../hooks/usePlanningCalculations';
import { FormInput } from '../components/ui/FormInputs';

const PlanningSheetCreation = ({ currentPage, onNavigate }) => {
  const { calculateWarpingQty, calculateWeavingQty } = usePlanningCalculations();
  const entryAreaRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    setNo: '',
    date: new Date().toISOString().split('T')[0],
    buyer: '',
    styleCode: '',
    endBuyer: '',
    mktPerson: '',
    remarks: '',
    setLength: '',
    orderRef: '',
    piWidth: '',
    piShrink: '',
    weave: '',
    colour: '',
    orderQnty: '',
    reqProd: '',
    pDyeing: '',
    remain1: '',
    todayTaken: '',
    remain2: '',
  });

  const [warpingRows, setWarpingRows] = useState([{}]);
  const [sizingData, setSizingData] = useState({ beamSpace: '', beamType: '', noOfBeam: '', beamLength: '' });
  const [weavingRows, setWeavingRows] = useState([{}]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, setNo: planningStorage.getNextSetNo() }));
  }, []);

  const handleOrderSelect = (order) => {
    const firstItem = order.items?.[0] || {};
    setSelectedOrder(order);
    setFormData(prev => ({
      ...prev,
      buyer: order.buyer || '',
      styleCode: firstItem.styleNo || order.styleCode || '',
      endBuyer: order.customer || '',
      mktPerson: order.mktPerson || '',
      orderRef: order.orderRef || '',
      piWidth: firstItem.piWidth || order.piWidth || '',
      piShrink: firstItem.piShrink || order.piShrink || '',
      weave: firstItem.weav || order.weave || '',
      orderQnty: firstItem.qnty || order.qnty || '',
    }));
  };

  const updateWarpingRow = (idx, field, val) => {
    const newRows = [...warpingRows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    
    // Auto calcs
    const setLength = parseFloat(formData.setLength) || 0;
    newRows[idx].perSet = setLength ? setLength.toFixed(2) : '0.00';
    
    const beam = parseFloat(newRows[idx].beam) || 0;
    const endsBeam = parseFloat(newRows[idx].endsBeam) || 0;
    const totalEnds = beam * endsBeam;
    newRows[idx].totalEnds = totalEnds;
    newRows[idx].qtyKg = calculateWarpingQty(setLength, totalEnds).toFixed(3);
    
    setWarpingRows(newRows);
  };

  const updateWeavingRow = (idx, field, val) => {
    const newRows = [...weavingRows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    
    const setLength = parseFloat(formData.setLength) || 0;
    const pickLength = parseFloat(newRows[idx].pickLength) || 0;
    const ppi = parseFloat(newRows[idx].ppi) || 0;
    newRows[idx].qtyKg = calculateWeavingQty(setLength, pickLength, ppi).toFixed(3);
    
    setWeavingRows(newRows);
  };

  const handleSizingChange = (field, val) => {
    const setLength = parseFloat(formData.setLength) || 0;
    const noOfBeam = field === 'noOfBeam' ? parseFloat(val) : parseFloat(sizingData.noOfBeam);
    setSizingData(prev => ({
      ...prev,
      [field]: val,
      beamLength: noOfBeam ? (setLength / noOfBeam).toFixed(2) : ''
    }));
  };

  const handleCreatePlanningSheet = () => {
    const finalData = {
      ...formData,
      warpingRows,
      sizing: sizingData,
      weavingRows,
      orderId: selectedOrder?.id,
    };
    planningStorage.savePlanningSheet(finalData);
    setShowPreview(true);
    alert('Planning Sheet Created Successfully!');
  };

  const focusByOffset = (currentEl, offset) => {
    const root = entryAreaRef.current;
    if (!root) return;
    const fields = Array.from(
      root.querySelectorAll('input, select, textarea, button')
    ).filter((el) => !el.disabled && !el.readOnly && el.type !== 'hidden' && el.tabIndex !== -1);
    const idx = fields.indexOf(currentEl);
    if (idx < 0) return;
    const nextIdx = idx + offset;
    if (nextIdx >= 0 && nextIdx < fields.length) {
      fields[nextIdx].focus();
      if (fields[nextIdx].select) fields[nextIdx].select();
    }
  };

  const handleEntryKeyDown = (e) => {
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
    if (e.key === 'Enter' && tag !== 'TEXTAREA' && !showPreview && selectedOrder) {
      e.preventDefault();
      handleCreatePlanningSheet();
    }
  };

  return (
    <PageLayout currentPage={currentPage} onNavigate={onNavigate}>
      <header className="sap-header border-b border-[#9fb3cc] p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-[#1f3c5e]">Ha-Meem Ching Tai <span className="text-blue-700">Planning</span></h1>
          <p className="text-[11px] font-bold text-[#3a5f86]">Planning Sheet Creation Module</p>
        </div>
        <div className="flex gap-3">
          {showPreview && (
            <button 
              onClick={() => setShowPreview(false)} 
              className="sap-btn px-4 py-2 text-xs"
            >
              BACK TO EDIT
            </button>
          )}
          {!showPreview && (
            <button 
              onClick={handleCreatePlanningSheet}
              className="px-6 py-2 bg-[#0b4f8a] text-white text-xs font-bold border border-[#0a3d6a] rounded-sm"
            >
              CREATE PLANNING SHEET
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-[#e7edf5] space-y-6">
        {!showPreview ? (
          <>
            <OrderSearch onOrderSelect={handleOrderSelect} />
            
            {!selectedOrder && (
              <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 italic">
                Please select an order from the search above to start planning.
              </div>
            )}

            {selectedOrder && (
              <div
                ref={entryAreaRef}
                onKeyDown={handleEntryKeyDown}
                className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <section className="sap-panel p-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase">Header Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput label="Set No" value={formData.setNo} className="opacity-70" readOnly />
                    <FormInput label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    <FormInput label="Buyer" value={formData.buyer} onChange={e => setFormData({...formData, buyer: e.target.value})} />
                    <FormInput label="Style/Code" value={formData.styleCode} onChange={e => setFormData({...formData, styleCode: e.target.value})} />
                    <FormInput label="End Buyer" value={formData.endBuyer} onChange={e => setFormData({...formData, endBuyer: e.target.value})} />
                    <FormInput label="MKT Person" value={formData.mktPerson} onChange={e => setFormData({...formData, mktPerson: e.target.value})} />
                    <FormInput label="Order Ref" value={formData.orderRef} onChange={e => setFormData({...formData, orderRef: e.target.value})} />
                    <FormInput label="Set Length(m)" value={formData.setLength} onChange={e => setFormData({...formData, setLength: e.target.value})} />
                    <FormInput label="PI-Width" value={formData.piWidth} onChange={e => setFormData({...formData, piWidth: e.target.value})} />
                    <FormInput label="PI-Shrink" value={formData.piShrink} onChange={e => setFormData({...formData, piShrink: e.target.value})} />
                    <FormInput label="Weave" value={formData.weave} onChange={e => setFormData({...formData, weave: e.target.value})} />
                    <FormInput label="Colour" value={formData.colour} onChange={e => setFormData({...formData, colour: e.target.value})} />
                    <FormInput label="Order Qnty" value={formData.orderQnty} onChange={e => setFormData({...formData, orderQnty: e.target.value})} />
                    <FormInput label="Req Prod(m)" value={formData.reqProd} onChange={e => setFormData({...formData, reqProd: e.target.value})} />
                    <FormInput label="P. Dyeing" value={formData.pDyeing} onChange={e => setFormData({...formData, pDyeing: e.target.value})} />
                    <FormInput label="Remain 1" value={formData.remain1} onChange={e => setFormData({...formData, remain1: e.target.value})} />
                    <FormInput label="Today Taken" value={formData.todayTaken} onChange={e => setFormData({...formData, todayTaken: e.target.value})} />
                    <FormInput label="Remain 2" value={formData.remain2} onChange={e => setFormData({...formData, remain2: e.target.value})} />
                    <div className="col-span-2">
                      <FormInput label="Remarks" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                    </div>
                  </div>
                </section>

                <section className="sap-panel p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      <h2 className="text-sm font-bold text-slate-700 uppercase">01. Warping Information</h2>
                    </div>
                    <button onClick={() => setWarpingRows([...warpingRows, {}])} className="sap-btn text-xs px-2 py-1">+ ADD ROW</button>
                  </div>
                  <div className="overflow-x-auto space-y-3">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                          <th className="border p-2">Set Length</th>
                          <th className="border p-2">Per Set</th>
                          <th className="border p-2">Ratio</th>
                          <th className="border p-2">Yarn Name</th>
                          <th className="border p-2">Supp.</th>
                          <th className="border p-2">Yarn Lot</th>
                          <th className="border p-2">Beam</th>
                          <th className="border p-2">Ends/Beam</th>
                          <th className="border p-2">Total Ends</th>
                          <th className="border p-2">Qty-Kg</th>
                          <th className="border p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warpingRows.map((row, i) => (
                          <tr key={i}>
                            <td className="border p-1 bg-slate-50 text-center">{formData.setLength || '0'}</td>
                            <td className="border p-1 bg-slate-50 text-center">{row.perSet || '0'}</td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.ratio || ''} onChange={e => updateWarpingRow(i, 'ratio', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.yarnName || ''} onChange={e => updateWarpingRow(i, 'yarnName', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.supp || ''} onChange={e => updateWarpingRow(i, 'supp', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.yarnLot || ''} onChange={e => updateWarpingRow(i, 'yarnLot', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.beam || ''} onChange={e => updateWarpingRow(i, 'beam', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.endsBeam || ''} onChange={e => updateWarpingRow(i, 'endsBeam', e.target.value)} /></td>
                            <td className="border p-1 bg-slate-50 text-center font-bold">{row.totalEnds || '0'}</td>
                            <td className="border p-1 bg-slate-50 text-center font-bold">{row.qtyKg || '0'}</td>
                            <td className="border p-1 text-center"><button onClick={() => setWarpingRows(warpingRows.filter((_, idx) => idx !== i))} className="text-red-500">×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="sap-panel p-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase">02. Sizing Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput label="Beam Space (inch)" value={sizingData.beamSpace} onChange={e => handleSizingChange('beamSpace', e.target.value)} />
                    <FormInput label="Beam Type" value={sizingData.beamType} onChange={e => handleSizingChange('beamType', e.target.value)} />
                    <FormInput label="No of Beam" value={sizingData.noOfBeam} onChange={e => handleSizingChange('noOfBeam', e.target.value)} />
                    <FormInput label="Beam Length (m)" value={sizingData.beamLength} readOnly className="bg-slate-50 font-bold" />
                  </div>
                </section>

                <section className="sap-panel p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      <h2 className="text-sm font-bold text-slate-700 uppercase">03. Weaving Information</h2>
                    </div>
                    <button onClick={() => setWeavingRows([...weavingRows, {}])} className="sap-btn text-xs px-2 py-1">+ ADD ROW</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                          <th className="border p-2">Grey Construction</th>
                          <th className="border p-2">Weave</th>
                          <th className="border p-2">Weft Ratio</th>
                          <th className="border p-2">Reed Space</th>
                          <th className="border p-2">Reed</th>
                          <th className="border p-2">Ends/Dent</th>
                          <th className="border p-2">G.Width</th>
                          <th className="border p-2">Weight</th>
                          <th className="border p-2">Selvedge</th>
                          <th className="border p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weavingRows.map((row, i) => (
                          <tr key={i}>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.greyConstruction || ''} onChange={e => updateWeavingRow(i, 'greyConstruction', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.weave || ''} onChange={e => updateWeavingRow(i, 'weave', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.weftRatio || ''} onChange={e => updateWeavingRow(i, 'weftRatio', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.reedSpace || ''} onChange={e => updateWeavingRow(i, 'reedSpace', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.reed || ''} onChange={e => updateWeavingRow(i, 'reed', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.endsDent || ''} onChange={e => updateWeavingRow(i, 'endsDent', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.gWidth || ''} onChange={e => updateWeavingRow(i, 'gWidth', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.weight || ''} onChange={e => updateWeavingRow(i, 'weight', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.selvedge || ''} onChange={e => updateWeavingRow(i, 'selvedge', e.target.value)} /></td>
                            <td className="border p-1 text-center"><button onClick={() => setWeavingRows(weavingRows.filter((_, idx) => idx !== i))} className="text-red-500">×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                          <th className="border p-2">Yarn Name</th>
                          <th className="border p-2">Supplier</th>
                          <th className="border p-2">Supp-Lot</th>
                          <th className="border p-2">Ratio</th>
                          <th className="border p-2">Qty-Kg</th>
                          <th className="border p-2">Pick Length</th>
                          <th className="border p-2">PPI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weavingRows.map((row, i) => (
                          <tr key={`yarn-${i}`}>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.yarnName || ''} onChange={e => updateWeavingRow(i, 'yarnName', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.supplier || ''} onChange={e => updateWeavingRow(i, 'supplier', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.suppLot || ''} onChange={e => updateWeavingRow(i, 'suppLot', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.ratio || ''} onChange={e => updateWeavingRow(i, 'ratio', e.target.value)} /></td>
                            <td className="border p-1 bg-slate-50 text-center font-bold">{row.qtyKg || '0'}</td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.pickLength || ''} onChange={e => updateWeavingRow(i, 'pickLength', e.target.value)} /></td>
                            <td className="border p-1"><input className="w-full p-1 outline-none" value={row.ppi || ''} onChange={e => updateWeavingRow(i, 'ppi', e.target.value)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H//9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PRINT PLANNING SHEET
              </button>
            </div>
            <PlanningSheetPreview data={{ ...formData, warpingRows, sizing: sizingData, weavingRows }} />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PlanningSheetCreation;
