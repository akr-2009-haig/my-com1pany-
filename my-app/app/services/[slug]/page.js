import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Check, Phone, Mail, Download, FileText } from 'lucide-react';
import { getService, getSettings } from '../../../lib/data';
import PageBanner from '../../../components/shared/PageBanner';
import ProjectCard from '../../../components/shared/ProjectCard';
import Icon from '../../../components/shared/Icon';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const res = await getService(params.slug);
  if (!res) return { title: 'الخدمة غير موجودة' };
  const { service } = res;
  return {
    title: service.seoTitle || service.title,
    description: service.seoDesc || service.shortDesc,
    keywords: service.keywords || '',
    openGraph: { title: service.title, description: service.shortDesc, images: service.image ? [service.image] : [] },
  };
}

export default async function ServiceDetailPage({ params }) {
  const [res, settings] = await Promise.all([getService(params.slug), getSettings()]);
  if (!res) notFound();
  const { service, siblings, projects } = res;

  return (
    <>
      <PageBanner
        title={service.title}
        subtitle={service.shortDesc}
        image={service.bannerImage || service.image}
        breadcrumb={[{ label: 'الخدمات', href: '/services' }, { label: service.title }]}
      />

      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[1fr_320px] gap-10">
          {/* main */}
          <article>
            {service.image && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-card">
                <Image src={service.image} alt={service.title} fill sizes="(max-width:1024px) 100vw, 70vw" className="object-cover" priority />
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-5">{service.title}</h2>
            {service.description
              ? <div className="prose-rtl" dangerouslySetInnerHTML={{ __html: service.description }} />
              : <p className="text-gray-500 leading-loose">{service.shortDesc}</p>}

            {(service.features || []).length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold text-dark mb-5">مميزات هذه الخدمة</h3>
                <ul className="grid sm:grid-cols-2 gap-3.5">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 bg-soft rounded-xl px-4 py-3.5">
                      <span className="w-6 h-6 rounded-full bg-primary text-white grid place-items-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      <span className="text-gray-700 text-sm">{f.text || f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(service.technologies || []).length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold text-dark mb-5">التقنيات المستخدمة</h3>
                <div className="flex flex-wrap gap-3">
                  {service.technologies.map((t, i) => (
                    <span key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors">
                      {t.logo
                        ? <Image src={t.logo} alt={t.name} width={22} height={22} className="w-5.5 h-5.5 object-contain" style={{ width: 22, height: 22 }} />
                        : <Icon name="Code2" className="w-4 h-4 text-primary" />}
                      {t.name || t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-dark mb-5">مشاريع مرتبطة</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
                </div>
              </div>
            )}
          </article>

          {/* sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            <div className="card p-5">
              <h3 className="font-bold text-dark mb-4">كل الخدمات</h3>
              <ul className="space-y-1">
                {siblings.map((s) => {
                  const active = s.slug === service.slug;
                  return (
                    <li key={s._id}>
                      <Link
                        href={`/services/${s.slug}`}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-colors
                          ${active ? 'bg-primary text-white font-semibold' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'}`}
                      >
                        <Icon name={s.icon} className="w-4 h-4" />
                        <span className="line-clamp-1">{s.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-primary text-white p-6 text-center">
              <h3 className="font-bold text-lg mb-2">اطلب هذه الخدمة</h3>
              <p className="text-white/85 text-sm mb-5">أخبرنا بتفاصيل مشروعك واحصل على عرض سعر مفصّل خلال 48 ساعة.</p>
              <Link href={`/quote?service=${encodeURIComponent(service.title)}`} className="btn-white w-full">اطلب عرض سعر</Link>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-dark mb-3">تحتاج مساعدة؟</h3>
              <ul className="space-y-3 text-sm">
                {settings.phone && (
                  <li><a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 text-gray-600 hover:text-primary">
                    <Phone className="w-4 h-4 text-primary" /><span dir="ltr">{settings.phone}</span></a></li>
                )}
                {settings.email && (
                  <li><a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-gray-600 hover:text-primary break-all">
                    <Mail className="w-4 h-4 text-primary" /><span dir="ltr">{settings.email}</span></a></li>
                )}
              </ul>
            </div>

            {settings.companyProfile && (
              <a href={settings.companyProfile} target="_blank" rel="noopener noreferrer"
                className="card p-5 flex items-center gap-3.5 hover:border-primary transition-colors group">
                <span className="w-11 h-11 rounded-xl bg-danger/10 text-danger grid place-items-center shrink-0"><FileText className="w-5 h-5" /></span>
                <span className="flex-1">
                  <span className="block font-bold text-dark text-sm">بروفايل الشركة</span>
                  <span className="block text-gray-400 text-xs">ملف PDF تعريفي</span>
                </span>
                <Download className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary" />
              </a>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
