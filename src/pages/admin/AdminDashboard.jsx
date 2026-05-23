import React, { useMemo, useState } from 'react';
import { authStorage } from '../../auth/storage';
import { createUser, deleteUser, resetUserPassword, updateUser } from '../../auth/utils';

const UserManagementTable = ({ users, onEdit, onDelete, onReset }) => (
  <div className="overflow-auto border border-slate-200 rounded-lg">
    <table className="w-full text-sm">
      <thead className="bg-slate-100 text-slate-700">
        <tr><th className="p-3 text-left">Employee Name</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Created Date</th><th className="p-3 text-left">Actions</th></tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.username} className="border-t">
            <td className="p-3">{u.employeeName}</td>
            <td className="p-3">{u.username}</td>
            <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
            <td className="p-3 flex gap-2">
              <button onClick={() => onEdit(u)} className="px-2 py-1 bg-amber-100 text-amber-800 rounded">Edit User</button>
              <button onClick={() => onReset(u)} className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Reset Password</button>
              <button onClick={() => onDelete(u)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Delete User</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState(authStorage.getUsers());
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ employeeName: '', username: '', password: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [adminPwd, setAdminPwd] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const clearMessage = () => setTimeout(() => setMsg(''), 1800);

  const addUser = (e) => {
    e.preventDefault();
    if (!form.employeeName.trim() || !form.username.trim() || !form.password) return setMsg('All fields are required.');
    const res = createUser(form);
    if (!res.ok) return setMsg(res.message);
    setUsers(res.users); setForm({ employeeName: '', username: '', password: '' }); setMsg('User created.'); clearMessage();
  };

  const handleDelete = (u) => {
    if (!window.confirm(`Delete ${u.username}?`)) return;
    setUsers(deleteUser(u.username)); setMsg('User deleted.'); clearMessage();
  };

  const handleReset = (u) => {
    const p = window.prompt(`Set new password for ${u.username}`);
    if (!p) return;
    setUsers(resetUserPassword(u.username, p)); setMsg('Password reset complete.'); clearMessage();
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const res = updateUser(editTarget.originalUsername, editTarget);
    if (!res.ok) return setMsg(res.message);
    setUsers(res.users); setEditTarget(null); setMsg('User updated.'); clearMessage();
  };

  const changeAdminPassword = (e) => {
    e.preventDefault();
    const current = authStorage.getAdminPassword();
    if (adminPwd.oldPassword !== current) return setMsg('Old password is incorrect.');
    if (!adminPwd.newPassword || adminPwd.newPassword !== adminPwd.confirmPassword) return setMsg('New password mismatch.');
    authStorage.setAdminPassword(adminPwd.newPassword);
    setAdminPwd({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setMsg('Admin password changed.'); clearMessage();
  };

  const userCount = useMemo(() => users.length, [users]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">ERP Admin Panel</h1>
        <p className="text-sm text-slate-600">Managed users: {userCount}</p>
        {msg && <p className="text-sm font-medium text-emerald-700">{msg}</p>}

        <section className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Create User</h2>
          <form onSubmit={addUser} className="grid md:grid-cols-4 gap-3">
            <input className="border rounded px-3 py-2" placeholder="Employee Name" value={form.employeeName} onChange={(e)=>setForm({...form, employeeName:e.target.value})}/>
            <input className="border rounded px-3 py-2" placeholder="Username" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})}/>
            <input className="border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
            <button className="bg-slate-900 text-white rounded px-4 py-2">Create User</button>
          </form>
        </section>

        <section className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Manage Users</h2>
          <UserManagementTable
            users={users}
            onDelete={handleDelete}
            onReset={handleReset}
            onEdit={(u) => setEditTarget({ ...u, originalUsername: u.username })}
          />
        </section>

        {editTarget && <section className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Edit User</h2>
          <form onSubmit={saveEdit} className="grid md:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2" value={editTarget.employeeName} onChange={(e)=>setEditTarget({...editTarget, employeeName:e.target.value})}/>
            <input className="border rounded px-3 py-2" value={editTarget.username} onChange={(e)=>setEditTarget({...editTarget, username:e.target.value})}/>
            <button className="bg-amber-600 text-white rounded px-4 py-2">Save Changes</button>
          </form>
        </section>}

        <section className="bg-white p-4 rounded-xl border"><h2 className="font-semibold mb-3">Change Admin Password</h2>
          <form onSubmit={changeAdminPassword} className="grid md:grid-cols-4 gap-3">
            <input type="password" className="border rounded px-3 py-2" placeholder="Old Password" value={adminPwd.oldPassword} onChange={(e)=>setAdminPwd({...adminPwd, oldPassword:e.target.value})}/>
            <input type="password" className="border rounded px-3 py-2" placeholder="New Password" value={adminPwd.newPassword} onChange={(e)=>setAdminPwd({...adminPwd, newPassword:e.target.value})}/>
            <input type="password" className="border rounded px-3 py-2" placeholder="Confirm New Password" value={adminPwd.confirmPassword} onChange={(e)=>setAdminPwd({...adminPwd, confirmPassword:e.target.value})}/>
            <button className="bg-blue-600 text-white rounded px-4 py-2">Update Password</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
