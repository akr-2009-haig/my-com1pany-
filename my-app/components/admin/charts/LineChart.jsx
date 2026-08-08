'use client';

import { useMemo, useState } from 'react';

/** Dependency-free SVG line/area chart. data: [{ label, value }] or [number]. */
export default function LineChart({
  data = [], height = 240, color = '#00BCD4', area = true, showGrid = true, formatLabel,
}) {
  const points = useMemo(
    () => (data || []).map((d, i) => (typeof d === 'number'
      ? { label: String(i + 1), value: d }
      : { label: d.label ?? d.date ?? d.month ?? String(i + 1), value: Number(d.value) || 0 })),
    [data],
  );
  const [hover, setHover] = useState(null);

  if (!points.length) return <div className="h-40 grid place-items-center text-sm text-gray-400">لا توجد بيانات كافية</div>;

  const W = 640; const H = height; const P = { t: 14, r: 12, b: 26, l: 40 };
  const max = Math.max(...points.map((p) => p.value), 1);
  const step = points.length > 1 ? (W - P.l - P.r) / (points.length - 1) : 0;
  const xy = points.map((p, i) => [P.l + i * step, H - P.b - (p.value / max) * (H - P.t - P.b)]);
  const path = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L${xy[xy.length - 1][0].toFixed(1)},${H - P.b} L${xy[0][0].toFixed(1)},${H - P.b} Z`;
  const gid = `grad-${color.replace('#', '')}`;
  const ticks = 4;
  const labelEvery = Math.ceil(points.length / 8);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid ? Array.from({ length: ticks + 1 }).map((_, i) => {
          const y = P.t + ((H - P.t - P.b) / ticks) * i;
          const v = Math.round(max - (max / ticks) * i);
          return (
            <g key={i}>
              <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke="#eef1f4" strokeWidth="1" />
              <text x={P.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#98a2b3">{v}</text>
            </g>
          );
        }) : null}

        {area ? <path d={areaPath} fill={`url(#${gid})`} /> : null}
        <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {xy.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={hover === i ? 4.5 : 0} fill="#fff" stroke={color} strokeWidth="2.5" />
            <rect
              x={x - step / 2} y={P.t} width={Math.max(step, 6)} height={H - P.t - P.b} fill="transparent"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}

        {points.map((p, i) => (i % labelEvery === 0 ? (
          <text key={i} x={xy[i][0]} y={H - 8} textAnchor="middle" fontSize="9" fill="#98a2b3">
            {formatLabel ? formatLabel(p.label) : String(p.label).slice(-5)}
          </text>
        ) : null))}
      </svg>

      {hover !== null ? (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-dark text-white text-[11px] rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap shadow-hover"
          style={{ left: `${(xy[hover][0] / W) * 100}%`, top: `${(xy[hover][1] / H) * height - 8}px` }}
        >
          {points[hover].label}: <b>{points[hover].value}</b>
        </div>
      ) : null}
    </div>
  );
}
