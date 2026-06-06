import React, { useMemo, useState, useEffect } from 'react';
import { authStorage } from '../../auth/storage';
import { createUser, deleteUser, resetUserPassword, updateUser } from '../../auth/utils';

const UserManagementTable = ({ users, onEdit, onDelete, onReset }) => (
  <div className="overflow-auto border border-slate-200 rounded bg-white shadow-sm">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
        <tr>
          <th className="p-3 text-left">Employee Name</th>
          <th className="p-3 text-left">Username</th>
          <th className="p-3 text-left">Created Date</th>
          <th className="p-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="text-xs text-slate-700">
        {users.length === 0 ? (
          <tr>
            <td colSpan="4" className="p-6 text-center text-slate-400 italic">No users found.</td>
          </tr>
        ) : (
          users.map((u) => (
            <tr key={u.username} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
              <td className="p-3 font-semibold text-slate-900">{u.employeeName}</td>
              <td className="p-3 font-mono text-slate-600">{u.username}</td>
              <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => onEdit(u)} 
                    className="px-2.5 py-1 text-xs border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded font-medium transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onReset(u)} 
                    className="px-2.5 py-1 text-xs border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded font-medium transition-all"
                  >
                    Reset Password
                  </button>
                  <button 
                    onClick={() => onDelete(u)} 
                    className="px-2.5 py-1 text-xs border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded font-medium transition-all"
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

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [form, setForm] = useState({ employeeName: '', username: '', password: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [adminPwd, setAdminPwd] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      const u = await authStorage.getUsers();
      setUsers(u);
    };
    fetchUsers();
  }, []);

  const showNotification = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
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

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  const userCount = useMemo(() => users.length, [users]);

  return (
    <div className="min-h-screen p-6 text-slate-800 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top bar with back button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ERP Administrative Core</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">Total Registered Accounts: {userCount}</p>
          </div>
          <button 
            onClick={handleBack}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded shadow transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            BACK TO SYSTEM CORE
          </button>
        </div>

        {/* System Messages */}
        {msg && (
          <div className={`p-3 rounded border text-xs font-semibold transition-all ${
            msgType === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Manage Users section */}
            <section className="sap-panel p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Accounts Directory</h2>
              </div>
              <UserManagementTable
                users={users}
                onDelete={handleDelete}
                onReset={handleReset}
                onEdit={(u) => setEditTarget({ ...u, originalUsername: u.username })}
              />
            </section>
            
            {/* Edit User target panel */}
            {editTarget && (
              <section className="sap-panel p-5 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Modify Account Settings</h2>
                </div>
                <form onSubmit={saveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Employee Name</label>
                    <input className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" value={editTarget.employeeName} onChange={(e)=>setEditTarget({...editTarget, employeeName:e.target.value})}/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                    <input className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" value={editTarget.username} onChange={(e)=>setEditTarget({...editTarget, username:e.target.value})}/>
                  </div>
                  <div className="flex items-end">
                    <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded shadow-sm transition-all">
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>
            )}

          </div>

          <div className="space-y-6">
            
            {/* Create User Section */}
            <section className="sap-panel p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Register New Account</h2>
              </div>
              <form onSubmit={addUser} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Employee Name</label>
                  <input className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" placeholder="e.g. John Doe" value={form.employeeName} onChange={(e)=>setForm({...form, employeeName:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                  <input className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" placeholder="e.g. johndoe" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Password</label>
                  <input type="password" className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" placeholder="••••••••" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
                </div>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-sm transition-all mt-1">
                  Create Account
                </button>
              </form>
            </section>

            {/* Change Admin Password */}
            <section className="sap-panel p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Change Admin Password</h2>
              </div>
              <form onSubmit={changeAdminPassword} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Current Password</label>
                  <input type="password" className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" placeholder="••••••••" value={adminPwd.oldPassword} onChange={(e)=>setAdminPwd({...adminPwd, oldPassword:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">New Password</label>
                  <input type="password" className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" placeholder="••••••••" value={adminPwd.newPassword} onChange={(e)=>setAdminPwd({...adminPwd, newPassword:e.target.value})}/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Confirm New Password</label>
                  <input type="password" className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white" placeholder="••••••••" value={adminPwd.confirmPassword} onChange={(e)=>setAdminPwd({...adminPwd, confirmPassword:e.target.value})}/>
                </div>
                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded shadow-sm transition-all mt-1">
                  Update Password
                </button>
              </form>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
