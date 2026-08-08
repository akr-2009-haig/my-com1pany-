'use client';

import ImageUploader from '../ui/ImageUploader';
import MultiImageUploader from '../ui/MultiImageUploader';
import IconPicker from '../ui/IconPicker';
import ColorPicker from '../ui/ColorPicker';
import RichTextEditor from '../ui/RichTextEditor';
import DynamicList from '../ui/DynamicList';
import TagInput from '../ui/TagInput';
import ToggleSwitch from '../ui/ToggleSwitch';

const COL_CLASS = { 1: 'sm:col-span-1', 2: 'sm:col-span-2', full: 'sm:col-span-2' };

/**
 * Declarative field renderer used by every admin form.
 * spec: { name, label, type, placeholder, hint, required, options, cols, folder, fields, rows, min, max, step, render }
 */
export default function Field({ spec, value, form, onChange, error }) {
  const f = spec;
  const set = (v) => onChange(f.name, v);
  const wrap = (node) => (
    <div className={`col-span-full ${COL_CLASS[f.cols || 1]}`}>
      {node}
      {f.hint ? <p className="text-[11px] text-gray-400 mt-1">{f.hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );

  const labelEl = f.label ? (
    <span className="label">
      {f.label}
      {f.required ? <span className="text-danger"> *</span> : null}
    </span>
  ) : null;

  switch (f.type) {
    case 'custom':
      return wrap(f.render?.({ value, set, form }));

    case 'image':
      return wrap(<ImageUploader label={f.label} value={value || ''} folder={f.folder || 'general'} ratio={f.ratio} hint={f.uploadHint} onChange={set} />);

    case 'images':
      return wrap(<MultiImageUploader label={f.label} value={value || []} folder={f.folder || 'gallery'} max={f.max || 12} onChange={set} />);

    case 'icon':
      return wrap(<IconPicker label={f.label} value={value || f.default || 'Sparkles'} onChange={set} />);

    case 'color':
      return wrap(<ColorPicker label={f.label} value={value || '#00BCD4'} onChange={set} />);

    case 'richtext':
      return wrap(<RichTextEditor label={f.label} value={value || ''} minHeight={f.minHeight || 240} folder={f.folder || 'content'} onChange={set} />);

    case 'list':
      return wrap(
        <DynamicList
          label={f.label}
          value={value || []}
          fields={f.fields}
          addLabel={f.addLabel}
          emptyText={f.emptyText}
          max={f.max || 50}
          onChange={set}
        />,
      );

    case 'tags':
      return wrap(<TagInput label={f.label} value={value || []} placeholder={f.placeholder} onChange={set} />);

    case 'toggle':
      return wrap(
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60 h-[46px] mt-6">
          <span className="text-sm font-semibold text-gray-700">{f.label}</span>
          <ToggleSwitch checked={value !== undefined ? Boolean(value) : Boolean(f.default)} onChange={set} />
        </div>,
      );

    case 'textarea':
      return wrap(
        <>
          {labelEl}
          <textarea
            className="input resize-y"
            style={{ height: (f.rows || 4) * 26 + 20 }}
            value={value ?? ''}
            placeholder={f.placeholder}
            onChange={(e) => set(e.target.value)}
          />
        </>,
      );

    case 'select':
      return wrap(
        <>
          {labelEl}
          <select className="input" value={value ?? ''} onChange={(e) => set(e.target.value)}>
            {f.placeholder ? <option value="">{f.placeholder}</option> : null}
            {(f.options || []).map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
          </select>
        </>,
      );

    case 'multiselect':
      return wrap(
        <>
          {labelEl}
          <div className="rounded-xl border border-gray-200 p-3 max-h-44 overflow-y-auto space-y-1.5 bg-white">
            {(f.options || []).map((o) => {
              const list = Array.isArray(value) ? value.map(String) : [];
              const checked = list.includes(String(o.value));
              return (
                <label key={String(o.value)} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1.5 py-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#00BCD4]"
                    checked={checked}
                    onChange={() => set(checked ? list.filter((x) => x !== String(o.value)) : [...list, String(o.value)])}
                  />
                  {o.label}
                </label>
              );
            })}
            {!(f.options || []).length ? <p className="text-xs text-gray-400 text-center py-2">لا توجد خيارات</p> : null}
          </div>
        </>,
      );

    case 'number':
      return wrap(
        <>
          {labelEl}
          <input
            type="number"
            className="input"
            value={value ?? ''}
            min={f.min} max={f.max} step={f.step}
            placeholder={f.placeholder}
            onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </>,
      );

    case 'date':
    case 'datetime-local':
      return wrap(
        <>
          {labelEl}
          <input
            type={f.type}
            className="input"
            value={value ? String(value).slice(0, f.type === 'date' ? 10 : 16) : ''}
            onChange={(e) => set(e.target.value)}
          />
        </>,
      );

    default:
      return wrap(
        <>
          {labelEl}
          <input
            type={f.type || 'text'}
            className="input"
            dir={f.dir}
            value={value ?? ''}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            onChange={(e) => set(e.target.value)}
          />
        </>,
      );
  }
}
