'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';

export default function Navbar({ settings, menu = [], services = [] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSub, setOpenSub] = useState(null);

  useEffect(() => { setOpen(false); setOpenSub(null); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (url) => (url === '/' ? pathname === '/' : pathname.startsWith(url));

  const items = (menu.length ? menu : [
    { _id: 'h', title: 'الرئيسية', url: '/' },
    { _id: 'a', title: 'من نحن', url: '/about' },
    { _id: 's', title: 'الخدمات', url: '/services' },
    { _id: 'p', title: 'معرض الأعمال', url: '/portfolio' },
    { _id: 'pr', title: 'الباقات', url: '/pricing' },
    { _id: 'b', title: 'المدونة', url: '/blog' },
    { _id: 'c', title: 'الوظائف', url: '/careers' },
    { _id: 'ct', title: 'تواصل معنا', url: '/contact' },
  ]).map((item) => {
    if (item.url === '/services' && services.length && !(item.children || []).length) {
      return { ...item, children: services.map((s) => ({ _id: s._id, title: s.title, url: `/services/${s.slug}` })) };
    }
    return item;
  });

  const bilingual = settings?.languages?.bilingual;

  return (
    <nav className={`bg-white transition-shadow duration-300 ${scrolled ? 'shadow-nav' : 'shadow-sm'}`}>
      <div className="container-app flex items-center justify-between h-[68px] gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={settings?.siteName}>
          {settings?.logo ? (
            <Image src={settings.logo} alt={settings.siteName || ''} width={150} height={44} className="h-10 w-auto object-contain" priority />
          ) : (
            <span className="font-black text-xl md:text-2xl text-dark">
              {(settings?.siteName || 'MyCompany').split(' ')[0]}
              <span className="text-primary">{(settings?.siteName || '').split(' ').slice(1).join(' ') ? ` ${(settings?.siteName || '').split(' ').slice(1).join(' ')}` : 'Tech'}</span>
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {items.map((item) => {
            const active = isActive(item.url);
            const hasChildren = (item.children || []).length > 0;
            return (
              <li key={item._id || item.url} className="relative group">
                <Link
                  href={item.url}
                  target={item.target || '_self'}
                  className={`flex items-center gap-1 px-3 py-2 text-[15px] font-medium rounded-lg transition-colors relative
                    ${active ? 'text-primary' : 'text-[#333] hover:text-primary'}`}
                >
                  {item.title}
                  {hasChildren && <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />}
                  <span className={`absolute bottom-0 right-3 left-3 h-0.5 bg-primary rounded-full transition-transform origin-right
                    ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  />
                </Link>
                {hasChildren && (
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                    <ul className="bg-white rounded-xl shadow-hover border border-gray-100 py-2 min-w-[240px]">
                      {item.children.map((c) => (
                        <li key={c._id || c.url}>
                          <Link href={c.url} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors">
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/quote" className="hidden sm:inline-flex btn-primary btn-sm">اطلب عرض سعر</Link>
          {bilingual && (
            <button type="button" className="hidden lg:flex items-center gap-1 text-sm text-gray-600 hover:text-primary px-2 py-2" aria-label="تغيير اللغة">
              <Globe className="w-4 h-4" />
              <span>{settings?.languages?.defaultLang === 'en' ? 'EN' : 'ع'}</span>
            </button>
          )}
          <button
            type="button" onClick={() => setOpen(true)} aria-label="فتح القائمة"
            className="lg:hidden w-10 h-10 grid place-items-center text-primary rounded-lg hover:bg-primary/10"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
        <aside
          className={`absolute top-0 bottom-0 right-0 w-[82%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b">
            <span className="font-bold text-dark">{settings?.siteName}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            {items.map((item) => {
              const hasChildren = (item.children || []).length > 0;
              const expanded = openSub === (item._id || item.url);
              return (
                <div key={item._id || item.url} className="border-b border-gray-50 last:border-0">
                  <div className="flex items-center">
                    <Link
                      href={item.url}
                      className={`flex-1 px-5 py-3.5 text-[17px] font-medium ${isActive(item.url) ? 'text-primary' : 'text-gray-700'}`}
                    >
                      {item.title}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button" aria-label="عرض الفروع"
                        onClick={() => setOpenSub(expanded ? null : (item._id || item.url))}
                        className="px-4 py-3.5 text-gray-400"
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {hasChildren && expanded && (
                    <div className="bg-gray-50/70 pb-2">
                      {item.children.map((c) => (
                        <Link key={c._id || c.url} href={c.url} className="block px-9 py-2.5 text-sm text-gray-600">{c.title}</Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-5 border-t">
            <Link href="/quote" className="btn-primary w-full">اطلب عرض سعر</Link>
          </div>
        </aside>
      </div>
    </nav>
  );
}
