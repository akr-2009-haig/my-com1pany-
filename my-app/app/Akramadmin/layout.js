'use client';

import { AuthProvider } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/layout/AdminLayout';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}
