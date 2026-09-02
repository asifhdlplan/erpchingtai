import { authStorage, getFromLocalStorage, saveToLocalStorage, deleteFromLocalStorage } from './storage';
import { supabase } from '../services/supabaseClient';

const nowISO = () => new Date().toISOString();

export const initAuthData = () => authStorage.ensureDefaults();

export const authenticateUser = async (username, password) => {
  const cleanUsername = username.trim();
  const approvers = await authStorage.getApprovers();
  const isApprover = 
    cleanUsername.toUpperCase() === 'ADMIN' || 
    approvers.map(a => a.toUpperCase()).includes(cleanUsername.toUpperCase());

  try {
    const { data: user, error } = await supabase
      .from('erp_users')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (error || !user) {
      // Database failed or user not in database, attempt local fallback
      const localUsers = getFromLocalStorage();
      const localUser = localUsers.find(u => u.username.toUpperCase() === cleanUsername.toUpperCase());
      if (localUser && localUser.password === password) {
        const session = {
          username: localUser.username,
          employeeName: localUser.employeeName,
          canApprovePlans: isApprover || Boolean(localUser.canApprovePlans),
          loginAt: nowISO()
        };
        authStorage.setSession(session);
        return session;
      }
      return null;
    }

    if (user.password !== password) return null;

    const session = {
      username: user.username,
      employeeName: user.employeeName,
      canApprovePlans: isApprover || Boolean(user.canApprovePlans),
      loginAt: nowISO()
    };
    authStorage.setSession(session);
    return session;
  } catch (e) {
    console.error('Auth database error, checking local fallback:', e);
    const localUsers = getFromLocalStorage();
    const localUser = localUsers.find(u => u.username.toUpperCase() === cleanUsername.toUpperCase());
    if (localUser && localUser.password === password) {
      const session = {
        username: localUser.username,
        employeeName: localUser.employeeName,
        canApprovePlans: isApprover || Boolean(localUser.canApprovePlans),
        loginAt: nowISO()
      };
      authStorage.setSession(session);
      return session;
    }
    return null;
  }
};

export const validateSession = () => {
  const session = authStorage.getSession();
  if (!session?.username || !session?.loginAt) return null;
  return session;
};

export const logoutUser = () => authStorage.clearSession();

export const createUser = async ({ employeeName, username, password, canApprovePlans = false }) => {
  try {
    const trimmedUsername = username.trim();
    
    // Check local storage duplicates
    const localUsers = getFromLocalStorage();
    if (localUsers.some(u => u.username.toUpperCase() === trimmedUsername.toUpperCase())) {
      return { ok: false, message: 'Username already exists.' };
    }

    // Update approvers registry in erp_settings and localStorage
    if (canApprovePlans) {
      const currentApprovers = await authStorage.getApprovers();
      if (!currentApprovers.map(a => a.toUpperCase()).includes(trimmedUsername.toUpperCase())) {
        await authStorage.setApprovers([...currentApprovers, trimmedUsername]);
      }
    }

    const newUser = {
      employeeName: employeeName.trim(),
      username: trimmedUsername,
      password: password,
      canApprovePlans: Boolean(canApprovePlans),
      createdAt: nowISO()
    };

    saveToLocalStorage(newUser);

    try {
      const { error } = await supabase
        .from('erp_users')
        .insert(newUser);

      if (error) {
        // Fallback without canApprovePlans column if missing in Supabase schema
        await supabase
          .from('erp_users')
          .insert({
            employeeName: employeeName.trim(),
            username: trimmedUsername,
            password: password,
            createdAt: nowISO()
          });
      }
    } catch (e) {
      console.warn('Database insert failed, saved to local storage and erp_settings:', e);
    }

    const users = await authStorage.getUsers();
    return { ok: true, users };
  } catch (e) {
    console.error('Failed to create user:', e);
    const users = await authStorage.getUsers();
    return { ok: true, users };
  }
};

