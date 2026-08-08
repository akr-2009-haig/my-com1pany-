import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getMenu, getServices } from '../../lib/data';
import SocialLinks from '../shared/SocialLinks';

export default async function Footer({ settings }) {
  const [menu, services] = await Promise.all([getMenu('footer'), getServices({ limit: 6 })]);
  const year = new Date().getFullYear();

  const links = menu.length ? menu : [
    { _id: '1', title: 'الرئيسية', url: '/' }, { _id: '2', title: 'من نحن', url: '/about' },
    { _id: '3', title: 'الخدمات', url: '/services' }, { _id: '4', title: 'المشاريع', url: '/portfolio' },
    { _id: '5', title: 'المدونة', url: '/blog' }, { _id: '6', title: 'تواصل معنا', url: '/contact' },
  ];

  return (
    <footer className="bg-dark text-white">
      <div className="container-app py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Company */}
        <div>
          {settings?.logoLight || settings?.logo ? (
            <Image src={settings.logoLight || settings.logo} alt={settings.siteName || ''} width={160} height={48} className="h-11 w-auto object-contain mb-4 brightness-0 invert" />
          ) : (
            <h3 className="font-black text-2xl mb-4">{settings?.siteName || 'MyCompany'}</h3>
          )}
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            {settings?.description || 'شريكك التقني الموثوق في رحلة التحول الرقمي.'}
          </p>
          <SocialLinks socials={settings?.socials} />
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-bold text-lg mb-3">روابط سريعة</h4>
          <div className="w-12 h-0.5 bg-primary rounded-full mb-4" />
          <ul className="space-y-2.5">
            {links.map((l) => (
              <li key={l._id || l.url}>
                <Link href={l.url} className="text-gray-400 text-sm hover:text-primary hover:-translate-x-1 inline-block transition-all duration-300">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-bold text-lg mb-3">خدماتنا</h4>
          <div className="w-12 h-0.5 bg-primary rounded-full mb-4" />
          <ul className="space-y-2.5">
            {services.map((s) => (
              <li key={s._id}>
                <Link href={`/services/${s.slug}`} className="text-gray-400 text-sm hover:text-primary hover:-translate-x-1 inline-block transition-all duration-300">
                  {s.title}
                </Link>
              </li>
            ))}
            {!services.length && <li className="text-gray-500 text-sm">لا توجد خدمات بعد</li>}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-lg mb-3">تواصل معنا</h4>
          <div className="w-12 h-0.5 bg-primary rounded-full mb-4" />
          <ul className="space-y-3.5 text-sm text-gray-400">
            {settings?.address && (
              <li className="flex gap-3"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{settings.address}</span></li>
            )}
            {settings?.phone && (
              <li className="flex gap-3"><Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <a href={`tel:${settings.phone}`} dir="ltr" className="hover:text-primary">{settings.phone}</a>
              </li>
            )}
            {settings?.email && (
              <li className="flex gap-3"><Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <a href={`mailto:${settings.email}`} dir="ltr" className="hover:text-primary break-all">{settings.email}</a>
              </li>
            )}
            {settings?.workingHours && (
              <li className="flex gap-3"><Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{settings.workingHours}</span></li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-darker border-t border-white/5">
        <div className="container-app py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>{settings?.copyrightText || 'جميع الحقوق محفوظة'} © {year} {settings?.siteName}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
