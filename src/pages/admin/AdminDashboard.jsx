import React, { useMemo, useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { authStorage } from '../../auth/storage';
import { createUser, deleteUser, resetUserPassword, updateUser } from '../../auth/utils';

const UserManagementTable = ({ users, onEdit, onDelete, onReset, selectedRowId, setSelectedRowId }) => (
  <div className="overflow-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D30] rounded-lg">
    <table className="sap-alv-table border-collapse w-full text-xs">
      <thead>
        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
          <th className="w-8 text-center border-r border-slate-200 dark:border-slate-800">Sel</th>
          <th className="border-r border-slate-200 dark:border-slate-800">Employee Name</th>
          <th className="border-r border-slate-200 dark:border-slate-800">Username</th>
          <th className="border-r border-slate-200 dark:border-slate-800">Password</th>
          <th className="border-r border-slate-200 dark:border-slate-800">Created Date</th>
          <th className="text-center w-52">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan="6" className="p-4 text-center text-slate-400 dark:text-slate-500 italic">No users found.</td>
          </tr>
        ) : (
          users.map((u) => (
            <tr 
              key={u.username} 
              onClick={() => setSelectedRowId(u.username)}
              className={`cursor-pointer ${selectedRowId === u.username ? 'sap-selected' : ''} hover:bg-slate-50 dark:hover:bg-slate-850`}
            >
              <td className="text-center border-r border-slate-200 dark:border-slate-800 p-2">
                <input 
                  type="radio" 
                  name="user_select"
                  checked={selectedRowId === u.username}
                  onChange={() => setSelectedRowId(u.username)}
                />
              </td>
              <td className="font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 p-2">{u.employeeName}</td>
              <td className="font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 p-2">{u.username}</td>
              <td className="font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 p-2">{u.password}</td>
              <td className="text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 font-mono p-2">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="p-1 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(u); }} 
                    className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReset(u); }} 
                    className="px-2.5 py-1 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded transition"
                  >
                    PW Reset
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(u); }} 
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded transition"
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
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none transition-colors">
        <div className="flex flex-wrap gap-2">
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
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          SU01 - User Maintenance
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors flex flex-col">
        {/* Header stats block */}
        <section className="office-card p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">System Security Parameters</h2>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Active login records: {userCount}</span>
            </div>
            <button 
              onClick={() => onNavigate('sap_easy_access')}
              className="sap-btn sap-btn-secondary text-xs"
            >
              ⬅ Exit to Easy Access
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* Manage Users section */}
            <section className="office-card p-4 flex-grow flex flex-col">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
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
              <section className="office-card p-4 animate-in slide-in-from-top-4 duration-200">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
                  Edit User Details
                </div>
                <form onSubmit={saveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="flex flex-col">
                    <label className="sap-label mb-1">Emp Name</label>
                    <input className="w-full sap-required" value={editTarget.employeeName} onChange={(e)=>setEditTarget({...editTarget, employeeName:e.target.value})}/>
                  </div>
                  <div className="flex flex-col">
                    <label className="sap-label mb-1">Username</label>
                    <input className="w-full sap-required font-mono" value={editTarget.username} onChange={(e)=>setEditTarget({...editTarget, username:e.target.value})}/>
                  </div>
                  <button className="sap-btn w-full">Confirm Modify</button>
                </form>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {/* Create User Section */}
            <section className="office-card p-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
                New User Registration
              </div>
              <form onSubmit={addUser} className="space-y-4">
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Employee Name</label>
                  <input className="w-full sap-required" placeholder="e.g. John Doe" value={form.employeeName} onChange={(e)=>setForm({...form, employeeName:e.target.value})}/>
                </div>
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Username</label>
                  <input className="w-full sap-required font-mono" placeholder="e.g. johndoe" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})}/>
                </div>
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Initial Password</label>
                  <input type="password" autoComplete="new-password" className="w-full sap-required" placeholder="••••••••" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
                </div>
                <button className="sap-btn w-full mt-2">Create Profile</button>
              </form>
            </section>

            {/* Change Admin Password */}
            <section className="office-card p-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 font-bold text-xs uppercase text-slate-500">
                Change Admin Bypass
              </div>
              <form onSubmit={changeAdminPassword} className="space-y-4" autoComplete="off">
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Old Password</label>
                  <input type="password" autoComplete="new-password" className="w-full sap-required" placeholder="••••••••" value={adminPwd.oldPassword} onChange={(e)=>setAdminPwd({...adminPwd, oldPassword:e.target.value})}/>
                </div>
                <div className="flex flex-col">
                  <label className="sap-label mb-1">New Password</label>
                  <input type="password" autoComplete="new-password" className="w-full sap-required" placeholder="••••••••" value={adminPwd.newPassword} onChange={(e)=>setAdminPwd({...adminPwd, newPassword:e.target.value})}/>
                </div>
                <div className="flex flex-col">
                  <label className="sap-label mb-1">Confirm Pass</label>
                  <input type="password" autoComplete="new-password" className="w-full sap-required" placeholder="••••••••" value={adminPwd.confirmPassword} onChange={(e)=>setAdminPwd({...adminPwd, confirmPassword:e.target.value})}/>
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
