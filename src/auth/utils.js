import { authStorage } from './storage';
import { supabase } from '../services/supabaseClient';

const nowISO = () => new Date().toISOString();

export const initAuthData = () => authStorage.ensureDefaults();

export const authenticateUser = async (username, password) => {
  try {
    const { data: user, error } = await supabase
      .from('erp_users')
      .select('*')
      .eq('username', username.trim())
      .maybeSingle();

    if (error || !user) return null;
    if (user.password !== password) return null;

    const session = {
      username: user.username,
      employeeName: user.employeeName,
      loginAt: nowISO()
    };
    authStorage.setSession(session);
    return session;
  } catch (e) {
    console.error('Auth error:', e);
    return null;
  }
};

export const validateSession = () => {
  const session = authStorage.getSession();
  if (!session?.username || !session?.loginAt) return null;
  return session;
};

export const logoutUser = () => authStorage.clearSession();

export const createUser = async ({ employeeName, username, password }) => {
  try {
    const trimmedUsername = username.trim();
    // Check if exists
    const { data: existing } = await supabase
      .from('erp_users')
      .select('username')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (existing) {
      return { ok: false, message: 'Username already exists.' };
    }

    const { error } = await supabase
      .from('erp_users')
      .insert({
        employeeName: employeeName.trim(),
        username: trimmedUsername,
        password: password,
        createdAt: nowISO()
      });

    if (error) throw error;

    const users = await authStorage.getUsers();
    return { ok: true, users };
  } catch (e) {
    console.error('Failed to create user:', e);
    return { ok: false, message: e.message || 'Error occurred while creating user.' };
  }
};

export const updateUser = async (username, payload) => {
  try {
    const trimmedNewUsername = payload.username.trim();
    const trimmedEmployeeName = payload.employeeName.trim();

    // Check if new username already exists for a different user
    if (username !== trimmedNewUsername) {
      const { data: existing } = await supabase
        .from('erp_users')
        .select('username')
        .eq('username', trimmedNewUsername)
        .maybeSingle();

      if (existing) {
        return { ok: false, message: 'Username already exists.' };
      }
    }

    const { error } = await supabase
      .from('erp_users')
      .update({
        employeeName: trimmedEmployeeName,
        username: trimmedNewUsername
      })
      .eq('username', username);

    if (error) throw error;

    const users = await authStorage.getUsers();
    return { ok: true, users };
  } catch (e) {
    console.error('Failed to update user:', e);
    return { ok: false, message: e.message || 'Error occurred while updating user.' };
  }
};

export const resetUserPassword = async (username, password) => {
  try {
    const { error } = await supabase
      .from('erp_users')
      .update({ password })
      .eq('username', username);

    if (error) throw error;

    return await authStorage.getUsers();
  } catch (e) {
    console.error('Failed to reset user password:', e);
    return [];
  }
};

export const deleteUser = async (username) => {
  try {
    const { error } = await supabase
      .from('erp_users')
      .delete()
      .eq('username', username);

    if (error) throw error;

    return await authStorage.getUsers();
  } catch (e) {
    console.error('Failed to delete user:', e);
    return [];
  }
};
