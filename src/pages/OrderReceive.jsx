import React, { useRef, useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { OrderGrid } from '../components/ui/OrderGrid';
import { storageService } from '../services/storage';

const OrderReceive = ({ 
  currentPage, 
  onNavigate, 
  onAdminClick, 
  editingOrder, 
  setEditingOrder,
  status,
  setStatus 
}) => {
  const entryAreaRef = useRef(null);
  const [formData, setFormData] = useState({
    piRecDate: '',
    piNo: '',
    piDate: '',
    orderRef: '',
    orderType: 'Production',
    mktPerson: '',
    buyer: '',
    customer: '',
    teamLeader: '',
    custType: 'Regular',
    id: '',
    remarks: '',
    status: 'Active'
  });
  const [gridRows, setGridRows] = useState([{}]);
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    if (editingOrder) {
      setFormData(editingOrder);
      setGridRows(editingOrder.items || [{}]);
      setIsEditing(editingOrder.id);
      if (setStatus) setStatus({ text: `Displaying Order ${editingOrder.piNo} for Editing`, type: 'W' });
    } else {
      resetForm();
    }
  }, [editingOrder]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Simple validation
    const requiredFields = ['piNo', 'orderRef', 'mktPerson', 'buyer', 'customer', 'teamLeader'];
    const missing = requiredFields.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      if (setStatus) setStatus({ text: `Required field missing: ${missing.join(', ')}`, type: 'E' });
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
      if (setStatus) setStatus({ text: `Order PI No: ${formData.piNo} saved successfully.`, type: 'S' });
      alert('Order saved successfully!');
      resetForm();
      if (setEditingOrder) setEditingOrder(null);
      onNavigate('active_orders');
    } catch (e) {
      console.error('Save Order Error:', e);
      if (setStatus) setStatus({ text: `Save failed: ${e.message}`, type: 'E' });
      alert(`Failed to save order: ${e.message || 'Error occurred.'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      piRecDate: '', piNo: '', piDate: '', orderRef: '', orderType: 'Production',
      mktPerson: '', buyer: '', customer: '', teamLeader: '', custType: 'Regular',
      id: '', remarks: '', status: 'Active'
    });
    setGridRows([{}]);
    setIsEditing(null);
    if (setStatus) setStatus({ text: 'Form cleared.', type: 'W' });
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
      // Handle F4 triggers or key submissions
      if (e.target.name === 'piNo' && !formData.piNo) return;
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
      <div className="bg-slate-100 dark:bg-[#151D30] border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between select-none">
        <div className="flex gap-2">
          <button onClick={handleSave} className="sap-btn" title="Post/Save Order Data">💾 Save Order</button>
          <button onClick={resetForm} className="sap-btn sap-btn-secondary" title="Reset current inputs">♻ Reset Form</button>
          <button onClick={() => onNavigate('active_orders')} className="sap-btn sap-btn-secondary" title="View Active Order History">📋 Active Backlog</button>
          <button onClick={() => onNavigate('completed_orders')} className="sap-btn sap-btn-secondary" title="View Completed Archive">🗄 Completed Archive</button>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Create Mode
        </div>
      </div>

      <div ref={entryAreaRef} onKeyDown={handleEntryKeyDown} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0B0F19]">
        {/* Form Group Block */}
        <section className="office-card p-5">
          {/* Section Subheader */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
            Order Header Data
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
            {/* PI Rec Date */}
            <div className="flex items-center">
              <label className="w-28 sap-label">PI Rec Date</label>
              <input 
                type="date" 
                name="piRecDate" 
                value={formData.piRecDate} 
                onChange={handleFormChange}
                className="flex-1"
              />
            </div>

            {/* PI No */}
            <div className="flex items-center">
              <label className="w-28 sap-label">PI No <span className="text-red-600">*</span></label>
              <input 
                type="text" 
                name="piNo" 
                value={formData.piNo} 
                onChange={handleFormChange}
                className="flex-1 sap-required uppercase font-bold"
                placeholder="Required"
              />
            </div>

            {/* PI Date */}
            <div className="flex items-center">
              <label className="w-28 sap-label">PI Date</label>
              <input 
                type="date" 
                name="piDate" 
                value={formData.piDate} 
                onChange={handleFormChange}
                className="flex-1"
              />
            </div>

            {/* Order Ref */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Order Ref <span className="text-red-600">*</span></label>
              <input 
                type="text" 
                name="orderRef" 
                value={formData.orderRef} 
                onChange={handleFormChange}
                className="flex-1 sap-required"
                placeholder="Required"
              />
            </div>

            {/* Order Type */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Order Type</label>
              <select 
                name="orderType" 
                value={formData.orderType} 
                onChange={handleFormChange}
                className="flex-1"
              >
                <option value="Sample">Sample</option>
                <option value="Production">Production</option>
                <option value="Development">Development</option>
              </select>
            </div>

            {/* Mkt Person */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Mkt Person <span className="text-red-600">*</span></label>
              <div className="flex-1 flex items-center">
                <input 
                  type="text" 
                  name="mktPerson" 
                  value={formData.mktPerson} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required rounded-r-none"
                  placeholder="F4 Help"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('mktPerson', ["Asif Jahan", "Tariqul Islam", "Siddique Rahman", "M.A. Halim"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Buyer */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Buyer <span className="text-red-600">*</span></label>
              <div className="flex-1 flex items-center">
                <input 
                  type="text" 
                  name="buyer" 
                  value={formData.buyer} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required rounded-r-none"
                  placeholder="F4 Help"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('buyer', ["H&M", "Zara", "Gap Inc.", "Walmart", "Levis", "C&A"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Customer <span className="text-red-600">*</span></label>
              <div className="flex-1 flex items-center">
                <input 
                  type="text" 
                  name="customer" 
                  value={formData.customer} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required rounded-r-none"
                  placeholder="F4 Help"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('customer', ["Ha-meem Apparel", "Ching Tai Garments", "Standard Group", "Pacific Jeans"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Team Leader */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Team Leader <span className="text-red-600">*</span></label>
              <div className="flex-1 flex items-center">
                <input 
                  type="text" 
                  name="teamLeader" 
                  value={formData.teamLeader} 
                  onChange={handleFormChange}
                  className="flex-1 sap-required rounded-r-none"
                  placeholder="F4 Help"
                />
                <button 
                  type="button" 
                  onClick={() => handleF4Lookup('teamLeader', ["Leader Alpha", "Leader Beta", "Leader Gamma"])}
                  className="sap-btn-secondary px-2 h-[34px] border-l-0 rounded-l-none font-mono flex items-center justify-center shrink-0"
                  title="F4 Lookup Help"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Cust Type */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Cust Type</label>
              <select 
                name="custType" 
                value={formData.custType} 
                onChange={handleFormChange}
                className="flex-1"
              >
                <option value="Regular">Regular</option>
                <option value="New">New</option>
                <option value="Special">Special</option>
              </select>
            </div>

            {/* ID */}
            <div className="flex items-center">
              <label className="w-28 sap-label">ID Reference</label>
              <input 
                type="text" 
                name="id" 
                value={formData.id} 
                onChange={handleFormChange} 
                placeholder="(Auto)"
                readOnly
              />
            </div>

            {/* Status (Read-Only) */}
            <div className="flex items-center">
              <label className="w-28 sap-label">Order Status</label>
              <input 
                type="text" 
                name="status" 
                value={formData.status || 'Active'} 
                readOnly
                className="font-bold text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>

          {/* Remarks block */}
          <div className="flex flex-col md:flex-row md:items-center mt-3 w-full">
            <label className="w-28 sap-label block shrink-0">Remarks</label>
            <textarea 
              name="remarks" 
              value={formData.remarks} 
              onChange={handleFormChange}
              className="flex-1"
            />
          </div>
        </section>

        {/* Item Details Grid Section */}
        <section className="office-card p-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
            Sales Order Item Spreadsheet Grid
          </div>
          <OrderGrid rows={gridRows} setRows={setGridRows} />
        </section>
      </div>
    </PageLayout>
  );
};

export default OrderReceive;
