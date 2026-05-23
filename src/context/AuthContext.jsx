import React, { createContext, useContext, useMemo, useState } from 'react';
import { authenticateUser, initAuthData, logoutUser, validateSession } from '../auth/utils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  initAuthData();
  const [session, setSession] = useState(validateSession());

  const login = (username, password) => {
    const next = authenticateUser(username, password);
    if (!next) return false;
    setSession(next);
    return true;
  };

  const logout = () => {
    logoutUser();
    setSession(null);
  };

  const value = useMemo(() => ({
    session,
    isAuthenticated: !!session,
    login,
    logout
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
