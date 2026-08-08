'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle';
import TestimonialCard from '../shared/TestimonialCard';

export default function Testimonials({ items = [] }) {
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const calc = () => setPerView(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const pages = Math.max(1, Math.ceil(items.length / perView));

  useEffect(() => { setPage((p) => Math.min(p, pages - 1)); }, [pages]);

  useEffect(() => {
    if (pages < 2) return undefined;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), 4000);
    return () => clearInterval(t);
  }, [pages]);

  if (!items.length) return null;

  return (
    <section className="section bg-white">
      <div className="container-app">
        <SectionTitle eyebrow="آراء عملائنا" title="ماذا يقول عملاؤنا" />

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${page * 100}%)` }}
            >
              {items.map((t) => (
                <div key={t._id} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                  <TestimonialCard item={t} />
                </div>
              ))}
            </div>
          </div>

          {pages > 1 && (
            <>
              <button
                type="button" onClick={() => setPage((p) => (p - 1 + pages) % pages)} aria-label="السابق"
                className="absolute -right-2 lg:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-white grid place-items-center shadow-card hover:bg-primary-dark transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button" onClick={() => setPage((p) => (p + 1) % pages)} aria-label="التالي"
                className="absolute -left-2 lg:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-white grid place-items-center shadow-card hover:bg-primary-dark transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i} type="button" onClick={() => setPage(i)} aria-label={`المجموعة ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all ${i === page ? 'w-7 bg-primary' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
