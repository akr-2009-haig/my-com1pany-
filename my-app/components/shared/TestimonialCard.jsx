import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({ item }) {
  return (
    <div className="card p-7 h-full flex flex-col border-gray-200">
      <Quote className="w-10 h-10 text-primary/25 mb-4" fill="currentColor" strokeWidth={0} />
      <p className="text-gray-600 italic leading-loose flex-1 mb-5">{item.content}</p>
      <div className="h-px bg-gray-100 mb-5" />
      <div className="flex items-center gap-3.5">
        {item.avatar ? (
          <Image src={item.avatar} alt={item.name} width={52} height={52} className="w-13 h-13 rounded-full object-cover" style={{ width: 52, height: 52 }} />
        ) : (
          <div className="w-13 h-13 rounded-full bg-primary/10 text-primary grid place-items-center font-bold" style={{ width: 52, height: 52 }}>
            {(item.name || '؟').charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-dark text-sm">{item.name}</h4>
          <p className="text-gray-400 text-xs">{[item.position, item.company].filter(Boolean).join(' - ')}</p>
          <div className="flex gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-3.5 h-3.5 ${n <= (item.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} strokeWidth={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
