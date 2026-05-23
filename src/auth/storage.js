export const STORAGE_KEYS = {
  USERS: 'erp_users',
  ADMIN_PASSWORD: 'erp_admin_password',
  SESSION: 'erp_active_session'
};

const DEFAULT_ADMIN_PASSWORD = '0707';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const authStorage = {
  ensureDefaults() {
    const admin = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    if (!admin) localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  },

  getUsers() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.USERS), []);
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getSession() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.SESSION), null);
  },

  setSession(session) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getAdminPassword() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  },

  setAdminPassword(password) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
  }
};
