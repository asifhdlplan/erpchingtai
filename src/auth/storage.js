import { supabase } from '../services/supabaseClient';

export const STORAGE_KEYS = {
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
  async ensureDefaults() {
    try {
      const { data, error } = await supabase
        .from('erp_settings')
        .select('value')
        .eq('key', 'admin_password')
        .maybeSingle();

      if (!data && !error) {
        await supabase.from('erp_settings').insert({ key: 'admin_password', value: DEFAULT_ADMIN_PASSWORD });
      }
    } catch (e) {
      console.error('Failed to ensure default settings:', e);
    }
  },

  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('erp_users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to get users:', e);
      return [];
    }
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
