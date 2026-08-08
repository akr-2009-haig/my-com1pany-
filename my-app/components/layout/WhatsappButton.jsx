'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsappButton({ settings }) {
  const cfg = settings?.whatsappSettings || {};
  const [show, setShow] = useState(false);
  const [tipOpen, setTipOpen] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
  }, []);

  const number = String(cfg.number || settings?.whatsapp || '').replace(/[^\d]/g, '');
  if (cfg.enabled === false || !number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(cfg.welcomeMessage || 'مرحباً، أود الاستفسار عن خدماتكم')}`;
  const side = cfg.position === 'right' ? 'right-5' : 'left-5';

  return (
    <div className={`fixed bottom-5 ${side} z-[70] flex items-center gap-2 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {cfg.showTooltip !== false && tipOpen && (
        <div className="hidden sm:flex items-center gap-2 bg-white shadow-hover rounded-xl px-3.5 py-2 text-sm text-gray-700 border border-gray-100">
          <span>{cfg.tooltip || 'تحتاج مساعدة؟'}</span>
          <button type="button" onClick={() => setTipOpen(false)} aria-label="إخفاء" className="text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <a
        href={href} target="_blank" rel="noopener noreferrer" aria-label="تواصل عبر واتساب"
        className="relative w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-hover hover:scale-110 transition-transform duration-300"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulseRing" aria-hidden />
        <MessageCircle className="w-7 h-7 relative" fill="currentColor" strokeWidth={0} />
      </a>
    </div>
  );
}
