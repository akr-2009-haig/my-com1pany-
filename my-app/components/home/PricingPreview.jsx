'use client';

import { useState } from 'react';
import Link from 'next/link';
import SectionTitle from '../shared/SectionTitle';
import PackageCard from '../shared/PackageCard';
import PackageRequestModal from '../forms/PackageRequestModal';

export default function PricingPreview({ packages = [], showToggle = true, alt = true }) {
  const [yearly, setYearly] = useState(false);
  const [selected, setSelected] = useState(null);
  if (!packages.length) return null;

  return (
    <section className={alt ? 'section-alt' : 'section bg-white'}>
      <div className="container-app">
        <SectionTitle
          eyebrow="الأسعار"
          title="الباقات والأسعار"
          text="باقات مرنة تناسب الشركات الناشئة والمؤسسات الكبيرة على حد سواء."
        />

        {showToggle && (
          <div className="flex items-center justify-center gap-3.5 mb-11">
            <span className={`text-sm font-semibold ${!yearly ? 'text-primary' : 'text-gray-400'}`}>شهري</span>
            <button
              type="button" role="switch" aria-checked={yearly} aria-label="التبديل بين الاشتراك الشهري والسنوي"
              onClick={() => setYearly((v) => !v)}
              className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${yearly ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${yearly ? '-translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold ${yearly ? 'text-primary' : 'text-gray-400'}`}>سنوي</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
          {packages.map((p) => (
            <PackageCard key={p._id} pkg={p} yearly={yearly} onOrder={setSelected} />
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          تحتاج باقة مخصصة؟ <Link href="/contact" className="text-primary font-semibold hover:underline">تواصل معنا</Link>
        </p>
      </div>

      <PackageRequestModal pkg={selected} yearly={yearly} onClose={() => setSelected(null)} />
    </section>
  );
}
