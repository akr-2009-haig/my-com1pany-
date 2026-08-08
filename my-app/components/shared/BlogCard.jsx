import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, User, ArrowLeft, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function BlogCard({ post, horizontal = false }) {
  const img = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80';
  const category = (post.categoryList || [])[0];

  if (horizontal) {
    return (
      <article className="card-hover overflow-hidden grid sm:grid-cols-[40%_1fr]">
        <Link href={`/blog/${post.slug}`} className="relative block h-52 sm:h-full min-h-[200px] overflow-hidden group">
          <Image src={img} alt={post.title} fill sizes="(max-width:640px) 100vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          {category && <span className="absolute top-3 right-3 badge bg-primary text-white">{category.name}</span>}
        </Link>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{formatDate(post.publishAt || post.createdAt)}</span>
            {post.authorName && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.authorName}</span>}
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime || 3} دقائق</span>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2.5 line-clamp-2">
            <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group">
            اقرأ المزيد <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="card-hover overflow-hidden flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="relative block h-52 overflow-hidden group">
        <Image src={img} alt={post.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        {category && <span className="absolute top-3 right-3 badge bg-primary text-white">{category.name}</span>}
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{formatDate(post.publishAt || post.createdAt)}</span>
          {post.authorName && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.authorName}</span>}
        </div>
        <h3 className="text-lg font-bold text-dark mb-2.5 line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group">
          اقرأ المزيد <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
