import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { getBanner, getPage, getServices } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import QuoteForm from '../../components/forms/QuoteForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'اطلب عرض سعر', description: 'احصل على عرض سعر مفصّل لمشروعك خلال 48 ساعة' };

const PERKS = [
  { Icon: Clock, title: 'رد خلال 48 ساعة', text: 'نراجع طلبك ونرسل لك عرضاً مفصّلاً سريعاً.' },
  { Icon: CheckCircle2, title: 'استشارة مجانية', text: 'جلسة تحليل أولية لمتطلبات مشروعك دون أي التزام.' },
  { Icon: ShieldCheck, title: 'سرية تامة', text: 'بياناتك وأفكارك محفوظة ولا تُشارك مع أي طرف ثالث.' },
];

export default async function QuotePage() {
  const [page, services, banner] = await Promise.all([getPage('quote'), getServices({ limit: 0 }), getBanner('quote')]);

  return (
    <>
      <PageBanner
        title={banner?.title || 'اطلب عرض سعر'}
        subtitle={banner?.subtitle || 'أخبرنا بتفاصيل مشروعك وسنعود إليك بعرض مفصّل'}
        image={banner?.image}
        breadcrumb={[{ label: 'اطلب عرض سعر' }]}
      />

      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[1fr_300px] gap-10 items-start">
          <div className="card p-6 md:p-9">
            <QuoteForm config={page?.data} services={services} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            {PERKS.map(({ Icon: I, title, text }) => (
              <div key={title} className="card p-5 flex gap-3.5">
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><I className="w-5 h-5" /></span>
                <span>
                  <span className="block font-bold text-dark text-sm mb-1">{title}</span>
                  <span className="block text-gray-500 text-xs leading-relaxed">{text}</span>
                </span>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
