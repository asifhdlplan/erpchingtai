import React, { useRef, useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { FormInput, SelectInput } from '../components/ui/FormInputs';
import { OrderGrid } from '../components/ui/OrderGrid';
import { storageService } from '../services/storage';

const OrderReceive = ({ currentPage, onNavigate, onAdminClick, editingOrder, setEditingOrder }) => {
  const entryAreaRef = useRef(null);
  const [formData, setFormData] = useState({
    piRecDate: '',
    piNo: '',
    piDate: '',
    orderRef: '',
    orderType: '',
    mktPerson: '',
    buyer: '',
    customer: '',
    teamLeader: '',
    custType: '',
    id: '',
    remarks: '',
  });
  const [gridRows, setGridRows] = useState([{}]);
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    if (editingOrder) {
      setFormData(editingOrder);
      setGridRows(editingOrder.items || [{}]);
      setIsEditing(editingOrder.id);
    } else {
      resetForm();
    }
  }, [editingOrder]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Simple validation
    const requiredFields = ['piNo', 'orderRef', 'mktPerson', 'buyer', 'customer', 'teamLeader', 'custType'];
    const missing = requiredFields.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      alert(`Please fill in required fields: ${missing.join(', ')}`);
      return;
    }

    const orderData = {
      ...formData,
      items: gridRows,
      createdAt: formData.createdAt || new Date().toISOString(),
      status: formData.status || 'Active'
    };

    try {
      await storageService.saveOrder(orderData);
      alert('Order saved successfully!');
      resetForm();
      if (setEditingOrder) setEditingOrder(null);
      onNavigate('active_orders');
    } catch (e) {
      console.error('Save Order Error:', e);
      alert(`Failed to save order: ${e.message || 'Please check connection and settings.'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      piRecDate: '', piNo: '', piDate: '', orderRef: '', orderType: '',
      mktPerson: '', buyer: '', customer: '', teamLeader: '', custType: '',
      id: '', remarks: '',
    });
    setGridRows([{}]);
    setIsEditing(null);
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
    if (e.key === 'Enter' && tag !== 'TEXTAREA') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <PageLayout currentPage={currentPage} onNavigate={onNavigate} onAdminClick={onAdminClick}>
      {/* Header Section */}
      <header className="sap-header border-b border-slate-200 p-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Ha-meem Ching Tai Pocketing & Accessories Ltd. <span className="text-blue-600">ERP Solution</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
              Polash, Narshingdi
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <button 
                onClick={() => { resetForm(); if (setEditingOrder) setEditingOrder(null); }}
                className="px-4 py-2 text-xs font-semibold rounded border border-red-300 hover:bg-red-50 text-red-700 bg-white shadow-xs transition-all"
              >
                CANCEL EDIT
              </button>
            )}
            <button 
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-xs transition-all"
            >
              RESET
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-all"
            >
              {isEditing ? 'UPDATE ORDER' : 'POST ORDER'}
            </button>
          </div>
        </div>
      </header>

      <div ref={entryAreaRef} onKeyDown={handleEntryKeyDown} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Form Section */}
        <section className="sap-panel p-5">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Order Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <FormInput label="PI Rec Date" name="piRecDate" type="date" value={formData.piRecDate} onChange={handleFormChange} />
            <FormInput label="PI No" name="piNo" value={formData.piNo} onChange={handleFormChange} required />
            <FormInput label="PI Date" name="piDate" type="date" value={formData.piDate} onChange={handleFormChange} />
            <FormInput label="OrderRef" name="orderRef" value={formData.orderRef} onChange={handleFormChange} required />
            
            <SelectInput 
              label="Order Type" 
              name="orderType" 
              value={formData.orderType} 
              onChange={handleFormChange} 
              required 
              options={[
                { label: 'Sample', value: 'Sample' },
                { label: 'Production', value: 'Production' },
                { label: 'Development', value: 'Development' },
              ]}
            />
            <FormInput label="MktPerson" name="mktPerson" value={formData.mktPerson} onChange={handleFormChange} required />
            <FormInput label="Buyer" name="buyer" value={formData.buyer} onChange={handleFormChange} required />
            <FormInput label="Customer" name="customer" value={formData.customer} onChange={handleFormChange} required />
            
            <FormInput label="TeamLeader" name="teamLeader" value={formData.teamLeader} onChange={handleFormChange} required />
            <SelectInput 
              label="Cust Type" 
              name="custType" 
              value={formData.custType} 
              onChange={handleFormChange} 
              required 
              options={[
                { label: 'Regular', value: 'Regular' },
                { label: 'New', value: 'New' },
                { label: 'Special', value: 'Special' },
              ]}
            />
            <FormInput label="ID" name="id" value={formData.id} onChange={handleFormChange} placeholder="(New)" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Remarks</label>
              <textarea 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleFormChange}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white h-[34px] resize-none text-slate-900 shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Grid Section */}
        <section className="sap-panel p-5 mb-10">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Item Details</h2>
          </div>
          <OrderGrid rows={gridRows} setRows={setGridRows} />
        </section>
      </div>
    </PageLayout>
  );
};

export default OrderReceive;
