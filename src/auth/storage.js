import { supabase } from '../services/supabaseClient';

export const STORAGE_KEYS = {
  SESSION: 'erp_active_session',
  USERS: 'erp_users',
  APPROVERS: 'erp_sizing_approvers'
};

const DEFAULT_ADMIN_PASSWORD = '0707';
const DEFAULT_APPROVERS = ['ADMIN', 'ASIF'];

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getFromLocalStorage = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.USERS);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};

export const saveToLocalStorage = (user) => {
  try {
    const users = getFromLocalStorage();
    const idx = users.findIndex(u => u.username.toUpperCase() === user.username.toUpperCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user to localStorage:', e);
  }
};

export const deleteFromLocalStorage = (username) => {
  try {
    const users = getFromLocalStorage();
    const filtered = users.filter(u => u.username.toUpperCase() !== username.toUpperCase());
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete user from localStorage:', e);
  }
};

export const getApproversFromLocalStorage = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.APPROVERS);
    if (!val) {
      localStorage.setItem(STORAGE_KEYS.APPROVERS, JSON.stringify(DEFAULT_APPROVERS));
      return DEFAULT_APPROVERS;
    }
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : DEFAULT_APPROVERS;
  } catch {
    return DEFAULT_APPROVERS;
  }
};

export const saveApproversToLocalStorage = (approvers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPROVERS, JSON.stringify(approvers));
  } catch (e) {
    console.error('Failed to save approvers to localStorage:', e);
  }
};

export const ensureLocalDefaults = () => {
  try {
    const users = getFromLocalStorage();
    if (users.length === 0) {
      const defaultUsers = [
        { username: 'ASIF', employeeName: 'ASIF', password: '0707', canApprovePlans: true, createdAt: new Date().toISOString() },
        { username: 'ADMIN', employeeName: 'System Admin', password: '0707', canApprovePlans: true, createdAt: new Date().toISOString() }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }
    getApproversFromLocalStorage();
  } catch (e) {
    console.error('Failed to ensure local default users:', e);
  }
};

export const authStorage = {
  async ensureDefaults() {
    ensureLocalDefaults();
    try {
      await supabase
        .from('erp_settings')
        .upsert({ key: 'admin_password', value: DEFAULT_ADMIN_PASSWORD });

      await supabase
        .from('erp_settings')
        .upsert({ key: 'sizing_approvers', value: JSON.stringify(DEFAULT_APPROVERS) });
      
      // Seed default users in Supabase database
      const defaultUsers = [
        { username: 'ASIF', employeeName: 'ASIF', password: '0707', createdAt: new Date().toISOString() },
        { username: 'ADMIN', employeeName: 'System Admin', password: '0707', createdAt: new Date().toISOString() }
      ];
      
      for (const u of defaultUsers) {
        await supabase
          .from('erp_users')
          .upsert(u);
      }
    } catch (e) {
      console.error('Failed to ensure default settings/users:', e);
    }
  },

  async getApprovers() {
    try {
      const { data, error } = await supabase
        .from('erp_settings')
        .select('value')
        .eq('key', 'sizing_approvers')
        .maybeSingle();

      if (!error && data?.value) {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) {
          saveApproversToLocalStorage(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch approvers from erp_settings, using local fallback:', e);
    }
    return getApproversFromLocalStorage();
  },

  async setApprovers(approvers) {
    const cleanList = Array.from(new Set(approvers.map(a => a.trim().toUpperCase()))).filter(Boolean);
    saveApproversToLocalStorage(cleanList);
    try {
      await supabase
        .from('erp_settings')
        .upsert({ key: 'sizing_approvers', value: JSON.stringify(cleanList) });
      return true;
    } catch (e) {
      console.warn('Failed to save approvers in erp_settings, saved locally:', e);
      return false;
    }
  },

  async getUsers() {
    ensureLocalDefaults();
    const approvers = await this.getApprovers();
    const approverUpperList = approvers.map(a => a.toUpperCase());

    let rawUsers = [];
    try {
      const { data, error } = await supabase
        .from('erp_users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && data.length > 0) {
        rawUsers = data;
      } else {
        rawUsers = getFromLocalStorage();
      }
    } catch (e) {
      console.error('Failed to get users from database, falling back to local storage:', e);
      rawUsers = getFromLocalStorage();
    }

    // Merge and enrich users with approver status
    const enrichedUsers = rawUsers.map(u => {
      const isApprover = 
        u.username.toUpperCase() === 'ADMIN' || 
        approverUpperList.includes(u.username.toUpperCase()) ||
        Boolean(u.canApprovePlans);

      return {
        ...u,
        canApprovePlans: isApprover
      };
    });

    // Cache enriched users in localStorage
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(enrichedUsers));
    return enrichedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getSession() {
    return safeParse(sessionStorage.getItem(STORAGE_KEYS.SESSION), null);
  },

  setSession(session) {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('session_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  },

  clearSession() {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('session_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  },

  async getAdminPassword() {
    try {
      const { data, error } = await supabase
        .from('erp_settings')
        .select('value')
        .eq('key', 'admin_password')
        .maybeSingle();

      if (error) throw error;
      return data?.value || DEFAULT_ADMIN_PASSWORD;
    } catch (e) {
      console.error('Failed to get admin password:', e);
      return DEFAULT_ADMIN_PASSWORD;
    }
  },

  async setAdminPassword(password) {
    try {
      const { error } = await supabase
        .from('erp_settings')
        .upsert({ key: 'admin_password', value: password });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to update admin password:', e);
      return false;
    }
  }
};
