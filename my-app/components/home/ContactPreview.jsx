import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle';
import ContactForm from '../forms/ContactForm';

export default function ContactPreview({ settings = {}, config = {}, services = [] }) {
  const boxes = [
    { Icon: MapPin, label: 'العنوان', value: settings.address, href: null },
    { Icon: Phone, label: 'الهاتف', value: settings.phone, href: settings.phone ? `tel:${settings.phone}` : null, ltr: true },
    { Icon: Mail, label: 'البريد الإلكتروني', value: settings.email, href: settings.email ? `mailto:${settings.email}` : null, ltr: true },
    { Icon: Clock, label: 'ساعات العمل', value: settings.workingHours, href: null },
  ].filter((b) => b.value);

  return (
    <section className="section bg-white">
      <div className="container-app">
        <SectionTitle eyebrow="تواصل معنا" title="لنتحدث عن مشروعك" text="أرسل لنا رسالة وسنعاود التواصل معك خلال يوم عمل واحد." />
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="card p-6 md:p-8">
            <ContactForm config={config} services={services} compact />
          </div>
          <div className="space-y-4">
            {boxes.map(({ Icon: I, label, value, href, ltr }) => (
              <div key={label} className="bg-soft rounded-2xl p-5 flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <I className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-dark mb-1">{label}</p>
                  {href
                    ? <a href={href} dir={ltr ? 'ltr' : undefined} className="text-gray-500 text-sm hover:text-primary break-all block">{value}</a>
                    : <p className="text-gray-500 text-sm leading-relaxed">{value}</p>}
                </div>
              </div>
            ))}
            {settings.showMap !== false && settings.mapEmbed && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-64">
                <iframe src={settings.mapEmbed} title="خريطة الموقع" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
