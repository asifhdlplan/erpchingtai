import React, { useState, useRef } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { yarnStockStorage } from '../services/yarnStockStorage';

const YarnStockEntry = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const entryAreaRef = useRef(null);
  const [formData, setFormData] = useState({
    plant: '1000',
    storageLocation: 'Y001',
    materialDescription: '',
    unit: 'KG',
    supplierName: '',
    supplierLot: '',
    unrestrictedStock: '',
    lastGoodsReceiptDate: new Date().toISOString().slice(0, 10)
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const requiredFields = ['plant', 'storageLocation', 'materialDescription', 'unit', 'supplierName', 'supplierLot', 'unrestrictedStock', 'lastGoodsReceiptDate'];
    const missing = requiredFields.filter(field => !formData[field]);

    if (missing.length > 0) {
      if (setStatus) setStatus({ text: `Required field missing: ${missing.join(', ')}`, type: 'E' });
      alert(`Please fill in all fields: ${missing.join(', ')}`);
      return;
    }

    try {
      if (setStatus) setStatus({ text: 'Posting goods receipt to ledger...', type: 'W' });
      await yarnStockStorage.saveYarnStock(formData);
      if (setStatus) setStatus({ text: `Goods receipt for lot ${formData.supplierLot} posted successfully.`, type: 'S' });
      alert('Yarn Stock Goods Receipt posted successfully!');
      resetForm();
      onNavigate('yarn_stock_overview');
    } catch (e) {
      console.error('Yarn post error:', e);
      if (setStatus) setStatus({ text: `Post failed: ${e.message}`, type: 'E' });
      alert(`Failed to post goods receipt: ${e.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      plant: '1000',
      storageLocation: 'Y001',
      materialDescription: '',
      unit: 'KG',
      supplierName: '',
      supplierLot: '',
      unrestrictedStock: '',
      lastGoodsReceiptDate: new Date().toISOString().slice(0, 10)
    });
    if (setStatus) setStatus({ text: 'Form cleared.', type: 'W' });
  };

  const handleF4Lookup = (field, options) => {
    const list = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    const choice = window.prompt(`Select ${field} (Enter Option Number):\n\n${list}`);
    if (choice) {
      const idx = parseInt(choice) - 1;
      if (idx >= 0 && idx < options.length) {
        const optVal = options[idx];
        const val = optVal.includes(' - ') ? optVal.split(' - ')[0] : optVal;
        setFormData(prev => ({ ...prev, [field]: val }));
        if (setStatus) setStatus({ text: `Selected ${field}: ${val} via F4 Help`, type: 'S' });
      }
    }
  };

  const focusByOffset = (currentEl, offset) => {
    const root = entryAreaRef.current;
    if (!root) return;
    const fields = Array.from(root.querySelectorAll('input, select, textarea, button'))
      .filter((el) => !el.disabled && !el.readOnly && el.type !== 'hidden' && el.tabIndex !== -1);
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
    if (e.key === 'Enter' && tag !== 'TEXTAREA' && e.target.type !== 'submit') {
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
          <button onClick={handleSave} className="sap-btn" title="Post/Save Goods Receipt Data">💾 Save/Post</button>
          <button onClick={resetForm} className="sap-btn sap-btn-secondary" title="Reset current inputs">♻ Reset Form</button>
          <button onClick={() => onNavigate('yarn_stock_overview')} className="sap-btn sap-btn-secondary" title="View Yarn Warehouse Stock Overview">📋 Stock Status</button>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Goods Receipt Mode
        </div>
      </div>

      <div ref={entryAreaRef} onKeyDown={handleEntryKeyDown} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors">
        {/* Form Group Block */}
        <section className="office-card">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Yarn Goods Receipt (Inventory Posting Header)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {/* Plant */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Plant <span className="text-red-500">*</span></label>
              <div className="flex-grow flex items-center">
                <input 
                  type="text" 
                  name="plant" 
                  value={formData.plant} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required font-mono rounded-r-none"
                  placeholder="Plant Code"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('plant', ["1000 - Narshingdi Main Plant", "2000 - Dhaka Spinning Plant", "3000 - Sizing Dyeing Unit"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Storage Location */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Storage Location <span className="text-red-500">*</span></label>
              <div className="flex-grow flex items-center">
                <input 
                  type="text" 
                  name="storageLocation" 
                  value={formData.storageLocation} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required font-mono rounded-r-none"
                  placeholder="SLoc Code"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('storageLocation', ["Y001 - Raw Yarn Store", "Y002 - Production Buffer Store", "Y003 - Rejects / Waste Store"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Date of last goods receipt */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Receipt Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="lastGoodsReceiptDate" 
                value={formData.lastGoodsReceiptDate} 
                onChange={handleFormChange}
                className="flex-grow sap-required"
              />
            </div>

            {/* Material Description */}
            <div className="flex items-center md:col-span-2 lg:col-span-3">
              <label className="w-32 sap-label">Material Desc <span className="text-red-550">*</span></label>
              <div className="flex-grow flex items-center">
                <input 
                  type="text" 
                  name="materialDescription" 
                  value={formData.materialDescription} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required rounded-r-none"
                  placeholder="Enter detailed yarn specifications (e.g. 100% Cotton Carded 30s)"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('materialDescription', [
                    "100% Cotton Carded Yarn 30s",
                    "100% Cotton Combed Yarn 40s",
                    "Polyester Filament DTY 150D/48F",
                    "T/C Yarn (65% Poly, 35% Cotton) 45s",
                    "100% Linen Yarn 25 Lea"
                  ])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Unit */}
            <div className="flex items-center">
              <label className="w-32 sap-label">UNIT (UoM) <span className="text-red-550">*</span></label>
              <select 
                name="unit" 
                value={formData.unit} 
                onChange={handleFormChange}
                className="flex-grow sap-required"
              >
                <option value="KG">KG - Kilograms</option>
                <option value="LBS">LBS - Pounds</option>
                <option value="BAGS">BAGS - Industrial Bags</option>
                <option value="BALES">BALES - Cotton Bales</option>
              </select>
            </div>

            {/* Supplier Name */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Supplier Name <span className="text-red-550">*</span></label>
              <div className="flex-grow flex items-center">
                <input 
                  type="text" 
                  name="supplierName" 
                  value={formData.supplierName} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required rounded-r-none"
                  placeholder="Supplier"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('supplierName', ["Ching Tai Spinning Mills", "Ha-meem Textile Spinning", "Narayanganj Yarn Trading Ltd", "Bhaluka Cotton Traders"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Supplier Lot */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Supplier Lot <span className="text-red-550">*</span></label>
              <input 
                type="text" 
                name="supplierLot" 
                value={formData.supplierLot} 
                onChange={handleFormChange}
                className="flex-grow sap-required uppercase font-mono"
                placeholder="Enter Supplier Batch / Lot No"
              />
            </div>

            {/* Unrestricted Stock (Quantity) */}
            <div className="flex items-center">
              <label className="w-32 sap-label">Unrestricted Stock <span className="text-red-550">*</span></label>
              <div className="flex-grow flex items-center relative">
                <input 
                  type="number" 
                  name="unrestrictedStock" 
                  value={formData.unrestrictedStock} 
                  onChange={handleFormChange}
                  className="flex-1 text-right font-mono font-bold pr-12 sap-required"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-3 text-[11px] font-bold text-slate-400 font-mono pointer-events-none select-none">
                  {formData.unit}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default YarnStockEntry;
