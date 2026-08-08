'use client';

const PALETTE = ['#00BCD4', '#8b5cf6', '#f97316', '#22c55e', '#3b82f6', '#e74c3c', '#eab308', '#14b8a6', '#ec4899'];

/** Donut chart with legend. data: [{ label, value }] */
export default function PieChart({ data = [], size = 190, thickness = 26 }) {
  const rows = (data || []).filter((d) => Number(d.value) > 0);
  const total = rows.reduce((a, d) => a + Number(d.value), 0);

  if (!total) return <div className="h-40 grid place-items-center text-sm text-gray-400">لا توجد بيانات</div>;

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f3f5" strokeWidth={thickness} />
          {rows.map((d, i) => {
            const frac = Number(d.value) / total;
            const dash = `${(frac * c).toFixed(2)} ${(c - frac * c).toFixed(2)}`;
            const el = (
              <circle
                key={`${d.label}-${i}`}
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={d.color || PALETTE[i % PALETTE.length]}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </circle>
            );
            offset += frac * c;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-extrabold text-dark leading-none">{total}</p>
            <p className="text-[11px] text-gray-400 mt-1">الإجمالي</p>
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-2 w-full">
        {rows.map((d, i) => (
          <li key={`${d.label}-l-${i}`} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color || PALETTE[i % PALETTE.length] }} />
            <span className="text-gray-600 flex-1 truncate">{d.label}</span>
            <span className="font-bold text-dark">{d.value}</span>
            <span className="text-xs text-gray-400 w-10 text-left">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
