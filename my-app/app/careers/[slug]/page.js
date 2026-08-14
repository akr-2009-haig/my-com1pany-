import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Folder, Banknote, CalendarDays } from 'lucide-react';
import { getJob, getSettings } from '../../../lib/data';
import PageBanner from '../../../components/shared/PageBanner';
import ApplicationForm from '../../../components/forms/ApplicationForm';
import { formatDate } from '../../../utils/formatDate';
import { JOB_TYPES } from '../../../utils/constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const res = await getJob(params.slug);
  if (!res) return { title: 'الوظيفة غير موجودة' };
  return { title: res.job.title, description: (res.job.description || '').replace(/<[^>]+>/g, ' ').slice(0, 160) };
}

const BLOCKS = [
  { key: 'description', title: 'وصف الوظيفة' },
  { key: 'requirements', title: 'المتطلبات والمؤهلات' },
  { key: 'skills', title: 'المهارات المطلوبة' },
  { key: 'benefits', title: 'المزايا' },
];

export default async function JobPage({ params }) {
  const [res, settings] = await Promise.all([getJob(params.slug), getSettings()]);
  if (!res) notFound();
  const { job, others } = res;
  const typeLabel = JOB_TYPES.find((t) => t.value === job.type)?.label || job.type;

  const meta = [
    { Icon: Folder, label: 'القسم', value: job.department },
    { Icon: Clock, label: 'نوع الدوام', value: typeLabel },
    { Icon: MapPin, label: 'الموقع', value: job.location },
    { Icon: Banknote, label: 'الراتب', value: job.salaryRange },
    { Icon: CalendarDays, label: 'آخر موعد للتقديم', value: job.deadline ? formatDate(job.deadline) : '' },
  ].filter((m) => m.value);

  return (
    <>
      <PageBanner
        title={job.title}
        subtitle={[job.department, typeLabel, job.location].filter(Boolean).join(' • ')}
        breadcrumb={[{ label: 'الوظائف', href: '/careers' }, { label: job.title }]}
      />

      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[1fr_340px] gap-10">
          <article>
            <div className="grid sm:grid-cols-2 gap-4 mb-9">
              {meta.map(({ Icon: I, label, value }) => (
                <div key={label} className="flex items-center gap-3.5 bg-soft rounded-xl px-4 py-3.5">
                  <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><I className="w-4.5 h-4.5" /></span>
                  <span>
                    <span className="block text-xs text-gray-400">{label}</span>
                    <span className="block text-sm font-semibold text-dark">{value}</span>
                  </span>
                </div>
              ))}
            </div>

            {BLOCKS.map((b) => (job[b.key] ? (
              <div key={b.key} className="mb-9">
                <h2 className="text-xl font-bold text-dark mb-4">{b.title}</h2>
                <div className="prose-rtl" dangerouslySetInnerHTML={{ __html: job[b.key] }} />
              </div>
            ) : null))}

            {others.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-xl font-bold text-dark mb-5">وظائف أخرى</h2>
                <ul className="space-y-3">
                  {others.map((o) => (
                    <li key={o._id}>
                      <Link href={`/careers/${o.slug}`} className="card p-4 flex items-center justify-between gap-4 hover:border-primary transition-colors">
                        <span>
                          <span className="block font-semibold text-dark text-sm">{o.title}</span>
                          <span className="block text-xs text-gray-400 mt-0.5">{[o.department, o.location].filter(Boolean).join(' • ')}</span>
                        </span>
                        <span className="text-primary text-sm font-semibold shrink-0">عرض</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <div className="lg:sticky lg:top-28 self-start">
            <ApplicationForm jobId={job._id} jobTitle={job.title} dropdowns={settings.dropdowns} />
          </div>
        </div>
      </section>
    </>
  );
}
