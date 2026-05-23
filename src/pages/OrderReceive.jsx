import React, { useRef, useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { FormInput, SelectInput, SearchBar } from '../components/ui/FormInputs';
import { OrderGrid } from '../components/ui/OrderGrid';
import { storageService, STORAGE_KEY } from '../services/storage';

const OrderReceive = ({ currentPage, onNavigate }) => {
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
  const [previousOrders, setPreviousOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setPreviousOrders(storageService.getAllOrders());
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
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
      createdAt: new Date().toISOString(),
    };

    storageService.saveOrder(orderData);
    alert('Order saved successfully!');
    resetForm();
    loadOrders();
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

  const handleEdit = (order) => {
    setFormData(order);
    setGridRows(order.items || [{}]);
    setIsEditing(order.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      storageService.deleteOrder(id);
      loadOrders();
    }
  };

  const filteredOrders = previousOrders.filter(order => {
    const searchStr = searchQuery.toLowerCase();
    return (
      order.piNo?.toLowerCase().includes(searchStr) ||
      order.buyer?.toLowerCase().includes(searchStr) ||
      order.customer?.toLowerCase().includes(searchStr) ||
      order.orderRef?.toLowerCase().includes(searchStr) ||
      order.items?.some(item => item.styleNo?.toLowerCase().includes(searchStr))
    );
  });

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
    <PageLayout currentPage={currentPage} onNavigate={onNavigate}>
      {/* Header Section */}
      <header className="bg-white border-b p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight animate-in fade-in slide-in-from-left duration-700">
              Ha-meem Ching Tai <span className="text-blue-600">ERP Solution</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2 animate-in fade-in slide-in-from-left duration-1000">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Planning Module | Created By <span className="text-blue-600 font-bold">Asif</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={resetForm}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-all"
            >
              RESET
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 rounded shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              {isEditing ? 'UPDATE ORDER' : 'POST ORDER'}
            </button>
          </div>
        </div>
      </header>

      <div ref={entryAreaRef} onKeyDown={handleEntryKeyDown} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-100">
        {/* Form Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Order Information</h2>
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Remarks</label>
              <textarea 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleFormChange}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all bg-white h-[34px] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Grid Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Item Details</h2>
          </div>
          <OrderGrid rows={gridRows} setRows={setGridRows} />
        </section>

        {/* Previous Data Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-12 duration-1000 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Previous Orders History</h2>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by PI, Buyer, Style, etc..." />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 border-b">PI No</th>
                  <th className="p-3 border-b">Order Ref</th>
                  <th className="p-3 border-b">Buyer</th>
                  <th className="p-3 border-b">Customer</th>
                  <th className="p-3 border-b">Items</th>
                  <th className="p-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 italic">No matching orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors border-b last:border-b-0">
                      <td className="p-3 font-medium text-slate-700">{order.piNo}</td>
                      <td className="p-3 text-slate-600">{order.orderRef}</td>
                      <td className="p-3 text-slate-600">{order.buyer}</td>
                      <td className="p-3 text-slate-600">{order.customer}</td>
                      <td className="p-3 text-slate-500">{order.items?.length || 0} items</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
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
    </PageLayout>
  );
};

export default OrderReceive;
