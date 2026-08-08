'use client';

/** Read-only label/value grid used inside lead detail modals. */
export default function DetailGrid({ items = [], columns = 2 }) {
  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : ''} gap-3`}>
      {items.filter((i) => i && i.value !== undefined && i.value !== null && i.value !== '').map((i) => (
        <div key={i.label} className={`rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 ${i.full ? 'sm:col-span-2' : ''}`}>
          <p className="text-[11px] text-gray-400 mb-1">{i.label}</p>
          <div className={`text-sm text-gray-800 ${i.pre ? 'whitespace-pre-wrap leading-relaxed' : 'font-semibold'}`} dir={i.dir}>
            {i.value}
          </div>
        </div>
      ))}
    </div>
  );
}
