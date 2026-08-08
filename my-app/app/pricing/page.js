import { Check, X } from 'lucide-react';
import { getBanner, getFaqs, getPackages, getSettings } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import PricingPreview from '../../components/home/PricingPreview';
import SectionTitle from '../../components/shared/SectionTitle';
import Accordion from '../../components/shared/Accordion';
import EmptyState from '../../components/shared/EmptyState';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'الباقات والأسعار', description: 'باقات وأسعار خدماتنا البرمجية' };
}

export default async function PricingPage() {
  const [packages, { faqs }, banner, settings] = await Promise.all([
    getPackages(), getFaqs({ pricingOnly: true }), getBanner('pricing'), getSettings(),
  ]);

  // build a comparison matrix out of every distinct feature label
  const labels = [];
  packages.forEach((p) => (p.features || []).forEach((f) => {
    if (f.text && !labels.includes(f.text)) labels.push(f.text);
  }));

  return (
    <>
      <PageBanner
        title={banner?.title || 'الباقات والأسعار'}
        subtitle={banner?.subtitle || 'أسعار شفافة بلا رسوم مخفية'}
        image={banner?.image}
        breadcrumb={[{ label: 'الباقات' }]}
      />

      {packages.length ? (
        <PricingPreview packages={packages} showToggle={settings?.home?.showPricingToggle !== false} alt={false} />
      ) : (
        <section className="section bg-white"><div className="container-app"><EmptyState title="لا توجد باقات منشورة" /></div></section>
      )}

      {labels.length > 0 && packages.length > 1 && (
        <section className="section-alt">
          <div className="container-app">
            <SectionTitle eyebrow="مقارنة" title="مقارنة الباقات" />
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-card">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-dark text-white">
                    <th className="text-right px-5 py-4 font-bold">الميزة</th>
                    {packages.map((p) => (
                      <th key={p._id} className="px-5 py-4 font-bold text-center whitespace-nowrap">
                        {p.name}
                        {p.isPopular && <span className="block text-[11px] font-normal text-primary mt-0.5">الأكثر طلباً</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((label, i) => (
                    <tr key={label} className={i % 2 ? 'bg-soft/60' : 'bg-white'}>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{label}</td>
                      {packages.map((p) => {
                        const f = (p.features || []).find((x) => x.text === label);
                        const ok = f && f.included !== false;
                        return (
                          <td key={p._id} className="px-5 py-3.5 text-center">
                            {ok
                              ? <Check className="w-5 h-5 text-primary mx-auto" strokeWidth={3} />
                              : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section bg-white">
          <div className="container-app max-w-3xl">
            <SectionTitle eyebrow="الأسئلة الشائعة" title="أسئلة حول الباقات" />
            <Accordion items={faqs} defaultOpen={0} />
          </div>
        </section>
      )}
    </>
  );
}
