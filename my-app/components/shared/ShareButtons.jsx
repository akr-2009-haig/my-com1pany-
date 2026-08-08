'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Link2, Check } from 'lucide-react';

export default function ShareButtons({ title = '', url = '' }) {
  const [copied, setCopied] = useState(false);
  const href = url || (typeof window !== 'undefined' ? window.location.href : '');
  const enc = encodeURIComponent(href);
  const encTitle = encodeURIComponent(title);

  const links = [
    { name: 'فيسبوك', Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`, color: 'hover:bg-[#1877F2]' },
    { name: 'تويتر', Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc}&text=${encTitle}`, color: 'hover:bg-black' },
    { name: 'لينكدإن', Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`, color: 'hover:bg-[#0A66C2]' },
    { name: 'واتساب', Icon: MessageCircle, href: `https://wa.me/?text=${encTitle}%20${enc}`, color: 'hover:bg-[#25D366]' },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 ml-1">مشاركة:</span>
      {links.map(({ name, Icon, href: h, color }) => (
        <a key={name} href={h} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}
          className={`w-9 h-9 rounded-lg bg-gray-100 text-gray-600 grid place-items-center transition-all duration-300 hover:text-white ${color}`}>
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button type="button" onClick={copy} aria-label="نسخ الرابط" title="نسخ الرابط"
        className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 grid place-items-center transition-all duration-300 hover:bg-primary hover:text-white">
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
