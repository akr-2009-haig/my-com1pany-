import { getBanner, getPosts } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import BlogCard from '../../components/shared/BlogCard';
import BlogSidebar from '../../components/blog/BlogSidebar';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'المدونة', description: 'مقالات ورؤى تقنية من فريقنا' };

const PER_PAGE = 6;

export default async function BlogPage({ searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const category = searchParams?.category || '';
  const tag = searchParams?.tag || '';
  const search = searchParams?.search || '';

  const [{ items, pages, total }, banner] = await Promise.all([
    getPosts({ page, perPage: PER_PAGE, category, tag, search }),
    getBanner('blog'),
  ]);

  return (
    <>
      <PageBanner
        title={banner?.title || 'المدونة'}
        subtitle={banner?.subtitle || 'مقالات ورؤى تقنية من فريقنا'}
        image={banner?.image}
        breadcrumb={[{ label: 'المدونة' }]}
      />

      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            {(search || category || tag) && (
              <p className="mb-6 text-sm text-gray-500">
                نتائج البحث{search ? ` عن «${search}»` : ''}{tag ? ` — الوسم: ${tag}` : ''} — {total} مقال
              </p>
            )}
            {items.length ? (
              <>
                <div className="space-y-7">
                  {items.map((p) => <BlogCard key={p._id} post={p} horizontal />)}
                </div>
                <Pagination page={page} pages={pages} basePath="/blog" query={{ category, tag, search }} />
              </>
            ) : (
              <EmptyState title="لا توجد مقالات" text="لم نعثر على مقالات مطابقة. جرّب كلمات بحث أخرى." />
            )}
          </div>

          <BlogSidebar active={{ category, tag, search }} />
        </div>
      </section>
    </>
  );
}
