import Link from 'next/link';
import Image from 'next/image';
import { getBlogSidebar } from '../../lib/data';
import BlogSearch from './BlogSearch';
import { formatDate } from '../../utils/formatDate';

export default async function BlogSidebar({ active = {} }) {
  const { categories, tags, latest } = await getBlogSidebar();

  return (
    <aside className="space-y-6 lg:sticky lg:top-28 self-start">
      <div className="card p-5">
        <h3 className="font-bold text-dark mb-4">ابحث في المدونة</h3>
        <BlogSearch defaultValue={active.search || ''} />
      </div>

      {categories.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">التصنيفات</h3>
          <ul className="space-y-1">
            {categories.map((c) => (
              <li key={c._id}>
                <Link
                  href={`/blog?category=${c.slug}`}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors
                    ${active.category === c.slug ? 'bg-primary text-white font-semibold' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'}`}
                >
                  <span>{c.name}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${active.category === c.slug ? 'bg-white/20' : 'bg-gray-100'}`}>{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {latest.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">أحدث المقالات</h3>
          <ul className="space-y-4">
            {latest.map((p) => (
              <li key={p._id}>
                <Link href={`/blog/${p.slug}`} className="flex gap-3 group">
                  <span className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {p.image && <Image src={p.image} alt={p.title} fill sizes="64px" className="object-cover transition-transform duration-300 group-hover:scale-110" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-dark line-clamp-2 group-hover:text-primary transition-colors">{p.title}</span>
                    <span className="block text-xs text-gray-400 mt-1">{formatDate(p.publishAt || p.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-dark mb-4">الوسوم</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t._id} href={`/blog?tag=${encodeURIComponent(t.name)}`}
                className={`badge transition-colors ${active.tag === t.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary hover:text-white'}`}
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
