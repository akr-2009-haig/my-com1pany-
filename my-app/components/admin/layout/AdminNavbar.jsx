'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bell, ChevronDown, ExternalLink, LogOut, Mail, Menu, PanelRightClose, PanelRightOpen,
  Settings as SettingsIcon, User as UserIcon, Check, Trash2,
} from 'lucide-react';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { ADMIN_BASE } from '../../../utils/constants';
import { timeAgo } from '../../../utils/formatDate';

function Dropdown({ open, children, className = '' }) {
  if (!open) return null;
  return (
    <div className={`absolute top-full mt-2 left-0 bg-white rounded-xl shadow-hover border border-gray-100 z-50 animate-fadeIn ${className}`}>
      {children}
    </div>
  );
}

export default function AdminNavbar({
  collapsed, setCollapsed, setMobileOpen, notifications = [], unread = 0, messages = [], onRefreshBadges,
}) {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name));

  const markAll = async () => {
    try { await api.patch('/notifications/read-all'); onRefreshBadges?.(); } catch { /* ignore */ }
  };
  const markOne = async (id) => {
    try { await api.patch(`/notifications/${id}/read`); onRefreshBadges?.(); } catch { /* ignore */ }
  };
  const removeOne = async (id) => {
    try { await api.delete(`/notifications/${id}`); onRefreshBadges?.(); } catch { /* ignore */ }
  };

  const initials = (user?.name || 'A').trim().charAt(0);

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center gap-2 px-3 sm:px-5"
    >
      <button type="button" onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 grid place-items-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="القائمة">
        <Menu className="w-5 h-5" />
      </button>
      <button type="button" onClick={() => setCollapsed(!collapsed)} className="hidden lg:grid w-9 h-9 place-items-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="طي القائمة">
        {collapsed ? <PanelRightOpen className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
      </button>

      <span className="flex-1" />

      <a href="/" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-50">
        <ExternalLink className="w-4 h-4" /> زيارة الموقع
      </a>

      {/* Messages shortcut */}
      <div className="relative">
        <button type="button" onClick={() => toggle('messages')} className="w-10 h-10 grid place-items-center rounded-lg text-gray-600 hover:bg-gray-100 relative" aria-label="الرسائل">
          <Mail className="w-5 h-5" />
          {messages.length ? <span className="absolute top-1.5 left-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center">{messages.length}</span> : null}
        </button>
        <Dropdown open={openMenu === 'messages'} className="w-80">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-bold text-sm">أحدث الرسائل</h4>
            <Link href={`${ADMIN_BASE}/messages`} onClick={() => setOpenMenu(null)} className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {messages.length ? messages.map((m) => (
              <Link key={m._id} href={`${ADMIN_BASE}/messages`} onClick={() => setOpenMenu(null)} className="flex gap-3 px-4 py-3 hover:bg-gray-50">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">{(m.name || '?').charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-dark truncate">{m.name}</span>
                  <span className="block text-xs text-gray-500 truncate">{m.subject || m.message}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{timeAgo(m.createdAt)}</span>
                </span>
              </Link>
            )) : <p className="px-4 py-8 text-center text-sm text-gray-400">لا توجد رسائل جديدة</p>}
          </div>
        </Dropdown>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button type="button" onClick={() => toggle('notif')} className="w-10 h-10 grid place-items-center rounded-lg text-gray-600 hover:bg-gray-100 relative" aria-label="التنبيهات">
          <Bell className="w-5 h-5" />
          {unread ? <span className="absolute top-1.5 left-1.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold grid place-items-center">{unread > 99 ? '99+' : unread}</span> : null}
        </button>
        <Dropdown open={openMenu === 'notif'} className="w-80">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-bold text-sm">التنبيهات</h4>
            {unread ? <button type="button" onClick={markAll} className="text-xs text-primary hover:underline flex items-center gap-1"><Check className="w-3 h-3" /> تعليم الكل كمقروء</button> : null}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length ? notifications.map((n) => (
              <div key={n._id} className={`flex gap-2 px-4 py-3 hover:bg-gray-50 ${n.isRead ? '' : 'bg-primary/[.04]'}`}>
                <Link href={n.link || '#'} onClick={() => { markOne(n._id); setOpenMenu(null); }} className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-dark truncate">{n.title}</span>
                  {n.body ? <span className="block text-xs text-gray-500 line-clamp-2">{n.body}</span> : null}
                  <span className="block text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</span>
                </Link>
                <button type="button" onClick={() => removeOne(n._id)} className="text-gray-300 hover:text-danger shrink-0" aria-label="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )) : <p className="px-4 py-8 text-center text-sm text-gray-400">لا توجد تنبيهات</p>}
          </div>
        </Dropdown>
      </div>

      {/* Profile */}
      <div className="relative">
        <button type="button" onClick={() => toggle('profile')} className="flex items-center gap-2 px-1.5 sm:px-2 py-1.5 rounded-lg hover:bg-gray-100">
          {user?.avatar
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            : <span className="w-9 h-9 rounded-full bg-dark text-white grid place-items-center font-bold text-sm">{initials}</span>}
          <span className="hidden md:block text-right leading-tight">
            <span className="block text-sm font-bold text-dark max-w-[130px] truncate">{user?.name || '—'}</span>
            <span className="block text-[11px] text-gray-400">{user?.roleName || user?.role}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
        </button>
        <Dropdown open={openMenu === 'profile'} className="w-56 py-1.5">
          <div className="px-4 py-2.5 border-b border-gray-100 md:hidden">
            <p className="text-sm font-bold text-dark truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <Link href={`${ADMIN_BASE}/profile`} onClick={() => setOpenMenu(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <UserIcon className="w-4 h-4 text-gray-400" /> الملف الشخصي
          </Link>
          <Link href={`${ADMIN_BASE}/settings`} onClick={() => setOpenMenu(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <SettingsIcon className="w-4 h-4 text-gray-400" /> الإعدادات
          </Link>
          <hr className="my-1.5 border-gray-100" />
          <button
            type="button"
            onClick={async () => { await logout(); window.location.href = `${ADMIN_BASE}/login`; }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
