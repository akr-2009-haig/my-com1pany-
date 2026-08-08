import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';
import { getPage } from '../lib/data';
import NotFoundSearch from '../components/shared/NotFoundSearch';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'الصفحة غير موجودة' };

export default async function NotFound() {
  const page = await getPage('notfound');
  const d = page?.data || {};

  return (
    <section className="min-h-[70vh] grid place-items-center py-20 bg-white">
      <div className="container-app text-center max-w-xl">
        {d.image ? (
          <div className="relative w-full aspect-[4/3] max-w-sm mx-auto mb-6">
            <Image src={d.image} alt="404" fill sizes="400px" className="object-contain" />
          </div>
        ) : (
          <p className="text-[7rem] sm:text-[10rem] leading-none font-black text-primary/25 select-none">404</p>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">{d.heading || 'الصفحة غير موجودة'}</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {d.text || 'يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.'}
        </p>

        <div className="max-w-md mx-auto mb-7"><NotFoundSearch /></div>

        <Link href={d.buttonLink || '/'} className="btn-primary">
          <Home className="w-4.5 h-4.5" /> {d.buttonText || 'العودة للرئيسية'}
        </Link>
      </div>
    </section>
  );
}
