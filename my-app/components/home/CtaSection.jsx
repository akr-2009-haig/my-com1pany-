import Link from 'next/link';

export default function CtaSection({ data = {} }) {
  const d = data || {};
  if (d.isVisible === false) return null;
  const image = d.image || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80';

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-primary/85" aria-hidden />
      <div className="relative container-app text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-balance">
          {d.heading || 'هل لديك مشروع في ذهنك؟'}
        </h2>
        <p className="text-white/85 max-w-2xl mx-auto mb-9 leading-relaxed">
          {d.text || 'فريقنا جاهز لتحويل فكرتك إلى منتج رقمي متكامل.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link href={d.btn1Link || '/contact'} className="btn-white px-8 py-3.5">{d.btn1Text || 'تواصل معنا'}</Link>
          {d.showBtn2 !== false && (
            <Link href={d.btn2Link || '/quote'} className="btn-ghost-white px-8 py-3.5">{d.btn2Text || 'اطلب عرض سعر'}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
