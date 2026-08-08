'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import useAuth from '../../../hooks/useAuth';
import api from '../../../utils/api';
import { ADMIN_BASE } from '../../../utils/constants';

const LOGIN_PATH = `${ADMIN_BASE}/login`;

export default function AdminLayout({ children }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { user, ready } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState([]);
  const [badges, setBadges] = useState({});
  const [siteName, setSiteName] = useState('لوحة التحكم');

  const isLogin = pathname === LOGIN_PATH;

  useEffect(() => {
    const saved = localStorage.getItem('admin:collapsed');
    if (saved === '1') setCollapsed(true);
  }, []);
  useEffect(() => { localStorage.setItem('admin:collapsed', collapsed ? '1' : '0'); }, [collapsed]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!ready || isLogin) return;
    if (!user) router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, isLogin, pathname, router]);

  const loadBadges = useCallback(async () => {
    if (!user) return;
    try {
      const [n, s] = await Promise.all([
        api.get('/notifications', { params: { limit: 12 } }).catch(() => ({ data: {} })),
        api.get('/analytics/overview').catch(() => ({ data: {} })),
      ]);
      setNotifications(n.data?.data || []);
      setUnread(n.data?.unread || 0);
      const cards = s.data?.cards || {};
      setBadges({
        messages: cards.messages?.value || 0,
        quotes: cards.quotes?.value || 0,
        packageRequests: cards.packageRequests || 0,
        applications: cards.applications || 0,
      });
      setMessages((s.data?.latestMessages || []).filter((m) => !m.isRead).slice(0, 5));
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (!user || isLogin) return undefined;
    loadBadges();
    const t = setInterval(loadBadges, 60000);
    return () => clearInterval(t);
  }, [user, isLogin, loadBadges]);

  useEffect(() => {
    api.get('/settings/public').then((r) => setSiteName(r.data?.siteName || 'لوحة التحكم')).catch(() => {});
  }, []);

  if (isLogin) return children;

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-adminbg">
        <div className="text-center">
          <Loader2 className="w-9 h-9 animate-spin text-primary mx-auto" />
          <p className="text-sm text-gray-500 mt-3">جارٍ التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-adminbg" dir="rtl">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        siteName={siteName}
        badges={badges}
      />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:mr-[76px]' : 'lg:mr-64'}`}>
        <AdminNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
          notifications={notifications}
          unread={unread}
          messages={messages}
          onRefreshBadges={loadBadges}
        />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
        <footer className="px-6 py-4 text-center text-xs text-gray-400 border-t border-gray-200 bg-white">
          © {new Date().getFullYear()} {siteName} — جميع الحقوق محفوظة | لوحة التحكم
        </footer>
      </div>
    </div>
  );
}
