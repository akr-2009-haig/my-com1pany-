'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ images = [], columns = 'sm:grid-cols-2 lg:grid-cols-4', aspect = 'aspect-[4/3]', alt = '' }) {
  const [index, setIndex] = useState(-1);
  const close = useCallback(() => setIndex(-1), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (index < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') prev();
      if (e.key === 'ArrowLeft') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div className={`grid gap-5 ${columns}`}>
        {images.map((img, i) => {
          const src = typeof img === 'string' ? img : img.image || img.url;
          const title = typeof img === 'string' ? alt : img.title || alt;
          return (
            <button key={src + i} type="button" onClick={() => setIndex(i)}
              className={`relative ${aspect} rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group`}>
              <Image src={src} alt={title || ''} fill sizes="(max-width:768px) 50vw, 25vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
              {title && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">{title}</span>}
            </button>
          );
        })}
      </div>

      {index >= 0 && (
        <div className="fixed inset-0 z-[100] bg-black/90 grid place-items-center p-4" onClick={close} role="dialog" aria-modal="true">
          <button type="button" onClick={close} aria-label="إغلاق" className="absolute top-5 left-5 w-11 h-11 rounded-full bg-white/10 text-white grid place-items-center hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="السابق"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white grid place-items-center hover:bg-white/20">
                <ChevronRight className="w-6 h-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="التالي"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white grid place-items-center hover:bg-white/20">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="relative w-full max-w-5xl aspect-[16/10]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={typeof images[index] === 'string' ? images[index] : images[index].image || images[index].url}
              alt={alt} fill sizes="100vw" className="object-contain"
            />
          </div>
          <p className="absolute bottom-6 text-white/70 text-sm">{index + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
