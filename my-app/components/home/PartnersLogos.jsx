import Image from 'next/image';
import SectionTitle from '../shared/SectionTitle';

function Logo({ p }) {
  const inner = (
    <span className="relative block w-[150px] h-[64px] shrink-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300" title={p.name}>
      {p.logo
        ? <Image src={p.logo} alt={p.name || ''} fill sizes="150px" className="object-contain" />
        : <span className="w-full h-full grid place-items-center font-bold text-gray-400">{p.name}</span>}
    </span>
  );
  return p.url
    ? <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.name}>{inner}</a>
    : inner;
}

export default function PartnersLogos({ partners = [] }) {
  if (!partners.length) return null;
  const loop = [...partners, ...partners];

  return (
    <section className="section bg-white">
      <div className="container-app">
        <SectionTitle eyebrow="شركاء النجاح" title="شركاؤنا وعملاؤنا" />
      </div>
      <div className="relative overflow-hidden mask-fade">
        <div className="flex items-center gap-14 w-max animate-marquee hover:[animation-play-state:paused] px-7">
          {loop.map((p, i) => <Logo key={`${p._id}-${i}`} p={p} />)}
        </div>
      </div>
    </section>
  );
}
