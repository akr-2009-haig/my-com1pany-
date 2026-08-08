import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Icon from './Icon';

export default function ServiceCard({ service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group card p-7 border-t-4 border-t-transparent hover:border-t-primary transition-all duration-300 hover:shadow-hover hover:-translate-y-1.5 block h-full"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:-rotate-6">
        <Icon name={service.icon} className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-dark mb-2.5 group-hover:text-primary transition-colors line-clamp-2">{service.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5">{service.shortDesc}</p>
      <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold">
        المزيد
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
