import React, { useMemo, useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { authStorage } from '../../auth/storage';
import { createUser, deleteUser, resetUserPassword, updateUser } from '../../auth/utils';

const UserManagementTable = ({ users, onEdit, onDelete, onReset, selectedRowId, setSelectedRowId }) => (
  <div className="overflow-auto border border-[#B8C2CC] bg-white">
    <table className="sap-alv-table border-collapse">
      <thead>
        <tr className="bg-[#E8EDF5] border-b border-[#B8C2CC]">
          <th className="w-8 text-center border-r border-[#B8C2CC]">Sel</th>
          <th className="border-r border-[#B8C2CC]">Employee Name</th>
          <th className="border-r border-[#B8C2CC]">Username</th>
          <th className="border-r border-[#B8C2CC]">Created Date</th>
          <th className="text-center w-52">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan="5" className="p-4 text-center text-slate-400 italic">No users found.</td>
          </tr>
        ) : (
          users.map((u) => (
            <tr 
              key={u.username} 
              onClick={() => setSelectedRowId(u.username)}
              className={`cursor-pointer ${selectedRowId === u.username ? 'sap-selected' : ''}`}
            >
              <td className="text-center border-r border-[#B8C2CC]">
                <input 
                  type="radio" 
                  name="user_select"
                  checked={selectedRowId === u.username}
                  onChange={() => setSelectedRowId(u.username)}
                />
              </td>
              <td className="font-bold text-slate-900 border-r border-[#B8C2CC]">{u.employeeName}</td>
              <td className="font-mono text-slate-700 border-r border-[#B8C2CC]">{u.username}</td>
              <td className="text-slate-500 border-r border-[#B8C2CC] font-mono">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="p-0 text-center">
                <div className="flex items-center justify-center h-[22px]">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(u); }} 
                    className="text-blue-700 hover:bg-blue-50 px-2 py-0.5 text-[10px] font-bold border-r border-[#E5E7EB] h-full"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReset(u); }} 
                    className="text-amber-700 hover:bg-amber-50 px-2 py-0.5 text-[10px] font-bold border-r border-[#E5E7EB] h-full"
                  >
                    PW Reset
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(u); }} 
                    className="text-red-600 hover:bg-red-50 px-2 py-0.5 text-[10px] font-bold h-full"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const AdminDashboard = ({ currentPage, onNavigate, onAdminClick, status, setStatus }) => {
  const [users, setUsers] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [form, setForm] = useState({ employeeName: '', username: '', password: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [adminPwd, setAdminPwd] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const u = await authStorage.getUsers();
    setUsers(u);
    if (setStatus) setStatus({ text: `Retrieved ${u.length} active login profiles.`, type: 'S' });
  };

  const showNotification = (text, type = 'success') => {
    if (setStatus) {
      setStatus({ text, type: type === 'error' ? 'E' : 'S' });
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!form.employeeName.trim() || !form.username.trim() || !form.password) {
      return showNotification('All fields are required.', 'error');
    }
    const res = await createUser(form);
    if (!res.ok) return showNotification(res.message, 'error');
    setUsers(res.users); 
    setForm({ employeeName: '', username: '', password: '' }); 
    showNotification('User profile created successfully.');
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete ${u.employeeName} (${u.username})?`)) return;
    const nextUsers = await deleteUser(u.username);
    setUsers(nextUsers); 
    showNotification('User profile deleted.');
  };

  const handleReset = async (u) => {
    const p = window.prompt(`Set new password for ${u.username}`);
    if (!p) return;
    const nextUsers = await resetUserPassword(u.username, p);
    setUsers(nextUsers); 
    showNotification('Password updated successfully.');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const res = await updateUser(editTarget.originalUsername, editTarget);
    if (!res.ok) return showNotification(res.message, 'error');
    setUsers(res.users); 
    setEditTarget(null); 
    showNotification('User profile details updated.');
  };

  const changeAdminPassword = async (e) => {
    e.preventDefault();
    const current = await authStorage.getAdminPassword();
    if (adminPwd.oldPassword !== current) return showNotification('Old password is incorrect.', 'error');
    if (!adminPwd.newPassword || adminPwd.newPassword !== adminPwd.confirmPassword) {
      return showNotification('New passwords do not match.', 'error');
    }
    await authStorage.setAdminPassword(adminPwd.newPassword);
    setAdminPwd({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showNotification('Administrative password changed successfully.');
  };

  const userCount = useMemo(() => users.length, [users]);

  return (
    <PageLayout 
      currentPage={currentPage} 
      onNavigate={onNavigate} 
      onAdminClick={onAdminClick}
      status={status}
      setStatus={setStatus}
    >
      {/* Transaction Action Toolbar */}
      <div className="bg-[#E8EDF5] border-b border-[#B8C2CC] px-2 py-1 flex items-center justify-between select-none">
        <div className="flex gap-1">
          <button 
            onClick={() => {
              const target = users.find(u => u.username === selectedRowId);
              if (target) setEditTarget({ ...target, originalUsername: target.username });
              else alert('Please select a user in the ALV Grid first.');
            }}
            className="sap-btn"
            disabled={!selectedRowId}
          >
            ✏ Edit Details
          </button>
          <button 
            onClick={() => {
              const target = users.find(u => u.username === selectedRowId);
              if (target) handleReset(target);
              else alert('Please select a user in the ALV Grid first.');
            }}
            className="sap-btn"
            disabled={!selectedRowId}
          >
            🔑 Reset Password
          </button>
          <button 
            onClick={() => {
              const target = users.find(u => u.username === selectedRowId);
              if (target) handleDelete(target);
              else alert('Please select a user in the ALV Grid first.');
            }}
            className="sap-btn"
            disabled={!selectedRowId}
          >
            ❌ Delete Account
          </button>
          <button onClick={fetchUsers} className="sap-btn">↻ Refresh</button>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
          SU01 - User Maintenance
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header stats block */}
        <section className="border border-[#B8C2CC] bg-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">System Security Parameters</h2>
              <span className="text-[10px] text-slate-400 font-mono">Active login records: {userCount}</span>
            </div>
            <button 
              onClick={() => onNavigate('sap_easy_access')}
              className="sap-btn bg-[#D9E2F3] hover:bg-[#C6D9F1] font-bold text-xs"
            >
              ⬅ Exit to Easy Access
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Manage Users section */}
            <section className="border border-[#B8C2CC] bg-white p-4">
              <div className="border-b border-[#B8C2CC] pb-1.5 mb-3 font-bold text-xs uppercase text-slate-700">
                Registered Logins ALV Matrix
              </div>
              <UserManagementTable
                users={users}
                selectedRowId={selectedRowId}
                setSelectedRowId={setSelectedRowId}
                onDelete={handleDelete}
                onReset={handleReset}
                onEdit={(u) => setEditTarget({ ...u, originalUsername: u.username })}
              />
            </section>
            
            {/* Edit User target panel */}
            {editTarget && (
              <section className="border border-[#B8C2CC] bg-white p-4 animate-in slide-in-from-top-4 duration-200">
                <div className="border-b border-[#B8C2CC] pb-1.5 mb-3 font-bold text-xs uppercase text-slate-700">
                  Edit User Details
                </div>
                <form onSubmit={saveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="flex items-center">
                    <label className="w-24 sap-label">Emp Name</label>
                    <input className="flex-1 sap-required" value={editTarget.employeeName} onChange={(e)=>setEditTarget({...editTarget, employeeName:e.target.value})}/>
                  </div>
                  <div className="flex items-center">
                    <label className="w-24 sap-label">Username</label>
                    <input className="flex-1 sap-required font-mono" value={editTarget.username} onChange={(e)=>setEditTarget({...editTarget, username:e.target.value})}/>
                  </div>
                  <button className="sap-btn w-full">Confirm Modify</button>
                </form>
              </section>
            )}
          </div>

          <div className="space-y-4">
            {/* Create User Section */}
            <section className="border border-[#B8C2CC] bg-white p-4">
              <div className="border-b border-[#B8C2CC] pb-1.5 mb-3 font-bold text-xs uppercase text-slate-700">
                New User Registration
              </div>
              <form onSubmit={addUser} className="space-y-3">
                <div className="flex items-center">
                  <label className="w-28 sap-label">Employee Name</label>
                  <input className="flex-1 sap-required" placeholder="e.g. John Doe" value={form.employeeName} onChange={(e)=>setForm({...form, employeeName:e.target.value})}/>
                </div>
                <div className="flex items-center">
                  <label className="w-28 sap-label">Username</label>
                  <input className="flex-1 sap-required font-mono" placeholder="e.g. johndoe" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})}/>
                </div>
                <div className="flex items-center">
                  <label className="w-28 sap-label">Initial Password</label>
                  <input type="password" className="flex-1 sap-required" placeholder="••••••••" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
                </div>
                <button className="sap-btn w-full mt-2">Create Profile</button>
              </form>
            </section>

            {/* Change Admin Password */}
            <section className="border border-[#B8C2CC] bg-white p-4">
              <div className="border-b border-[#B8C2CC] pb-1.5 mb-3 font-bold text-xs uppercase text-slate-700">
                Change Admin Bypass
              </div>
              <form onSubmit={changeAdminPassword} className="space-y-3">
                <div className="flex items-center">
                  <label className="w-28 sap-label">Old Password</label>
                  <input type="password" className="flex-1 sap-required" placeholder="••••••••" value={adminPwd.oldPassword} onChange={(e)=>setAdminPwd({...adminPwd, oldPassword:e.target.value})}/>
                </div>
                <div className="flex items-center">
                  <label className="w-28 sap-label">New Password</label>
                  <input type="password" className="flex-1 sap-required" placeholder="••••••••" value={adminPwd.newPassword} onChange={(e)=>setAdminPwd({...adminPwd, newPassword:e.target.value})}/>
                </div>
                <div className="flex items-center">
                  <label className="w-28 sap-label">Confirm Pass</label>
                  <input type="password" className="flex-1 sap-required" placeholder="••••••••" value={adminPwd.confirmPassword} onChange={(e)=>setAdminPwd({...adminPwd, confirmPassword:e.target.value})}/>
                </div>
                <button className="sap-btn w-full mt-2">Update Bypass</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
