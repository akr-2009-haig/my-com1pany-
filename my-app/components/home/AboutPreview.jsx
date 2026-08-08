import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';
import Reveal from '../shared/Reveal';

export default function AboutPreview({ data = {} }) {
  const d = data || {};
  if (d.isVisible === false) return null;
  const image = d.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80';

  return (
    <section className="section bg-white overflow-hidden">
      <div className="container-app grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal className="relative order-1">
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-3xl bg-primary/10 -z-10 hidden sm:block" aria-hidden />
          <div className="absolute -bottom-7 -left-7 w-28 h-28 rounded-full bg-primary/15 -z-10 hidden sm:block" aria-hidden />
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-hover rotate-1 hover:rotate-0 transition-transform duration-500">
            <Image src={image} alt={d.heading || 'من نحن'} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </Reveal>

        <Reveal delay={120} className="order-2">
          <p className="eyebrow mb-2">{d.eyebrow || 'من نحن'}</p>
          <h2 className="heading mb-4">{d.heading || 'شركة رائدة في الحلول البرمجية'}</h2>
          <div className="divider-line mb-6" />
          <p className="text-gray-500 leading-loose mb-7">{d.text}</p>

          <ul className="space-y-3.5 mb-8">
            {(d.points || []).map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span className="text-gray-700 font-medium">{p.text || p}</span>
              </li>
            ))}
          </ul>

          {d.buttonText && (
            <Link href={d.buttonLink || '/about'} className="btn-primary">{d.buttonText}</Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
