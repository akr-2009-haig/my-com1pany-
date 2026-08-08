'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const FALLBACK = {
  user: null,
  loading: false,
  ready: true,
  can: () => false,
  login: async () => { throw new Error('AuthProvider غير مُهيأ'); },
  verifyTwoFactor: async () => { throw new Error('AuthProvider غير مُهيأ'); },
  logout: async () => {},
  refresh: async () => null,
  setUser: () => {},
};

export default function useAuth() {
  return useContext(AuthContext) || FALLBACK;
}
