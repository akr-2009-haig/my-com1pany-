import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CalendarDays, User, Clock, Eye, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { getPost, getSettings } from '../../../lib/data';
import PageBanner from '../../../components/shared/PageBanner';
import BlogSidebar from '../../../components/blog/BlogSidebar';
import BlogCard from '../../../components/shared/BlogCard';
import ShareButtons from '../../../components/shared/ShareButtons';
import CommentForm from '../../../components/forms/CommentForm';
import { formatDate, timeAgo } from '../../../utils/formatDate';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const res = await getPost(params.slug);
  if (!res) return { title: 'المقال غير موجود' };
  const { post } = res;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
    keywords: post.keywords || (post.tags || []).join(', '),
    openGraph: { title: post.title, description: post.excerpt, type: 'article', images: post.image ? [post.image] : [] },
  };
}

export default async function PostPage({ params }) {
  const [res, settings] = await Promise.all([getPost(params.slug), getSettings()]);
  if (!res) notFound();
  const { post, prev, next, related, comments, author } = res;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || undefined,
    datePublished: post.publishAt || post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.authorName || settings.siteName },
    publisher: { '@type': 'Organization', name: settings.siteName },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageBanner
        title={post.title}
        image={post.image}
        breadcrumb={[{ label: 'المدونة', href: '/blog' }, { label: post.title }]}
      />

      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[1fr_320px] gap-10">
          <article>
            {post.image && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-7 shadow-card">
                <Image src={post.image} alt={post.title} fill sizes="(max-width:1024px) 100vw, 70vw" className="object-cover" priority />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 mb-6 pb-6 border-b">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" />{formatDate(post.publishAt || post.createdAt)}</span>
              {post.authorName && <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" />{post.authorName}</span>}
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />{post.readTime || 3} دقائق قراءة</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-primary" />{post.views || 0} مشاهدة</span>
              {(post.categoryList || []).map((c) => (
                <Link key={c._id} href={`/blog?category=${c.slug}`} className="badge-primary">{c.name}</Link>
              ))}
            </div>

            <div className="prose-rtl" dangerouslySetInnerHTML={{ __html: post.content || `<p>${post.excerpt || ''}</p>` }} />

            {(post.tags || []).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-9">
                <span className="text-sm text-gray-500 ml-1">الوسوم:</span>
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="badge bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors">{t}</Link>
                ))}
              </div>
            )}

            <div className="mt-7 pt-6 border-t"><ShareButtons title={post.title} /></div>

            {author && (
              <div className="mt-9 card p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-right">
                {author.avatar
                  ? <Image src={author.avatar} alt={author.name} width={80} height={80} className="rounded-full object-cover shrink-0" style={{ width: 80, height: 80 }} />
                  : <span className="w-20 h-20 rounded-full bg-primary/10 text-primary grid place-items-center text-2xl font-bold shrink-0">{author.name?.charAt(0)}</span>}
                <div>
                  <p className="text-xs text-primary font-semibold mb-1">كاتب المقال</p>
                  <h3 className="font-bold text-dark text-lg mb-1.5">{author.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{author.bio || 'عضو في فريق المحتوى التقني.'}</p>
                </div>
              </div>
            )}

            {(prev || next) && (
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {prev ? (
                  <Link href={`/blog/${prev.slug}`} className="card p-5 hover:border-primary transition-colors group">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-2"><ArrowRight className="w-3.5 h-3.5" /> المقال السابق</span>
                    <span className="font-semibold text-dark text-sm line-clamp-2 group-hover:text-primary transition-colors">{prev.title}</span>
                  </Link>
                ) : <span />}
                {next ? (
                  <Link href={`/blog/${next.slug}`} className="card p-5 hover:border-primary transition-colors group sm:text-left">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 sm:justify-end">المقال التالي <ArrowLeft className="w-3.5 h-3.5" /></span>
                    <span className="font-semibold text-dark text-sm line-clamp-2 group-hover:text-primary transition-colors">{next.title}</span>
                  </Link>
                ) : null}
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-dark mb-6">مقالات ذات صلة</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {related.map((p) => <BlogCard key={p._id} post={p} />)}
                </div>
              </div>
            )}

            <div className="mt-12">
              <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> التعليقات ({comments.length})
              </h3>
              {comments.length > 0 && (
                <ul className="space-y-4 mb-8">
                  {comments.map((c) => (
                    <li key={c._id} className="card p-5">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold shrink-0">{c.name?.charAt(0)}</span>
                        <div>
                          <p className="font-bold text-dark text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400">{timeAgo(c.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-loose">{c.content}</p>
                    </li>
                  ))}
                </ul>
              )}
              <CommentForm postId={post._id} />
            </div>
          </article>

          <BlogSidebar active={{}} />
        </div>
      </section>
    </>
  );
}
