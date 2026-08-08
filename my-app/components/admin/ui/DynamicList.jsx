'use client';

import {
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
} from 'lucide-react';
import IconPicker from './IconPicker';
import ImageUploader from './ImageUploader';
import ToggleSwitch from './ToggleSwitch';

/**
 * Repeatable rows of sub-fields.
 * `fields` = [{ key, label, type: 'text'|'textarea'|'icon'|'image'|'toggle'|'number'|'select', options }]
 */
export default function DynamicList({
  value = [], onChange, fields = [{ key: 'text', label: 'النص', type: 'text' }],
  label, addLabel = 'إضافة عنصر', emptyText = 'لا توجد عناصر بعد.', max = 50,
}) {
  const list = Array.isArray(value) ? value : [];

  const set = (i, key, v) => {
    const next = list.map((row, k) => (k === i ? { ...row, [key]: v } : row));
    onChange?.(next);
  };
  const add = () => {
    const blank = {};
    fields.forEach((f) => { blank[f.key] = f.type === 'toggle' ? true : (f.default ?? ''); });
    onChange?.([...list, blank]);
  };
  const remove = (i) => onChange?.(list.filter((_, k) => k !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange?.(next);
  };

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}

      <div className="space-y-2.5">
        {list.map((row, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
            <div className="flex items-start gap-2">
              <span className="mt-2 text-gray-300 shrink-0"><GripVertical className="w-4 h-4" /></span>

              <div className="flex-1 grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(fields.length, 2)}, minmax(0,1fr))` }}>
                {fields.map((f) => {
                  const v = row?.[f.key];
                  const common = { key: f.key };
                  if (f.type === 'icon') {
                    return <div key={f.key} className="col-span-full sm:col-span-1"><IconPicker label={f.label} value={v || 'Sparkles'} onChange={(x) => set(i, f.key, x)} /></div>;
                  }
                  if (f.type === 'image') {
                    return <div key={f.key} className="col-span-full sm:col-span-1"><ImageUploader label={f.label} value={v || ''} folder={f.folder || 'general'} ratio="aspect-[3/2]" onChange={(x) => set(i, f.key, x)} /></div>;
                  }
                  if (f.type === 'toggle') {
                    return (
                      <label key={f.key} className="col-span-full sm:col-span-1 flex items-center gap-2 pt-6">
                        <ToggleSwitch checked={v !== false} onChange={(x) => set(i, f.key, x)} />
                        <span className="text-sm text-gray-700">{f.label}</span>
                      </label>
                    );
                  }
                  if (f.type === 'textarea') {
                    return (
                      <div key={f.key} className="col-span-full">
                        <span className="label">{f.label}</span>
                        <textarea className="input h-20 resize-y" value={v || ''} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} />
                      </div>
                    );
                  }
                  if (f.type === 'select') {
                    return (
                      <div key={f.key} className="col-span-full sm:col-span-1">
                        <span className="label">{f.label}</span>
                        <select className="input" value={v ?? ''} onChange={(e) => set(i, f.key, e.target.value)}>
                          {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div {...common} className={fields.length === 1 ? 'col-span-full' : 'col-span-full sm:col-span-1'}>
                      <span className="label">{f.label}</span>
                      <input
                        className="input"
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={v ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => set(i, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-white disabled:opacity-30" title="أعلى">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-white disabled:opacity-30" title="أسفل">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(i)} className="w-7 h-7 grid place-items-center rounded-lg text-danger hover:bg-red-50" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!list.length ? <p className="text-sm text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-xl">{emptyText}</p> : null}
      </div>

      {list.length < max ? (
        <button type="button" onClick={add} className="mt-2.5 btn btn-sm border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 w-full">
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      ) : null}
    </div>
  );
}
