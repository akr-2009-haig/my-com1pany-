import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getBanner, getPage, getServices, getSettings } from '../../lib/data';
import PageBanner from '../../components/shared/PageBanner';
import ContactForm from '../../components/forms/ContactForm';
import SocialLinks from '../../components/shared/SocialLinks';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'تواصل معنا', description: 'تواصل مع فريقنا عبر النموذج أو الهاتف أو البريد الإلكتروني' };

export default async function ContactPage() {
  const [settings, page, services, banner] = await Promise.all([
    getSettings(), getPage('contact'), getServices({ limit: 0 }), getBanner('contact'),
  ]);
  const cfg = page?.data || {};

  const boxes = [
    { Icon: MapPin, label: 'العنوان', lines: [settings.address].filter(Boolean) },
    { Icon: Phone, label: 'الهاتف', lines: [settings.phone, settings.phone2].filter(Boolean), ltr: true, hrefPrefix: 'tel:' },
    { Icon: Mail, label: 'البريد الإلكتروني', lines: [settings.email, settings.email2].filter(Boolean), ltr: true, hrefPrefix: 'mailto:' },
  ].filter((b) => b.lines.length);

  return (
    <>
      <PageBanner
        title={banner?.title || 'تواصل معنا'}
        subtitle={banner?.subtitle || 'نحن هنا للإجابة على أسئلتك ومناقشة مشروعك'}
        image={banner?.image}
        breadcrumb={[{ label: 'تواصل معنا' }]}
      />

      <section className="section bg-white">
        <div className="container-app">
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {boxes.map(({ Icon: I, label, lines, ltr, hrefPrefix }) => (
              <div key={label} className="card p-7 text-center hover:shadow-hover transition-shadow duration-300">
                <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                  <I className="w-8 h-8" />
                </span>
                <h3 className="font-bold text-dark mb-2.5">{label}</h3>
                {lines.map((l) => (
                  hrefPrefix
                    ? <a key={l} href={`${hrefPrefix}${l}`} dir={ltr ? 'ltr' : undefined} className="block text-gray-500 text-sm hover:text-primary break-all">{l}</a>
                    : <p key={l} className="text-gray-500 text-sm leading-relaxed">{l}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="card p-6 md:p-8">
              <h2 className="text-2xl font-bold text-dark mb-1.5">أرسل لنا رسالة</h2>
              <p className="text-gray-400 text-sm mb-7">سنعاود التواصل معك خلال يوم عمل واحد.</p>
              <ContactForm config={cfg} services={services} />
            </div>

            <div className="space-y-6">
              {cfg.showMap !== false && settings.showMap !== false && settings.mapEmbed ? (
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-card h-[420px]">
                  <iframe src={settings.mapEmbed} title="موقعنا على الخريطة" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              ) : null}

              <div className="card p-6">
                {settings.workingHours && (
                  <div className="flex items-start gap-3.5 mb-5">
                    <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><Clock className="w-5 h-5" /></span>
                    <span>
                      <span className="block font-bold text-dark mb-0.5">ساعات العمل</span>
                      <span className="block text-gray-500 text-sm">{settings.workingHours}</span>
                    </span>
                  </div>
                )}
                <p className="font-bold text-dark mb-3">تابعنا على</p>
                <SocialLinks socials={settings.socials} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
