'use client';

import { Check, X, Star } from 'lucide-react';
import { formatNumber } from '../../utils/formatDate';

const SYMBOLS = { SAR: 'ر.س', USD: '$', AED: 'د.إ', EGP: 'ج.م', KWD: 'د.ك', QAR: 'ر.ق', EUR: '€' };

export default function PackageCard({ pkg, yearly = false, onOrder }) {
  const price = yearly ? pkg.yearlyPrice : pkg.monthlyPrice;
  const symbol = SYMBOLS[pkg.currency] || pkg.currency || '';

  return (
    <div className={`relative card p-7 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-hover
      ${pkg.isPopular ? 'border-2 border-primary lg:scale-[1.04] shadow-hover z-10' : ''}`}>
      {pkg.isPopular && (
        <span className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
          <Star className="w-3.5 h-3.5 fill-white" strokeWidth={0} /> الأكثر طلباً
        </span>
      )}
      <h3 className="text-xl font-bold text-dark text-center mb-1 mt-2">{pkg.name}</h3>
      {pkg.description && <p className="text-center text-gray-400 text-xs mb-4">{pkg.description}</p>}
      <div className="text-center mb-5">
        <span className="text-4xl md:text-5xl font-extrabold text-primary">{formatNumber(price)}</span>
        <span className="text-gray-400 text-sm mr-1">{symbol}</span>
        <span className="block text-gray-400 text-xs mt-1">{yearly ? '/ سنوياً' : '/ شهرياً'}</span>
      </div>
      <div className="h-px bg-gray-100 mb-5" />
      <ul className="space-y-3 flex-1 mb-6">
        {(pkg.features || []).map((f, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-gray-600' : 'text-gray-300 line-through'}`}>
            {f.included
              ? <Check className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
              : <X className="w-4.5 h-4.5 text-gray-300 shrink-0 mt-0.5" />}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onOrder?.(pkg)}
        className={pkg.isPopular ? 'btn-primary w-full' : 'btn-outline w-full'}
      >
        {pkg.buttonText || 'اطلب الآن'}
      </button>
    </div>
  );
}
