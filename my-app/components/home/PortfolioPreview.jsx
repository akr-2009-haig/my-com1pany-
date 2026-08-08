'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SectionTitle from '../shared/SectionTitle';
import ProjectCard from '../shared/ProjectCard';

export default function PortfolioPreview({ projects = [], categories = [] }) {
  const [active, setActive] = useState('');
  if (!projects.length) return null;

  const used = categories.filter((c) => projects.some((p) => String(p.category?._id || p.category) === String(c._id)));
  const list = useMemo(
    () => (active ? projects.filter((p) => String(p.category?._id || p.category) === active) : projects),
    [active, projects],
  );

  const cls = (on) => `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
    ${on ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'}`;

  return (
    <section className="section-alt">
      <div className="container-app">
        <SectionTitle
          eyebrow="أعمالنا"
          title="أحدث المشاريع"
          text="نماذج من مشاريع سلّمناها لعملائنا في قطاعات مختلفة."
        />

        {used.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            <button type="button" onClick={() => setActive('')} className={cls(!active)}>الكل</button>
            {used.map((c) => (
              <button key={c._id} type="button" onClick={() => setActive(String(c._id))} className={cls(active === String(c._id))}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <div key={p._id} className="animate-fadeIn"><ProjectCard project={p} /></div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/portfolio" className="btn-primary">جميع المشاريع</Link>
        </div>
      </div>
    </section>
  );
}
