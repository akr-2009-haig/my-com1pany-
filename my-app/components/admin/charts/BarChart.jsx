'use client';

/** Horizontal bar chart – ideal for RTL category breakdowns. data: [{ label, value }] */
export default function BarChart({ data = [], color = '#00BCD4', max: forcedMax, suffix = '' }) {
  const rows = (data || []).filter(Boolean);
  if (!rows.length) return <div className="h-32 grid place-items-center text-sm text-gray-400">لا توجد بيانات</div>;
  const max = forcedMax || Math.max(...rows.map((r) => Number(r.value) || 0), 1);

  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const pct = Math.round(((Number(r.value) || 0) / max) * 100);
        return (
          <div key={`${r.label}-${i}`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 truncate max-w-[70%]" title={r.label}>{r.label}</span>
              <span className="font-bold text-dark">{r.value}{suffix}</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: r.color || color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
