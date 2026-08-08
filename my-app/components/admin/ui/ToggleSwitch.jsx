'use client';

export default function ToggleSwitch({ checked, onChange, disabled, label, size = 'md' }) {
  const dims = size === 'sm'
    ? { w: 'w-9', h: 'h-5', k: 'w-3.5 h-3.5', t: 'translate-x-[-16px]' }
    : { w: 'w-11', h: 'h-6', k: 'w-4 h-4', t: 'translate-x-[-20px]' };

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`${dims.w} ${dims.h} relative rounded-full transition-colors duration-300 shrink-0
          ${checked ? 'bg-primary' : 'bg-gray-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 right-1 bg-white rounded-full shadow ${dims.k}
            transition-transform duration-300 ${checked ? dims.t : 'translate-x-0'}`}
        />
      </button>
      {label ? <span className="text-sm text-gray-700 select-none">{label}</span> : null}
    </label>
  );
}
