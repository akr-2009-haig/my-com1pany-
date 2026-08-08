import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ExternalLink, CalendarDays, User, Folder, Target, Lightbulb } from 'lucide-react';
import { getProject } from '../../../lib/data';
import PageBanner from '../../../components/shared/PageBanner';
import ProjectCard from '../../../components/shared/ProjectCard';
import Lightbox from '../../../components/shared/Lightbox';
import ShareButtons from '../../../components/shared/ShareButtons';
import { formatDate } from '../../../utils/formatDate';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const res = await getProject(params.slug);
  if (!res) return { title: 'المشروع غير موجود' };
  const { project } = res;
  return {
    title: project.seoTitle || project.title,
    description: project.seoDesc || project.description?.slice(0, 160),
    keywords: project.keywords || '',
    openGraph: { title: project.title, images: project.cover ? [project.cover] : [] },
  };
}

export default async function ProjectDetailPage({ params }) {
  const res = await getProject(params.slug);
  if (!res) notFound();
  const { project, related } = res;
  const images = (project.images || []).filter(Boolean);
  const cover = project.cover || images[0];

  const meta = [
    { Icon: User, label: 'العميل', value: project.client },
    { Icon: Folder, label: 'التصنيف', value: project.category?.name },
    { Icon: CalendarDays, label: 'تاريخ التنفيذ', value: project.projectDate ? formatDate(project.projectDate) : '' },
  ].filter((m) => m.value);

  return (
    <>
      <PageBanner
        title={project.title}
        subtitle={project.category?.name}
        image={cover}
        breadcrumb={[{ label: 'معرض الأعمال', href: '/portfolio' }, { label: project.title }]}
      />

      <section className="section bg-white">
        <div className="container-app grid lg:grid-cols-[1fr_320px] gap-10">
          <article>
            {cover && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-card">
                <Image src={cover} alt={project.title} fill sizes="(max-width:1024px) 100vw, 70vw" className="object-cover" priority />
              </div>
            )}

            <h2 className="text-2xl font-extrabold text-dark mb-4">نظرة عامة</h2>
            {project.description
              ? <div className="prose-rtl" dangerouslySetInnerHTML={{ __html: project.description }} />
              : null}

            {(project.challenge || project.solution) && (
              <div className="grid md:grid-cols-2 gap-5 mt-9">
                {project.challenge && (
                  <div className="rounded-2xl border border-gray-100 bg-soft p-6">
                    <span className="w-11 h-11 rounded-xl bg-danger/10 text-danger grid place-items-center mb-4"><Target className="w-5 h-5" /></span>
                    <h3 className="font-bold text-dark mb-2">التحدي</h3>
                    <p className="text-gray-600 text-sm leading-loose">{project.challenge}</p>
                  </div>
                )}
                {project.solution && (
                  <div className="rounded-2xl border border-gray-100 bg-soft p-6">
                    <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4"><Lightbulb className="w-5 h-5" /></span>
                    <h3 className="font-bold text-dark mb-2">الحل</h3>
                    <p className="text-gray-600 text-sm leading-loose">{project.solution}</p>
                  </div>
                )}
              </div>
            )}

            {images.length > 1 && (
              <div className="mt-11">
                <h3 className="text-xl font-bold text-dark mb-5">معرض الصور</h3>
                <Lightbox images={images} columns="sm:grid-cols-2 lg:grid-cols-3" aspect="aspect-[4/3]" alt={project.title} />
              </div>
            )}

            {project.videoUrl && (
              <div className="mt-11">
                <h3 className="text-xl font-bold text-dark mb-5">فيديو المشروع</h3>
                <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                  <iframe
                    src={project.videoUrl.replace('watch?v=', 'embed/')}
                    title={project.title} className="w-full h-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  />
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t">
              <ShareButtons title={project.title} />
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            <div className="card p-6">
              <h3 className="font-bold text-dark mb-4">معلومات المشروع</h3>
              <ul className="space-y-4">
                {meta.map(({ Icon: I, label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><I className="w-4 h-4" /></span>
                    <span>
                      <span className="block text-xs text-gray-400">{label}</span>
                      <span className="block text-sm font-semibold text-dark">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {(project.technologies || []).length > 0 && (
                <>
                  <div className="h-px bg-gray-100 my-5" />
                  <p className="text-xs text-gray-400 mb-2.5">التقنيات المستخدمة</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t, i) => (
                      <span key={i} className="badge bg-primary/10 text-primary-700">{t.name || t}</span>
                    ))}
                  </div>
                </>
              )}

              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-6">
                  <ExternalLink className="w-4.5 h-4.5" /> زيارة المشروع
                </a>
              )}
            </div>

            <div className="rounded-2xl bg-dark text-white p-6 text-center">
              <h3 className="font-bold mb-2">مشروعك القادم؟</h3>
              <p className="text-white/70 text-sm mb-5">لنبنِ شيئاً مميزاً معاً.</p>
              <Link href="/quote" className="btn-primary w-full">اطلب عرض سعر</Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-alt">
          <div className="container-app">
            <h2 className="text-2xl font-extrabold text-dark mb-8 text-center">مشاريع مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
