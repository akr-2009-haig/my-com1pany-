import Image from 'next/image';
import { getAboutData, getBanner, getSettings, getStats } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import SectionTitle from '../../components/shared/SectionTitle';
import StatsBar from '../../components/home/StatsBar';
import AboutPreview from '../../components/home/AboutPreview';
import Icon from '../../components/shared/Icon';
import Reveal from '../../components/shared/Reveal';
import Lightbox from '../../components/shared/Lightbox';
import CtaSection from '../../components/home/CtaSection';
import { Linkedin, Twitter, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  return { title: 'من نحن', description: s.description };
}

export default async function AboutPage() {
  const [{ page, aboutSection, vision, team, timeline, certificates }, banner, stats, settings] = await Promise.all([
    getAboutData(), getBanner('about'), getStats(), getSettings(),
  ]);

  const visionItems = (vision?.data?.items || []).filter((i) => i.isVisible !== false);

  return (
    <>
      <PageBanner
        title={banner?.title || 'من نحن'}
        subtitle={banner?.subtitle}
        image={banner?.image}
        breadcrumb={[{ label: 'من نحن' }]}
      />

      <AboutPreview data={aboutSection?.data} />

      {page?.content ? (
        <section className="py-4 md:py-8 bg-white">
          <div className="container-app max-w-4xl prose-rtl" dangerouslySetInnerHTML={{ __html: page.content }} />
        </section>
      ) : null}

      <StatsBar stats={stats} />

      {visionItems.length > 0 && (
        <section className="section bg-white">
          <div className="container-app">
            <SectionTitle eyebrow="مبادئنا" title="الرؤية والرسالة والقيم" />
            <div className="grid md:grid-cols-3 gap-6">
              {visionItems.map((v, i) => (
                <Reveal key={v.title} delay={i * 90}>
                  <div className="card p-8 text-center h-full hover:shadow-hover transition-shadow duration-300">
                    <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-5">
                      <Icon name={v.icon} className="w-8 h-8" />
                    </span>
                    <h3 className="text-xl font-bold text-dark mb-3">{v.title}</h3>
                    <p className="text-gray-500 leading-loose text-sm">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="section-alt">
          <div className="container-app">
            <SectionTitle eyebrow="فريقنا" title="الأشخاص خلف العمل" text="فريق متعدد التخصصات يجمع الهندسة والتصميم وإدارة المنتج." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((m, i) => (
                <Reveal key={m._id} delay={i * 70}>
                  <div className="card overflow-hidden group text-center h-full">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {m.avatar
                        ? <Image src={m.avatar} alt={m.name} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <span className="absolute inset-0 grid place-items-center text-4xl font-black text-gray-300">{m.name?.charAt(0)}</span>}
                      <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>}
                        {m.twitter && <a href={m.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>}
                        {m.email && <a href={`mailto:${m.email}`} aria-label="Email" className="w-8 h-8 rounded-full bg-white text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors"><Mail className="w-4 h-4" /></a>}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-dark">{m.name}</h3>
                      <p className="text-primary text-sm font-medium mb-2">{m.position}</p>
                      {m.bio && <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{m.bio}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {timeline.length > 0 && (
        <section className="section bg-white overflow-hidden">
          <div className="container-app">
            <SectionTitle eyebrow="مسيرتنا" title="محطات في رحلتنا" />
            <div className="relative max-w-4xl mx-auto">
              <span className="absolute right-4 md:right-1/2 top-0 bottom-0 w-0.5 bg-primary/25 md:translate-x-1/2" aria-hidden />
              <ol className="space-y-9">
                {timeline.map((t, i) => (
                  <li key={t._id} className={`relative flex md:items-center gap-6 ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
                    <span className="absolute right-4 md:right-1/2 md:translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 -translate-y-0 mt-2 md:mt-0" aria-hidden />
                    <div className="hidden md:block flex-1" />
                    <div className={`flex-1 pr-12 md:pr-0 ${i % 2 ? 'md:pl-10 md:text-left' : 'md:pr-10'}`}>
                      <Reveal>
                        <div className="card p-5">
                          <span className="badge-primary mb-2">{t.year}</span>
                          <h3 className="font-bold text-dark mb-1.5">{t.title}</h3>
                          <p className="text-gray-500 text-sm leading-relaxed">{t.description}</p>
                        </div>
                      </Reveal>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {certificates.length > 0 && (
        <section className="section-alt">
          <div className="container-app">
            <SectionTitle eyebrow="اعتماداتنا" title="الشهادات والاعتمادات" />
            <Lightbox images={certificates.map((c) => ({ image: c.image, title: c.title }))} alt="شهادة" />
          </div>
        </section>
      )}

      <CtaSection data={{ heading: 'هل ترغب في العمل معنا؟', text: 'تواصل مع فريقنا اليوم واحصل على استشارة مجانية لمشروعك.', btn1Text: 'تواصل معنا', btn1Link: '/contact', btn2Text: 'اطلب عرض سعر', btn2Link: '/quote' }} />
    </>
  );
}
