'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function BlogSearch({ defaultValue = '' }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  const submit = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/blog?search=${encodeURIComponent(q.trim())}` : '/blog');
  };

  return (
    <form onSubmit={submit} className="relative">
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث…" aria-label="بحث في المدونة" className="input pl-11"
      />
      <button type="submit" aria-label="بحث" className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-primary text-white grid place-items-center hover:bg-primary-dark transition-colors">
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
