import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Folder, ArrowLeft, Users } from 'lucide-react';
import { getBanner, getJobs, getPage } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import SectionTitle from '../../components/shared/SectionTitle';
import EmptyState from '../../components/shared/EmptyState';
import FilterButtons from '../../components/shared/FilterButtons';
import Reveal from '../../components/shared/Reveal';
import Icon from '../../components/shared/Icon';
import { JOB_TYPES } from '../../utils/constants';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'الوظائف', description: 'انضم إلى فريقنا واصنع منتجات رقمية مؤثرة' };

export default async function CareersPage({ searchParams }) {
  const department = searchParams?.department || '';
  const type = searchParams?.type || '';

  const [{ jobs, departments }, banner, culture] = await Promise.all([
    getJobs({ department, type }), getBanner('careers'), getPage('careers'),
  ]);

  const c = culture?.data || {};
  const typeLabel = (v) => JOB_TYPES.find((t) => t.value === v)?.label || v;

  return (
    <>
      <PageBanner
        title={banner?.title || 'الوظائف'}
        subtitle={banner?.subtitle || 'انضم إلى فريق يبني منتجات يستخدمها آلاف الأشخاص'}
        image={banner?.image}
        breadcrumb={[{ label: 'الوظائف' }]}
      />

      {(c.heading || (c.images || []).length > 0) && (
        <section className="section bg-white">
          <div className="container-app grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="eyebrow mb-2">بيئة العمل</p>
              <h2 className="heading mb-4">{c.heading || 'ثقافة العمل لدينا'}</h2>
              <div className="divider-line mb-6" />
              <p className="text-gray-500 leading-loose">{c.text}</p>
              {(c.perks || []).length > 0 && (
                <ul className="grid sm:grid-cols-2 gap-3 mt-7">
                  {c.perks.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 bg-soft rounded-xl px-4 py-3.5">
                      <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                        <Icon name={typeof p === 'object' ? p.icon : 'Check'} className="w-4.5 h-4.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-dark">
                          {typeof p === 'object' ? (p.title || p.text) : p}
                        </span>
                        {typeof p === 'object' && (p.desc || p.description) && (
                          <span className="block text-xs text-gray-500 mt-0.5">{p.desc || p.description}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
            <Reveal delay={120} className="grid grid-cols-2 gap-4">
              {(c.images || []).slice(0, 4).map((img, i) => (
                <div key={i} className={`relative rounded-2xl overflow-hidden ${i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'} ${i === 1 ? 'mt-6' : ''}`}>
                  <Image src={img} alt="بيئة العمل" fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <section className="section-alt">
        <div className="container-app">
          <SectionTitle eyebrow="فرص متاحة" title="الوظائف الشاغرة" text={`${jobs.length} وظيفة متاحة حالياً`} />

          {departments.length > 0 && (
            <FilterButtons items={departments.map((d) => ({ slug: d.name, name: d.name }))} paramName="department" allLabel="كل الأقسام" />
          )}
          <FilterButtons items={JOB_TYPES.map((t) => ({ slug: t.value, name: t.label }))} paramName="type" allLabel="كل الأنواع" />

          {jobs.length ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {jobs.map((j, i) => (
                <Reveal key={j._id} delay={i * 60}>
                  <div className="card p-6 flex flex-col md:flex-row md:items-center gap-5 hover:shadow-hover hover:border-primary/30 transition-all duration-300">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-dark mb-2.5">{j.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-400 mb-3">
                        {j.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{j.location}</span>}
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{typeLabel(j.type)}</span>
                        {j.department && <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" />{j.department}</span>}
                        {j.applicationsCount > 0 && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{j.applicationsCount} متقدم</span>}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: (j.description || '').replace(/<[^>]+>/g, ' ').slice(0, 220) }} />
                    </div>
                    <Link href={`/careers/${j.slug}`} className="btn-primary btn-sm shrink-0 self-start md:self-center">
                      التفاصيل والتقديم <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد وظائف متاحة حالياً" text="تابعنا لمعرفة الفرص الجديدة، أو أرسل سيرتك الذاتية عبر صفحة التواصل." />
          )}
        </div>
      </section>
    </>
  );
}
