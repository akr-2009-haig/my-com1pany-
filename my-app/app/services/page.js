import { getBanner, getServices, getSettings } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import ServiceCard from '../../components/shared/ServiceCard';
import EmptyState from '../../components/shared/EmptyState';
import Reveal from '../../components/shared/Reveal';
import CtaSection from '../../components/home/CtaSection';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  return { title: 'خدماتنا', description: `الخدمات البرمجية التي تقدمها ${s.siteName}` };
}

export default async function ServicesPage() {
  const [services, banner] = await Promise.all([getServices({ limit: 0 }), getBanner('services')]);

  return (
    <>
      <PageBanner
        title={banner?.title || 'خدماتنا'}
        subtitle={banner?.subtitle || 'حلول برمجية متكاملة تغطي دورة حياة منتجك الرقمي بالكامل'}
        image={banner?.image}
        breadcrumb={[{ label: 'الخدمات' }]}
      />

      <section className="section bg-white">
        <div className="container-app">
          {services.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <Reveal key={s._id} delay={i * 60}><ServiceCard service={s} /></Reveal>
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد خدمات منشورة بعد" text="سيتم إضافة الخدمات قريباً." />
          )}
        </div>
      </section>

      <CtaSection data={{ heading: 'لم تجد ما تبحث عنه؟', text: 'نصمّم حلولاً مخصّصة تماماً حسب احتياج عملك.', btn1Text: 'تواصل معنا', btn1Link: '/contact', btn2Text: 'اطلب عرض سعر', btn2Link: '/quote' }} />
    </>
  );
}
