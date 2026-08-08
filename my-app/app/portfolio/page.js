import { getBanner, getProjectCategories, getProjects, getSettings } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import ProjectCard from '../../components/shared/ProjectCard';
import FilterButtons from '../../components/shared/FilterButtons';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import Reveal from '../../components/shared/Reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  return { title: 'معرض الأعمال', description: `مشاريع نفذتها ${s.siteName}` };
}

const PER_PAGE = 9;

export default async function PortfolioPage({ searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const category = searchParams?.category || '';

  const [{ items, pages, total }, categories, banner] = await Promise.all([
    getProjects({ category, page, perPage: PER_PAGE }),
    getProjectCategories(),
    getBanner('portfolio'),
  ]);

  return (
    <>
      <PageBanner
        title={banner?.title || 'معرض الأعمال'}
        subtitle={banner?.subtitle || 'مشاريع حقيقية سلّمناها لعملاء في قطاعات مختلفة'}
        image={banner?.image}
        breadcrumb={[{ label: 'معرض الأعمال' }]}
      />

      <section className="section-alt">
        <div className="container-app">
          <FilterButtons items={categories} paramName="category" />

          {items.length ? (
            <>
              <p className="text-center text-gray-400 text-sm mb-8">{total} مشروع</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((p, i) => (
                  <Reveal key={p._id} delay={(i % 3) * 80}><ProjectCard project={p} /></Reveal>
                ))}
              </div>
              <Pagination page={page} pages={pages} basePath="/portfolio" query={{ category }} />
            </>
          ) : (
            <EmptyState title="لا توجد مشاريع في هذا التصنيف" text="جرّب اختيار تصنيف آخر." />
          )}
        </div>
      </section>
    </>
  );
}
