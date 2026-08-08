import { getBanner, getFaqs } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import FaqTabs from '../../components/shared/FaqTabs';
import EmptyState from '../../components/shared/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'الأسئلة الشائعة', description: 'إجابات على أكثر الأسئلة تكراراً' };

export default async function FaqPage() {
  const [{ faqs, categories }, banner] = await Promise.all([getFaqs(), getBanner('faq')]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: (f.answer || '').replace(/<[^>]+>/g, ' ') },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageBanner
        title={banner?.title || 'الأسئلة الشائعة'}
        subtitle={banner?.subtitle || 'إجابات سريعة على أكثر ما يسأل عنه عملاؤنا'}
        image={banner?.image}
        breadcrumb={[{ label: 'الأسئلة الشائعة' }]}
      />

      <section className="section bg-white">
        <div className="container-app max-w-3xl">
          {faqs.length
            ? <FaqTabs faqs={faqs} categories={categories} />
            : <EmptyState title="لا توجد أسئلة بعد" />}
        </div>
      </section>
    </>
  );
}
