'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK = [{
  _id: 'fallback',
  title: 'نحوّل أفكارك إلى واقع رقمي',
  subtitle: 'شريكك التقني الموثوق في رحلة التحول الرقمي',
  image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
  btn1Text: 'ابدأ مشروعك', btn1Link: '/quote',
  btn2Text: 'شاهد أعمالنا', btn2Link: '/portfolio', showBtn2: true,
}];

export default function HeroSlider({ slides = [] }) {
  const items = slides.length ? slides : FALLBACK;
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const go = useCallback((n) => setIndex((n + items.length) % items.length), [items.length]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (items.length < 2) return undefined;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(timer.current);
  }, [items.length, index]);

  const pause = () => clearInterval(timer.current);
  const resume = () => {
    clearInterval(timer.current);
    if (items.length > 1) timer.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
  };

  return (
    <section
      className="relative h-[88vh] min-h-[520px] w-full overflow-hidden bg-dark"
      onMouseEnter={pause} onMouseLeave={resume}
      aria-roledescription="carousel"
    >
      {items.map((s, i) => (
        <div
          key={s._id || i}
          className={`absolute inset-0 transition-opacity duration-[900ms] ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-hidden={i !== index}
        >
          {s.image && (
            <Image
              src={s.image} alt={s.title || ''} fill priority={i === 0} sizes="100vw"
              className={`object-cover transition-transform duration-[7000ms] ${i === index ? 'scale-105' : 'scale-100'}`}
            />
          )}
          <div className="absolute inset-0 bg-dark/55" />
          <div className="relative h-full container-app flex flex-col items-center justify-center text-center">
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.25] max-w-4xl mb-5 transition-all duration-700 ${i === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {s.title}
            </h1>
            {s.subtitle && (
              <p className={`text-base sm:text-xl text-white/80 max-w-2xl mb-9 transition-all duration-700 delay-150 ${i === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {s.subtitle}
              </p>
            )}
            <div className={`flex flex-wrap items-center justify-center gap-3.5 transition-all duration-700 delay-300 ${i === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {s.btn1Text && (
                <Link href={s.btn1Link || '/quote'} className="btn-primary text-base px-8 py-3.5 hover:scale-105">
                  {s.btn1Text}
                </Link>
              )}
              {s.showBtn2 !== false && s.btn2Text && (
                <Link href={s.btn2Link || '/portfolio'} className="btn-ghost-white text-base px-8 py-3.5 hover:scale-105">
                  {s.btn2Text}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <>
          <button
            type="button" onClick={prev} aria-label="الشريحة السابقة"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/25 backdrop-blur text-white hover:bg-white hover:text-primary grid place-items-center transition-all duration-300 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            type="button" onClick={next} aria-label="الشريحة التالية"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/25 backdrop-blur text-white hover:bg-white hover:text-primary grid place-items-center transition-all duration-300 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="absolute bottom-7 inset-x-0 flex items-center justify-center gap-2.5 z-10">
            {items.map((s, i) => (
              <button
                key={s._id || i} type="button" onClick={() => go(i)} aria-label={`الشريحة ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-primary' : 'w-2.5 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
