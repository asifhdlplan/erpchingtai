import React, { useRef, useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { OrderSearch } from '../components/planning/OrderSearch';
import { PlanningSheetPreview } from '../components/planning/PlanningSheetPreview';
import { planningStorage } from '../services/planningStorage';
import { yarnStockStorage } from '../services/yarnStockStorage';
import { usePlanningCalculations } from '../hooks/usePlanningCalculations';
import { useAuth } from '../context/AuthContext';
import { YarnShortageModal } from '../components/ui/YarnShortageModal';

const YarnSelectDropdown = ({ value, yarnStocks, onSelect, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredYarns = yarnStocks.filter(y => {
    const term = search.toLowerCase();
    return (
      (y.materialDescription || '').toLowerCase().includes(term) ||
      (y.supplierName || '').toLowerCase().includes(term) ||
      (y.supplierLot || '').toLowerCase().includes(term)
    );
  });

  return (
    <div ref={wrapperRef} className="w-full h-full relative">
      <div className="flex items-center w-full h-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setSearch(value || '');
            setIsOpen(true);
          }}
          placeholder="Type or select..."
          className="w-full h-[22px] border-0 outline-none px-1 text-xs bg-transparent text-slate-800 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 text-slate-400 hover:text-slate-600 focus:outline-none text-[8px]"
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg z-50 text-xs text-left">
          <div className="p-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 sticky top-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stock..."
              className="w-full px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded text-[10px] bg-white dark:bg-slate-800"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {filteredYarns.length === 0 ? (
            <div className="p-2 text-slate-400 dark:text-slate-500 italic text-center text-[10px]">
              No stock found
            </div>
          ) : (
            filteredYarns.map((yarn) => {
              const stockVal = parseFloat(yarn.unrestrictedStock || 0);
              const isProcure = stockVal <= 0;
              const isLowStock = stockVal < 500;
              return (
                <div
                  key={yarn.id}
                  onClick={() => {
                    onSelect(yarn);
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-50 dark:border-slate-850 flex flex-col gap-0.5"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex justify-between text-[11px] gap-2">
                    <span className="truncate">{yarn.materialDescription}</span>
                    <span className={`shrink-0 font-mono text-[9px] px-1 py-0.2 rounded font-bold ${
                      isProcure 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-955/40 dark:text-rose-450' 
                        : isLowStock 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-450'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-955/40 dark:text-emerald-450'
                    }`}>
                      {isProcure ? 'Procure' : isLowStock ? `Re-stock (${yarn.unrestrictedStock} ${yarn.unit})` : `${yarn.unrestrictedStock} ${yarn.unit}`}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 flex justify-between">
                    <span>Lot: {yarn.supplierLot || 'N/A'}</span>
                    <span>Supplier: {yarn.supplierName || 'N/A'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const PlanningSheetCreation = ({ currentPage, onNavigate, onAdminClick, editingPlan, setEditingPlan, status, setStatus }) => {
  const { calculateWarpingQty, calculateWeavingQty } = usePlanningCalculations();
  const { session } = useAuth();
  const entryAreaRef = useRef(null);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('warping'); // 'warping' | 'sizing' | 'weaving'
  const [yarnStocks, setYarnStocks] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [isShortageModalOpen, setIsShortageModalOpen] = useState(false);

  useEffect(() => {
    const fetchYarnStocks = async () => {
      try {
        const data = await yarnStockStorage.getAllYarnStocks();
        setYarnStocks(data);
      } catch (e) {
        console.error('Failed to fetch yarn stocks:', e);
      }
    };
    fetchYarnStocks();
  }, []);
  
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
  const [weavingFabric, setWeavingFabric] = useState({
    greyConstruction: '',
    weave: '',
    weftRatio: '',
    reedSpace: '',
    reed: '',
    endsDent: '',
    gWidth: '',
    weight: '',
    selvedge: ''
  });

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        setNo: editingPlan.setNo || '',
        date: editingPlan.date || '',
        buyer: editingPlan.buyer || '',
        styleCode: editingPlan.styleCode || '',
        endBuyer: editingPlan.endBuyer || '',
        mktPerson: editingPlan.mktPerson || '',
        remarks: editingPlan.remarks || '',
        setLength: editingPlan.setLength || '',
        orderRef: editingPlan.orderRef || '',
        piWidth: editingPlan.piWidth || '',
        piShrink: editingPlan.piShrink || '',
        weave: editingPlan.weave || '',
        colour: editingPlan.colour || '',
        orderQnty: editingPlan.orderQnty || '',
        reqProd: editingPlan.reqProd || '',
        pDyeing: editingPlan.pDyeing || '',
        remain1: editingPlan.remain1 || '',
        todayTaken: editingPlan.todayTaken || '',
        remain2: editingPlan.remain2 || '',
        id: editingPlan.id
      });
      setWarpingRows(editingPlan.warpingRows || [{}]);
      setSizingData(editingPlan.sizing || { beamSpace: '', beamType: '', noOfBeam: '', beamLength: '' });
      setWeavingRows(editingPlan.weavingRows || [{}]);
      
      const firstWeaving = editingPlan.weavingRows?.[0] || {};
      setWeavingFabric({
        greyConstruction: firstWeaving.greyConstruction || '',
        weave: firstWeaving.weave || '',
        weftRatio: firstWeaving.weftRatio || '',
        reedSpace: firstWeaving.reedSpace || '',
        reed: firstWeaving.reed || '',
        endsDent: firstWeaving.endsDent || '',
        gWidth: firstWeaving.gWidth || '',
        weight: firstWeaving.weight || '',
        selvedge: firstWeaving.selvedge || ''
      });
      
      if (editingPlan.orderId) {
        setSelectedOrder({ id: editingPlan.orderId, orderRef: editingPlan.orderRef });
      }
    } else {
      const fetchSetNo = async () => {
        const nextSetNo = await planningStorage.getNextSetNo();
        setFormData(prev => ({ 
          ...prev, 
          setNo: nextSetNo,
          date: new Date().toISOString().split('T')[0],
          buyer: '', styleCode: '', endBuyer: '', mktPerson: '', remarks: '',
          setLength: '', orderRef: '', piWidth: '', piShrink: '', weave: '',
          colour: '', orderQnty: '', reqProd: '', pDyeing: '', remain1: '',
          todayTaken: '', remain2: '', id: undefined
        }));
      };
      fetchSetNo();
      setWeavingFabric({
        greyConstruction: '',
        weave: '',
        weftRatio: '',
        reedSpace: '',
        reed: '',
        endsDent: '',
        gWidth: '',
        weight: '',
        selvedge: ''
      });
    }
  }, [editingPlan]);

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
    if (setStatus) setStatus({ text: `Linked Order Ref ${order.orderRef} to Plan`, type: 'S' });
  };

  const updateWarpingRow = (idx, field, val) => {
    const newRows = [...warpingRows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    
    const setLength = parseFloat(formData.setLength) || 0;
    newRows[idx].perSet = setLength ? setLength.toFixed(2) : '0.00';
    
    const beam = parseFloat(newRows[idx].beam) || 0;
    const endsBeam = parseFloat(newRows[idx].endsBeam) || 0;
    const totalEnds = beam * endsBeam;
    newRows[idx].totalEnds = totalEnds;
    newRows[idx].qtyKg = calculateWarpingQty(setLength, totalEnds, newRows[idx].ratio, newRows[idx].yarnName).toFixed(3);
    
    setWarpingRows(newRows);
  };

  const updateWarpingRowMultiple = (idx, fieldsObj) => {
    const newRows = [...warpingRows];
    newRows[idx] = { ...newRows[idx], ...fieldsObj };
    
    const setLength = parseFloat(formData.setLength) || 0;
    newRows[idx].perSet = setLength ? setLength.toFixed(2) : '0.00';
    
    const beam = parseFloat(newRows[idx].beam) || 0;
    const endsBeam = parseFloat(newRows[idx].endsBeam) || 0;
    const totalEnds = beam * endsBeam;
    newRows[idx].totalEnds = totalEnds;
    newRows[idx].qtyKg = calculateWarpingQty(setLength, totalEnds, newRows[idx].ratio, newRows[idx].yarnName).toFixed(3);
    
    setWarpingRows(newRows);
  };

  const updateWeavingRow = (idx, field, val) => {
    const newRows = [...weavingRows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    
    const setLength = parseFloat(formData.setLength) || 0;
    const pickLength = parseFloat(newRows[idx].pickLength) || 0;
    const ppi = parseFloat(newRows[idx].ppi) || 0;
    newRows[idx].qtyKg = calculateWeavingQty(setLength, pickLength, ppi, newRows[idx].ratio, newRows[idx].yarnName).toFixed(3);
    
    setWeavingRows(newRows);
  };

  const updateWeavingRowMultiple = (idx, fieldsObj) => {
    const newRows = [...weavingRows];
    newRows[idx] = { ...newRows[idx], ...fieldsObj };
    
    const setLength = parseFloat(formData.setLength) || 0;
    const pickLength = parseFloat(newRows[idx].pickLength) || 0;
    const ppi = parseFloat(newRows[idx].ppi) || 0;
    newRows[idx].qtyKg = calculateWeavingQty(setLength, pickLength, ppi, newRows[idx].ratio, newRows[idx].yarnName).toFixed(3);
    
    setWeavingRows(newRows);
  };

  const handleSetLengthChange = (val) => {
    setFormData(prev => ({ ...prev, setLength: val }));
    const setLength = parseFloat(val) || 0;
    
    // Recalculate all warping rows
    setWarpingRows(prev => prev.map(row => {
      const beam = parseFloat(row.beam) || 0;
      const endsBeam = parseFloat(row.endsBeam) || 0;
      const totalEnds = beam * endsBeam;
      return {
        ...row,
        perSet: setLength ? setLength.toFixed(2) : '0.00',
        totalEnds,
        qtyKg: calculateWarpingQty(setLength, totalEnds, row.ratio, row.yarnName).toFixed(3)
      };
    }));
    
    // Recalculate all weaving rows
    setWeavingRows(prev => prev.map(row => {
      const pickLength = parseFloat(row.pickLength) || 0;
      const ppi = parseFloat(row.ppi) || 0;
      return {
        ...row,
        qtyKg: calculateWeavingQty(setLength, pickLength, ppi, row.ratio, row.yarnName).toFixed(3)
      };
    }));
  };

  const handleFabricChange = (field, val) => {
    setWeavingFabric(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'reedSpace') {
        const rsNum = parseFloat(val);
        if (!isNaN(rsNum)) {
          const newPickLength = (rsNum + 3).toString();
          setWeavingRows(rows => rows.map(row => {
            const setLength = parseFloat(formData.setLength) || 0;
            const ppi = parseFloat(row.ppi) || 0;
            const qtyKg = calculateWeavingQty(setLength, parseFloat(newPickLength), ppi, row.ratio, row.yarnName).toFixed(3);
            return {
              ...row,
              pickLength: newPickLength,
              qtyKg
            };
          }));
        }
      }
      return updated;
    });
  };

  const insertWeavingRow = () => {
    const rsNum = parseFloat(weavingFabric.reedSpace);
    const initialPickLength = !isNaN(rsNum) ? (rsNum + 3).toString() : '';
    setWeavingRows([...weavingRows, { pickLength: initialPickLength, ppi: '', ratio: '', qtyKg: '0' }]);
  };

  const handleSizingChange = (field, val) => {
    setSizingData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleCreatePlanningSheet = async () => {
    if (!formData.setLength) {
      alert('Set Length is required for production calculations.');
      if (setStatus) setStatus({ text: 'Error: Set Length is missing', type: 'E' });
      return;
    }

    const targetWeavingRows = weavingRows.length > 0 ? weavingRows : [{}];
    const mergedWeavingRows = targetWeavingRows.map((row, i) => {
      if (i === 0) {
        return {
          ...row,
          ...weavingFabric
        };
      }
      return row;
    });

    const finalData = {
      ...formData,
      warpingRows,
      sizing: {
        ...sizingData,
        createdBy: editingPlan ? (editingPlan.sizing?.createdBy || session?.username || 'ASIF') : (session?.username || 'ASIF'),
        createdAtTime: editingPlan ? (editingPlan.sizing?.createdAtTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      weavingRows: mergedWeavingRows,
      orderId: selectedOrder?.id,
    };
    try {
      // 1. Fetch current stock levels
      const allStocks = await yarnStockStorage.getAllYarnStocks();

      // 2. Calculate projected returns (if editing)
      const oldReturns = {};
      if (editingPlan) {
        const oldWarping = editingPlan.warpingRows || [];
        const oldWeaving = editingPlan.weavingRows || [];
        
        for (const row of oldWarping) {
          if (row.yarnStockId && row.qtyKg) {
            const qty = parseFloat(row.qtyKg) || 0;
            if (qty > 0) {
              oldReturns[row.yarnStockId] = (oldReturns[row.yarnStockId] || 0) + qty;
            }
          }
        }
        for (const row of oldWeaving) {
          if (row.yarnStockId && row.qtyKg) {
            const qty = parseFloat(row.qtyKg) || 0;
            if (qty > 0) {
              oldReturns[row.yarnStockId] = (oldReturns[row.yarnStockId] || 0) + qty;
            }
          }
        }
      }

      // 3. Calculate new deductions
      const deductions = {};
      for (const row of warpingRows) {
        if (row.yarnStockId && row.qtyKg) {
          const qty = parseFloat(row.qtyKg) || 0;
          if (qty > 0) {
            deductions[row.yarnStockId] = (deductions[row.yarnStockId] || 0) + qty;
          }
        }
      }
      for (const row of weavingRows) {
        if (row.yarnStockId && row.qtyKg) {
          const qty = parseFloat(row.qtyKg) || 0;
          if (qty > 0) {
            deductions[row.yarnStockId] = (deductions[row.yarnStockId] || 0) + qty;
          }
        }
      }

      // 4. Validate in memory (checks both deductions and old returns to simulate new state)
      const detectedShortages = [];
      const stockUpdates = [];
      const affectedStockIds = new Set([
        ...Object.keys(oldReturns),
        ...Object.keys(deductions)
      ]);

      for (const stockId of affectedStockIds) {
        const currentItem = allStocks.find(s => s.id === stockId);
        if (!currentItem) {
          const newDeduct = deductions[stockId] || 0;
          if (newDeduct > 0) {
            detectedShortages.push({
              materialDescription: `Unknown Yarn (ID: ${stockId})`,
              supplierLot: 'N/A',
              needed: newDeduct,
              available: 0,
              shortage: newDeduct
            });
          }
          continue;
        }

        const currentQty = parseFloat(currentItem.unrestrictedStock) || 0;
        const returnedQty = oldReturns[stockId] || 0;
        const deductQty = deductions[stockId] || 0;

        const projectedQty = currentQty + returnedQty - deductQty;

        if (projectedQty < 0) {
          const shortageAmt = -projectedQty;
          const totalNeeded = deductQty;
          const totalAvailable = currentQty + returnedQty;
          detectedShortages.push({
            materialDescription: currentItem.materialDescription,
            supplierLot: currentItem.supplierLot || 'N/A',
            needed: totalNeeded,
            available: totalAvailable,
            shortage: shortageAmt
          });
        } else {
          stockUpdates.push({
            item: currentItem,
            newQty: projectedQty
          });
        }
      }

      // If shortages exist, block plan creation and alert user via custom modal
      if (detectedShortages.length > 0) {
        setShortages(detectedShortages);
        setIsShortageModalOpen(true);
        if (setStatus) setStatus({ text: 'Error: Aborted due to yarn stock shortage.', type: 'E' });
        return;
      }

      // 5. Update Yarn Stock quantities
      for (const update of stockUpdates) {
        await yarnStockStorage.saveYarnStock({
          ...update.item,
          unrestrictedStock: update.newQty,
          lastGoodsReceiptDate: new Date().toISOString()
        });
      }

      // 6. Save Planning Sheet data
      await planningStorage.savePlanningSheet(finalData);
      setShowPreview(true);
      if (setStatus) setStatus({ text: `Production Plan Set ${formData.setNo} saved successfully. Yarn stock quantities updated.`, type: 'S' });
      alert(editingPlan ? 'Planning Sheet Updated Successfully and Yarn Stock Adjusted!' : 'Planning Sheet Created Successfully and Yarn Stock Deducted!');
      if (setEditingPlan) setEditingPlan(null);
    } catch (e) {
      console.error(e);
      if (setStatus) setStatus({ text: `Failed to save plan: ${e.message}`, type: 'E' });
      alert('Failed to save planning sheet.');
    }
  };

  const resetForm = () => {
    setSelectedOrder(null);
    setShowPreview(false);
    setWarpingRows([{}]);
    setSizingData({ beamSpace: '', beamType: '', noOfBeam: '', beamLength: '' });
    setWeavingRows([{}]);
    setWeavingFabric({
      greyConstruction: '',
      weave: '',
      weftRatio: '',
      reedSpace: '',
      reed: '',
      endsDent: '',
      gWidth: '',
      weight: '',
      selvedge: ''
    });
    setFormData(prev => ({
      date: new Date().toISOString().split('T')[0],
      buyer: '', styleCode: '', endBuyer: '', mktPerson: '', remarks: '',
      setLength: '', orderRef: '', piWidth: '', piShrink: '', weave: '',
      colour: '', orderQnty: '', reqProd: '', pDyeing: '', remain1: '',
      todayTaken: '', remain2: '', setNo: prev.setNo
    }));
    if (setEditingPlan) setEditingPlan(null);
    if (setStatus) setStatus({ text: 'Plan form reset.', type: 'W' });
  };

  const handleF4Lookup = (field, options) => {
    const list = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    const choice = window.prompt(`Select ${field} (Enter Option Number):\n\n${list}`);
    if (choice) {
      const idx = parseInt(choice) - 1;
      if (idx >= 0 && idx < options.length) {
        setFormData(prev => ({ ...prev, [field]: options[idx] }));
        if (setStatus) setStatus({ text: `Selected ${field}: ${options[idx]} via F4 Help`, type: 'S' });
      }
    }
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
          {showPreview ? (
            <button onClick={() => setShowPreview(false)} className="sap-btn sap-btn-secondary">⬅ Back to Edit</button>
          ) : (
            <button onClick={handleCreatePlanningSheet} className="sap-btn" disabled={!selectedOrder}>
              {editingPlan ? '💾 Update Plan' : '💾 Create Plan'}
            </button>
          )}
          <button onClick={resetForm} className="sap-btn sap-btn-secondary">♻ Reset Plan</button>
          <button onClick={() => onNavigate('all_planning')} className="sap-btn sap-btn-secondary">📋 View Archive</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Planning Create
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors">
        {!showPreview ? (
          <>
            {/* 1. Order Search block */}
            <OrderSearch onOrderSelect={handleOrderSelect} />
            
            {!selectedOrder ? (
              <div className="office-card text-center p-12 text-slate-400 dark:text-slate-500 text-xs italic">
                Please search and select an active Purchase Order to initialize the Production Plan.
              </div>
            ) : (
              <div
                ref={entryAreaRef}
                onKeyDown={handleEntryKeyDown}
                className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {/* 2. Header form panel */}
                <section className="office-card">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Plan Header Parameters
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Set No</label>
                      <input type="text" value={formData.setNo} className="font-bold text-blue-600 dark:text-blue-400" readOnly />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Plan Date</label>
                      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="sap-required" />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Buyer</label>
                      <input type="text" value={formData.buyer} onChange={e => setFormData({...formData, buyer: e.target.value})} className="sap-required" />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Style/Code</label>
                      <input type="text" value={formData.styleCode} onChange={e => setFormData({...formData, styleCode: e.target.value})} className="sap-required" />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">End Buyer</label>
                      <input type="text" value={formData.endBuyer} onChange={e => setFormData({...formData, endBuyer: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Mkt Person</label>
                      <input type="text" value={formData.mktPerson} onChange={e => setFormData({...formData, mktPerson: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Order Ref</label>
                      <input type="text" value={formData.orderRef} onChange={e => setFormData({...formData, orderRef: e.target.value})} className="sap-required" />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Set Length (m) <span className="text-red-600">*</span></label>
                      <input type="number" value={formData.setLength} onChange={e => handleSetLengthChange(e.target.value)} className="sap-required font-bold text-slate-800 dark:text-slate-200" placeholder="Required" />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">PI-Width</label>
                      <input type="text" value={formData.piWidth} onChange={e => setFormData({...formData, piWidth: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">PI-Shrink</label>
                      <input type="text" value={formData.piShrink} onChange={e => setFormData({...formData, piShrink: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Weave</label>
                      <input type="text" value={formData.weave} onChange={e => setFormData({...formData, weave: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Colour</label>
                      <input type="text" value={formData.colour} onChange={e => setFormData({...formData, colour: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Order Qnty</label>
                      <input type="text" value={formData.orderQnty} onChange={e => setFormData({...formData, orderQnty: e.target.value})} readOnly />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Req Prod (m)</label>
                      <input type="text" value={formData.reqProd} onChange={e => setFormData({...formData, reqProd: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">P. Dyeing</label>
                      <input type="text" value={formData.pDyeing} onChange={e => setFormData({...formData, pDyeing: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Remain 1</label>
                      <input type="text" value={formData.remain1} onChange={e => setFormData({...formData, remain1: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Today Taken</label>
                      <input type="text" value={formData.todayTaken} onChange={e => setFormData({...formData, todayTaken: e.target.value})} />
                    </div>
                    <div className="flex items-center">
                      <label className="w-28 sap-label">Remain 2</label>
                      <input type="text" value={formData.remain2} onChange={e => setFormData({...formData, remain2: e.target.value})} />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <label className="w-28 sap-label">Remarks</label>
                      <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="flex-1" />
                    </div>
                  </div>
                </section>

                {/* 3. SAP Tab Strips Section */}
                <div className="office-card flex flex-col p-0 overflow-hidden">
                  {/* Tab headers */}
                  <div className="sap-tab-container select-none px-6 pt-4 border-b border-slate-200 dark:border-slate-800">
                    <div 
                      onClick={() => setActiveTab('warping')}
                      className={`sap-tab ${activeTab === 'warping' ? 'active' : ''}`}
                    >
                      Warping Information
                    </div>
                    <div 
                      onClick={() => setActiveTab('sizing')}
                      className={`sap-tab ${activeTab === 'sizing' ? 'active' : ''}`}
                    >
                      Sizing Information
                    </div>
                    <div 
                      onClick={() => setActiveTab('weaving')}
                      className={`sap-tab ${activeTab === 'weaving' ? 'active' : ''}`}
                    >
                      Weaving Information
                    </div>
                  </div>

                  {/* Tab workspace panels */}
                  <div className="p-6 bg-transparent">
                    
                    {/* warping tab panel */}
                    {activeTab === 'warping' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">01. Warping Specification Items</span>
                          <button 
                            type="button"
                            onClick={() => setWarpingRows([...warpingRows, {}])} 
                            className="sap-btn"
                          >
                            ➕ Insert Warping Line
                          </button>
                        </div>
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                          <table className="sap-alv-table">
                            <thead>
                              <tr>
                                <th>Set Length</th>
                                <th>Per Set</th>
                                <th>Ratio</th>
                                <th>Yarn Name</th>
                                <th>Supplier</th>
                                <th>Yarn Lot</th>
                                <th>Beam Count</th>
                                <th>Ends/Beam</th>
                                <th>Total Ends</th>
                                <th>Qty (Kg)</th>
                                <th className="text-center w-10">Act</th>
                              </tr>
                            </thead>
                            <tbody>
                              {warpingRows.map((row, i) => (
                                <tr key={i}>
                                  <td className="bg-slate-100/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-center font-semibold">{formData.setLength || '0'}</td>
                                  <td className="bg-slate-100/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-center font-semibold">{row.perSet || '0'}</td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1" value={row.ratio || ''} onChange={e => updateWarpingRow(i, 'ratio', e.target.value)} /></td>
                                  <td className="p-0 relative">
                                    <YarnSelectDropdown
                                      value={row.yarnName || ''}
                                      yarnStocks={yarnStocks}
                                      onSelect={(selectedYarn) => {
                                        updateWarpingRowMultiple(i, {
                                          yarnName: selectedYarn.materialDescription,
                                          supp: selectedYarn.supplierName,
                                          yarnLot: selectedYarn.supplierLot,
                                          yarnStockId: selectedYarn.id
                                        });
                                      }}
                                      onChange={(val) => updateWarpingRow(i, 'yarnName', val)}
                                    />
                                  </td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1" value={row.supp || ''} onChange={e => updateWarpingRow(i, 'supp', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1" value={row.yarnLot || ''} onChange={e => updateWarpingRow(i, 'yarnLot', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1" value={row.beam || ''} onChange={e => updateWarpingRow(i, 'beam', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1" value={row.endsBeam || ''} onChange={e => updateWarpingRow(i, 'endsBeam', e.target.value)} /></td>
                                  <td className="bg-slate-50/50 dark:bg-slate-800/30 text-center font-semibold text-slate-800 dark:text-slate-200">{row.totalEnds || '0'}</td>
                                  <td className="bg-slate-50/50 dark:bg-slate-800/30 text-center font-semibold text-slate-800 dark:text-slate-200">{row.qtyKg || '0'}</td>
                                  <td className="p-0 text-center">
                                    <button 
                                      type="button"
                                      onClick={() => setWarpingRows(warpingRows.filter((_, idx) => idx !== i))} 
                                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 w-full h-[22px] flex items-center justify-center text-[11px]"
                                    >
                                      Del
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* sizing tab panel */}
                    {activeTab === 'sizing' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          02. Sizing Details
                        </div>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex items-center">
                              <label className="w-32 sap-label">Beam Space (inch)</label>
                              <input type="text" value={sizingData.beamSpace} onChange={e => handleSizingChange('beamSpace', e.target.value)} className="flex-1" />
                            </div>
                            <div className="flex items-center">
                              <label className="w-32 sap-label">Beam Type</label>
                              <input type="text" value={sizingData.beamType} onChange={e => handleSizingChange('beamType', e.target.value)} className="flex-1" />
                            </div>
                            <div className="flex items-center">
                              <label className="w-32 sap-label">No of Beam</label>
                              <input type="text" value={sizingData.noOfBeam} onChange={e => handleSizingChange('noOfBeam', e.target.value)} className="flex-1" />
                            </div>
                            <div className="flex items-center">
                              <label className="w-32 sap-label">Beam Length (m)</label>
                              <input type="text" value={sizingData.beamLength} onChange={e => handleSizingChange('beamLength', e.target.value)} className="flex-1 font-bold text-slate-800 dark:text-slate-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* weaving tab panel */}
                    {activeTab === 'weaving' && (
                      <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Weaving Specifications List */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
                            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">03. Weaving Fabric Parameters</span>
                          </div>
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            <table className="sap-alv-table">
                              <thead>
                                <tr>
                                  <th>Grey Construction</th>
                                  <th>Weave</th>
                                  <th>Weft Ratio</th>
                                  <th>Reed Space</th>
                                  <th>Reed</th>
                                  <th>Ends/Dent</th>
                                  <th>G.Width</th>
                                  <th>Weight</th>
                                  <th>Selvedge</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.greyConstruction || ''} onChange={e => handleFabricChange('greyConstruction', e.target.value)} /></td>
                                  <td className="p-0">
                                    <select 
                                      className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" 
                                      value={weavingFabric.weave || ''} 
                                      onChange={e => handleFabricChange('weave', e.target.value)}
                                    >
                                      <option value="" className="text-slate-400 bg-white dark:bg-slate-900">Select...</option>
                                      <option value="1/1 PLAIN" className="bg-white dark:bg-slate-900">1/1 PLAIN</option>
                                      <option value="2/1 RHT" className="bg-white dark:bg-slate-900">2/1 RHT</option>
                                      <option value="3/1 RHT" className="bg-white dark:bg-slate-900">3/1 RHT</option>
                                      <option value="2/1 LHT" className="bg-white dark:bg-slate-900">2/1 LHT</option>
                                      <option value="3/1 LHT" className="bg-white dark:bg-slate-900">3/1 LHT</option>
                                      <option value="Dobby" className="bg-white dark:bg-slate-900">Dobby</option>
                                    </select>
                                  </td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.weftRatio || ''} onChange={e => handleFabricChange('weftRatio', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.reedSpace || ''} onChange={e => handleFabricChange('reedSpace', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.reed || ''} onChange={e => handleFabricChange('reed', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.endsDent || ''} onChange={e => handleFabricChange('endsDent', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.gWidth || ''} onChange={e => handleFabricChange('gWidth', e.target.value)} /></td>
                                  <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" value={weavingFabric.weight || ''} onChange={e => handleFabricChange('weight', e.target.value)} /></td>
                                  <td className="p-0">
                                    <select 
                                      className="w-full h-[22px] border-0 outline-none px-1 bg-transparent text-xs text-slate-800 dark:text-slate-100" 
                                      value={weavingFabric.selvedge || ''} 
                                      onChange={e => handleFabricChange('selvedge', e.target.value)}
                                    >
                                      <option value="" className="text-slate-400 bg-white dark:bg-slate-900">Select...</option>
                                      <option value="Yes" className="bg-white dark:bg-slate-900">Yes</option>
                                      <option value="No" className="bg-white dark:bg-slate-900">No</option>
                                    </select>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Weft Yarn Details */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
                            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              04. Weft Yarn Requirements (calculated)
                            </span>
                            <button 
                              type="button"
                              onClick={insertWeavingRow} 
                              className="sap-btn"
                            >
                              ➕ Insert Weaving Line
                            </button>
                          </div>
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            <table className="sap-alv-table">
                              <thead>
                                <tr>
                                  <th>Yarn Name</th>
                                  <th>Supplier</th>
                                  <th>Supp-Lot</th>
                                  <th>Ratio</th>
                                  <th>Qty-Kg (Auto)</th>
                                  <th>Pick Length</th>
                                  <th>PPI</th>
                                  <th className="text-center w-10">Act</th>
                                </tr>
                              </thead>
                              <tbody>
                                {weavingRows.map((row, i) => (
                                  <tr key={`yarn-${i}`}>
                                    <td className="p-0 relative">
                                      <YarnSelectDropdown
                                        value={row.yarnName || ''}
                                        yarnStocks={yarnStocks}
                                        onSelect={(selectedYarn) => {
                                          updateWeavingRowMultiple(i, {
                                            yarnName: selectedYarn.materialDescription,
                                            supplier: selectedYarn.supplierName,
                                            suppLot: selectedYarn.supplierLot,
                                            yarnStockId: selectedYarn.id
                                          });
                                        }}
                                        onChange={(val) => updateWeavingRow(i, 'yarnName', val)}
                                      />
                                    </td>
                                    <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent" value={row.supplier || ''} onChange={e => updateWeavingRow(i, 'supplier', e.target.value)} /></td>
                                    <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent" value={row.suppLot || ''} onChange={e => updateWeavingRow(i, 'suppLot', e.target.value)} /></td>
                                    <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent" value={row.ratio || ''} onChange={e => updateWeavingRow(i, 'ratio', e.target.value)} /></td>
                                    <td className="bg-slate-50/50 dark:bg-slate-800/30 text-center font-semibold text-slate-800 dark:text-slate-200">{row.qtyKg || '0'}</td>
                                    <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent" value={row.pickLength || ''} onChange={e => updateWeavingRow(i, 'pickLength', e.target.value)} /></td>
                                    <td className="p-0"><input className="w-full h-[22px] border-0 outline-none px-1 bg-transparent" value={row.ppi || ''} onChange={e => updateWeavingRow(i, 'ppi', e.target.value)} /></td>
                                    <td className="p-0 text-center">
                                      <button 
                                        type="button"
                                        onClick={() => setWeavingRows(weavingRows.filter((_, idx) => idx !== i))} 
                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 w-full h-[22px] flex items-center justify-center text-[11px]"
                                      >
                                        Del
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()} 
                className="sap-btn bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-200 font-bold text-xs"
              >
                🖨 PRINT PLANNING SHEET
              </button>
              <button 
                onClick={() => setShowPreview(false)} 
                className="sap-btn sap-btn-secondary"
              >
                ⬅ Back to Edit
              </button>
            </div>
            <PlanningSheetPreview data={{ 
              ...formData, 
              warpingRows, 
              sizing: sizingData, 
              weavingRows: weavingRows.map((row, i) => i === 0 ? { ...row, ...weavingFabric } : row) 
            }} />
          </div>
        )}
      </div>
      <YarnShortageModal
        isOpen={isShortageModalOpen}
        shortages={shortages}
        onClose={() => setIsShortageModalOpen(false)}
      />
    </PageLayout>
  );
};

export default PlanningSheetCreation;
