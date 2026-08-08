'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, X, ExternalLink } from 'lucide-react';
import Icon from '../../shared/Icon';
import NAV from './navConfig';
import useAuth from '../../../hooks/useAuth';
import { ADMIN_BASE } from '../../../utils/constants';

export default function AdminSidebar({
  collapsed, setCollapsed, mobileOpen, setMobileOpen, siteName = 'لوحة التحكم', badges = {},
}) {
  const pathname = usePathname() || '';
  const { can } = useAuth();
  const [openGroups, setOpenGroups] = useState({});

  const items = useMemo(
    () => NAV
      .map((item) => {
        if (item.children) {
          const children = item.children.filter((c) => can(c.module, c.action || 'view'));
          return children.length ? { ...item, children } : null;
        }
        return can(item.module) ? item : null;
      })
      .filter(Boolean),
    [can],
  );

  const isActive = (href, exact) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    const next = {};
    items.forEach((item) => {
      if (item.children?.some((c) => isActive(c.href, c.exact))) next[item.label] = true;
    });
    setOpenGroups((g) => ({ ...g, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, items.length]);

  const badgeFor = (key) => (key && badges[key] ? badges[key] : 0);

  const NavLink = ({ item, nested }) => {
    const active = isActive(item.href, item.exact);
    const count = badgeFor(item.badge);
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen?.(false)}
        title={collapsed ? item.label : undefined}
        className={`group relative flex items-center gap-3 rounded-lg transition-all duration-300
          ${nested ? 'pr-11 pl-3 py-2 text-[13px]' : 'px-3 py-2.5 text-sm'}
          ${active
            ? 'bg-primary/15 text-white font-semibold'
            : 'text-white/65 hover:bg-white/[.07] hover:text-white'}`}
      >
        {active ? <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l bg-primary" /> : null}
        {!nested ? <Icon name={item.icon} className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-primary' : ''}`} /> : (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-white/25 group-hover:bg-white/50'}`} />
        )}
        {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
        {!collapsed && count ? (
          <span className="bg-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 grid place-items-center">{count}</span>
        ) : null}
      </Link>
    );
  };

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 h-16 px-4 border-b border-white/10 shrink-0">
        {!collapsed ? (
          <Link href={ADMIN_BASE} className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-primary grid place-items-center text-white font-black shrink-0">A</span>
            <span className="text-white font-bold text-sm truncate">{siteName}</span>
          </Link>
        ) : (
          <span className="w-9 h-9 rounded-xl bg-primary grid place-items-center text-white font-black mx-auto">A</span>
        )}
        <button type="button" onClick={() => setMobileOpen?.(false)} className="lg:hidden text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 no-scrollbar">
        {items.map((item) => {
          if (!item.children) return <NavLink key={item.href} item={item} />;
          const groupActive = item.children.some((c) => isActive(c.href, c.exact));
          const isOpen = openGroups[item.label] ?? groupActive;
          const groupCount = item.children.reduce((a, c) => a + badgeFor(c.badge), 0);
          return (
            <div key={item.label}>
              <button
                type="button"
                title={collapsed ? item.label : undefined}
                onClick={() => (collapsed ? setCollapsed?.(false) : setOpenGroups((g) => ({ ...g, [item.label]: !isOpen })))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300
                  ${groupActive ? 'text-white font-semibold bg-white/[.06]' : 'text-white/65 hover:bg-white/[.07] hover:text-white'}`}
              >
                <Icon name={item.icon} className={`w-[18px] h-[18px] shrink-0 ${groupActive ? 'text-primary' : ''}`} />
                {!collapsed ? (
                  <>
                    <span className="flex-1 text-right truncate">{item.label}</span>
                    {groupCount ? <span className="bg-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 grid place-items-center">{groupCount}</span> : null}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </>
                ) : null}
              </button>
              {!collapsed && isOpen ? (
                <div className="mt-1 space-y-0.5 animate-fadeIn">
                  {item.children.map((c) => <NavLink key={c.href} item={c} nested />)}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/65 hover:bg-white/[.07] hover:text-white transition-colors"
          title="زيارة الموقع"
        >
          <ExternalLink className="w-[18px] h-[18px] shrink-0" />
          {!collapsed ? <span>زيارة الموقع</span> : null}
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-dark fixed inset-y-0 right-0 z-40 transition-all duration-300
          ${collapsed ? 'w-[76px]' : 'w-64'}`}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <button type="button" aria-label="إغلاق" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/50 animate-fadeIn" />
          <aside className="absolute inset-y-0 right-0 w-72 bg-dark flex flex-col shadow-hover">{content}</aside>
        </div>
      ) : null}
    </>
  );
}
