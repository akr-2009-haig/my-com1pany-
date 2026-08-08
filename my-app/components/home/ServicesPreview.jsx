import Link from 'next/link';
import SectionTitle from '../shared/SectionTitle';
import ServiceCard from '../shared/ServiceCard';
import Reveal from '../shared/Reveal';

export default function ServicesPreview({ services = [] }) {
  if (!services.length) return null;

  return (
    <section className="section-alt">
      <div className="container-app">
        <SectionTitle
          eyebrow="ماذا نقدم"
          title="خدماتنا"
          text="حلول برمجية متكاملة مصمّمة خصيصاً لتلبية احتياجات عملك ودفع نموه."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Reveal key={s._id} delay={i * 70}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/services" className="btn-primary">جميع الخدمات</Link>
        </div>
      </div>
    </section>
  );
}
