import Image from 'next/image';
import Icon from '../shared/Icon';
import Reveal from '../shared/Reveal';

export default function WhyUs({ data = {} }) {
  const d = data || {};
  if (d.isVisible === false) return null;
  const image = d.image || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80';

  return (
    <section className="section bg-white overflow-hidden">
      <div className="container-app grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <p className="eyebrow mb-2">{d.eyebrow || 'لماذا نحن'}</p>
          <h2 className="heading mb-4">{d.heading || 'لماذا تختار شركتنا؟'}</h2>
          <div className="divider-line mb-6" />
          <p className="text-gray-500 leading-loose mb-8">{d.text}</p>

          <div className="space-y-5">
            {(d.features || []).map((f, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon name={f.icon} className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-bold text-dark mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc || f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140} className="relative">
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-3xl bg-primary/10 -z-10 hidden sm:block" aria-hidden />
          <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-primary/15 -z-10 hidden sm:block" aria-hidden />
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-hover">
            <Image src={image} alt={d.heading || 'لماذا تختارنا'} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