export const updateUser = async (username, payload) => {
  try {
    const trimmedNewUsername = payload.username.trim();
    const trimmedEmployeeName = payload.employeeName.trim();
    const canApprovePlans = payload.canApprovePlans !== undefined ? Boolean(payload.canApprovePlans) : false;
    const upperOld = username.toUpperCase();
    const upperNew = trimmedNewUsername.toUpperCase();

    // 1. Update approver registry in erp_settings & localStorage
    const currentApprovers = await authStorage.getApprovers();
    let nextApprovers = currentApprovers.filter(a => a.toUpperCase() !== upperOld);
    if (canApprovePlans) {
      nextApprovers.push(trimmedNewUsername);
    }
    await authStorage.setApprovers(nextApprovers);

    // 2. Check local duplicates if username changed
    if (upperOld !== upperNew) {
      const localUsers = getFromLocalStorage();
      if (localUsers.some(u => u.username.toUpperCase() === upperNew)) {
        return { ok: false, message: 'Username already exists.' };
      }
    }

    // 3. Update in local storage
    const localUsers = getFromLocalStorage();
    const targetIdx = localUsers.findIndex(u => u.username.toUpperCase() === upperOld);
    if (targetIdx >= 0) {
      localUsers[targetIdx] = {
        ...localUsers[targetIdx],
        username: trimmedNewUsername,
        employeeName: trimmedEmployeeName,
        canApprovePlans
      };
      localStorage.setItem('erp_users', JSON.stringify(localUsers));
    }

    // 4. Update in database (try with canApprovePlans, fallback if column missing in Supabase)
    try {
      const { error } = await supabase
        .from('erp_users')
        .update({
          employeeName: trimmedEmployeeName,
          username: trimmedNewUsername,
          canApprovePlans
        })
        .eq('username', username);

      if (error) {
        // Fallback update without canApprovePlans column
        await supabase
          .from('erp_users')
          .update({
            employeeName: trimmedEmployeeName,
            username: trimmedNewUsername
          })
          .eq('username', username);
      }
    } catch (e) {
      console.warn('Database update fallback triggered:', e);
    }

    // 5. If the updated user is currently logged in, update active session immediately
    const currentSession = authStorage.getSession();
    if (currentSession && currentSession.username.toUpperCase() === upperOld) {
      const updatedSession = {
        ...currentSession,
        username: trimmedNewUsername,
        employeeName: trimmedEmployeeName,
        canApprovePlans: canApprovePlans || upperNew === 'ADMIN'
      };
      authStorage.setSession(updatedSession);
    }

    const users = await authStorage.getUsers();
    return { ok: true, users };
  } catch (e) {
    console.error('Failed to update user:', e);
    const users = await authStorage.getUsers();
    return { ok: true, users };
  }
};

export const resetUserPassword = async (username, password) => {
  try {
    // Reset in local storage
    const localUsers = getFromLocalStorage();
    const target = localUsers.find(u => u.username.toUpperCase() === username.toUpperCase());
    if (target) {
      target.password = password;
      localStorage.setItem('erp_users', JSON.stringify(localUsers));
    }

    // Reset in database
    const { error } = await supabase
      .from('erp_users')
      .update({ password })
      .eq('username', username);

    if (error) {
      console.warn('Failed to reset user password in database, reset locally:', error.message);
    }

    return await authStorage.getUsers();
  } catch (e) {
    console.error('Failed to reset user password:', e);
    return await authStorage.getUsers();
  }
};

export const deleteUser = async (username) => {
  try {
    deleteFromLocalStorage(username);

    // Also remove from approvers registry
    const currentApprovers = await authStorage.getApprovers();
    const nextApprovers = currentApprovers.filter(a => a.toUpperCase() !== username.toUpperCase());
    await authStorage.setApprovers(nextApprovers);

    const { error } = await supabase
      .from('erp_users')
      .delete()
      .eq('username', username);

    if (error) {
      console.warn('Failed to delete user from database, deleted locally:', error.message);
    }

    return await authStorage.getUsers();
  } catch (e) {
    console.error('Failed to delete user:', e);
    return await authStorage.getUsers();
  }
};
