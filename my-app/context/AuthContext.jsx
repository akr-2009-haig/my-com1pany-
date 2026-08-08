'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import api from '../utils/api';
import { can as canFn } from '../lib/permissions';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) { setUser(null); setLoading(false); setReady(true); return null; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch (e) {
      if (e?.response?.status === 401) localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /**
   * Resolves with { twoFactorRequired, userId } when a second factor is needed,
   * otherwise with { user }.
   */
  const login = useCallback(async (email, password, remember = false) => {
    const { data } = await api.post('/auth/login', { email, password, remember });
    if (data.twoFactorRequired) return data;
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  }, []);

  const verifyTwoFactor = useCallback(async (userId, code) => {
    const { data } = await api.post('/auth/2fa', { userId, code });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const can = useCallback((moduleKey, action = 'view') => canFn(user, moduleKey, action), [user]);

  const value = useMemo(
    () => ({ user, setUser, loading, ready, login, verifyTwoFactor, logout, refresh, can }),
    [user, loading, ready, login, verifyTwoFactor, logout, refresh, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext) || {
    user: null, loading: false, ready: true, can: () => false,
  };
}
