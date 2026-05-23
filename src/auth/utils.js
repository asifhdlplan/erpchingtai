import { authStorage } from './storage';

const nowISO = () => new Date().toISOString();

export const initAuthData = () => authStorage.ensureDefaults();

export const authenticateUser = (username, password) => {
  const users = authStorage.getUsers();
  const match = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
  if (!match) return null;

  const session = {
    username: match.username,
    employeeName: match.employeeName,
    loginAt: nowISO()
  };
  authStorage.setSession(session);
  return session;
};

export const validateSession = () => {
  const session = authStorage.getSession();
  if (!session?.username || !session?.loginAt) return null;
  return session;
};

export const logoutUser = () => authStorage.clearSession();

export const createUser = ({ employeeName, username, password }) => {
  const users = authStorage.getUsers();
  const exists = users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (exists) return { ok: false, message: 'Username already exists.' };

  const next = [...users, { employeeName: employeeName.trim(), username: username.trim(), password, createdAt: nowISO() }];
  authStorage.saveUsers(next);
  return { ok: true, users: next };
};

export const updateUser = (username, payload) => {
  const users = authStorage.getUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx < 0) return { ok: false, message: 'User not found.' };

  const duplicate = users.some((u, i) => i !== idx && u.username.toLowerCase() === payload.username.trim().toLowerCase());
  if (duplicate) return { ok: false, message: 'Username already exists.' };

  users[idx] = { ...users[idx], employeeName: payload.employeeName.trim(), username: payload.username.trim() };
  authStorage.saveUsers(users);
  return { ok: true, users };
};

export const resetUserPassword = (username, password) => {
  const users = authStorage.getUsers().map((u) => (u.username === username ? { ...u, password } : u));
  authStorage.saveUsers(users);
  return users;
};

export const deleteUser = (username) => {
  const users = authStorage.getUsers().filter((u) => u.username !== username);
  authStorage.saveUsers(users);
  return users;
};
