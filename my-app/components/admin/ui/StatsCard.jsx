'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import Icon from '../../shared/Icon';

export default function StatsCard({
  title, value, change, icon = 'BarChart3', color = '#00BCD4', hint, href,
}) {
  const up = Number(change) >= 0;
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      href={href}
      className="admin-card p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
    >
      <span className="w-12 h-12 rounded-xl grid place-items-center shrink-0" style={{ background: `${color}1A`, color }}>
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-dark leading-none">{value ?? 0}</p>
        {change !== undefined && change !== null ? (
          <p className={`text-xs mt-2 inline-flex items-center gap-1 font-semibold ${up ? 'text-green-600' : 'text-danger'}`}>
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {up ? '+' : ''}{change}%
            <span className="text-gray-400 font-normal">عن الشهر الماضي</span>
          </p>
        ) : hint ? <p className="text-xs mt-2 text-gray-400">{hint}</p> : null}
      </div>
    </Wrapper>
  );
}
