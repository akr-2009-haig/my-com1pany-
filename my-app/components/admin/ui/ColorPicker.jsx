'use client';

const PRESETS = ['#00BCD4', '#00ACC1', '#1a1a2e', '#e74c3c', '#22c55e', '#f97316', '#8b5cf6', '#3b82f6', '#6c757d'];

export default function ColorPicker({ value = '#00BCD4', onChange, label }) {
  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#00BCD4'} onChange={(e) => onChange?.(e.target.value)} className="w-11 h-11 rounded-lg border border-gray-200 cursor-pointer bg-white p-1" />
        <input value={value || ''} onChange={(e) => onChange?.(e.target.value)} dir="ltr" className="input flex-1 text-sm" placeholder="#00BCD4" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {PRESETS.map((c) => (
          <button key={c} type="button" title={c} onClick={() => onChange?.(c)} className={`w-6 h-6 rounded-md border-2 ${value === c ? 'border-dark' : 'border-white'} shadow`} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
