'use client';

import { useState } from 'react';
import { ListFilter, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';

/**
 * Unified "قائمة إدارة القائمة المنسدلة" box used across the admin panel.
 *
 * value = {
 *   options: string[]                     // simple lists
 *         | { label, desc }[]             // lists with descriptions
 *   placeholder?: string
 *   visible?: boolean
 *   required?: boolean
 *   dynamicFromServices?: boolean
 *   showDescriptions?: boolean
 *   showIcon?: boolean
 *   currencySymbol?: string
 * }
 *
 * opts:
 *   withDynamicFromServices  show the "ديناميكي من الخدمات" toggle
 *   withDescriptions         each option has a label + short description
 *   withIcon                 show the "إظهار الأيقونة" toggle + a fixed emoji
 *   withCurrencySymbol       show the default currency symbol input
 *   icon                     emoji used when withIcon is on
 *   addLabel                 label for the "+ إضافة خيار" button
 *   placeholderLabel         label for the placeholder field
 */
function OptionRow({ row, fields, index, count, onSet, onMove, onRemove }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-2.5 text-gray-300 shrink-0 cursor-grab"><GripVertical className="w-4 h-4" /></span>

        <div className="flex-1 grid gap-2.5" style={{ gridTemplateColumns: fields.length > 1 ? '1fr 1fr' : '1fr' }}>
          {fields.map((f) => (
            <div key={f.key} className={fields.length > 1 ? '' : 'col-span-full'}>
              <span className="label">{f.label}</span>
              <input
                className="input"
                value={row[f.key] ?? ''}
                placeholder={f.placeholder}
                onChange={(e) => onSet(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-white disabled:opacity-30" title="أعلى">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-white disabled:opacity-30" title="أسفل">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button type="button" onClick={onRemove} className="w-7 h-7 grid place-items-center rounded-lg text-danger hover:bg-red-50" title="حذف">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DropdownManager({
  title,
  description,
  value = {},
  onChange,
  opts = {},
}) {
  const {
    withDynamicFromServices = false,
    withDescriptions = false,
    withIcon = false,
    withCurrencySymbol = false,
    icon = '💰',
    addLabel = '+ إضافة خيار',
    placeholderLabel = 'النص الافتراضي (Placeholder)',
  } = opts;

  const v = value || {};
  const rawOptions = Array.isArray(v.options) ? v.options : [];
  const rows = rawOptions.map((o) => (
    typeof o === 'string'
      ? { label: o, desc: '' }
      : { label: o?.label ?? '', desc: o?.desc ?? '' }
  ));

  const toOptions = (next) => (
    withDescriptions
      ? next.map((r) => ({ label: r.label, desc: r.desc }))
      : next.map((r) => r.label)
  );

  const setRows = (nextRows) => onChange({ ...v, options: toOptions(nextRows) });

  const setRow = (i, key, val) => {
    const next = rows.map((r, k) => (k === i ? { ...r, [key]: val } : r));
    setRows(next);
  };
  const addRow = () => setRows([...rows, { label: '', desc: '' }]);
  const removeRow = (i) => setRows(rows.filter((_, k) => k !== i));
  const moveRow = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  const set = (key, val) => onChange({ ...v, [key]: val });

  const fields = withDescriptions
    ? [
        { key: 'label', label: 'الاسم الرئيسي', placeholder: 'مثال: موقع ويب' },
        { key: 'desc', label: 'الوصف المختصر (اختياري)', placeholder: 'موقع شركة، متجر، مدونة...' },
      ]
    : [{ key: 'label', label: 'الخيار', placeholder: 'اكتب نص الخيار...' }];

  return (
    <div className="admin-card p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><ListFilter className="w-4.5 h-4.5" /></span>
        <div>
          <h3 className="font-bold text-dark text-sm">{title}</h3>
          {description ? <p className="text-xs text-gray-400 mt-0.5">{description}</p> : null}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {rows.map((row, i) => (
          <OptionRow
            key={i}
            row={row}
            fields={fields}
            index={i}
            count={rows.length}
            onSet={(k, val) => setRow(i, k, val)}
            onMove={(dir) => moveRow(i, dir)}
            onRemove={() => removeRow(i)}
          />
        ))}
        {!rows.length ? (
          <p className="text-sm text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-xl">لا توجد خيارات بعد.</p>
        ) : null}
      </div>

      <button type="button" onClick={addRow} className="mt-2.5 btn btn-sm border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 w-full">
        <Plus className="w-4 h-4" /> {addLabel}
      </button>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60">
            <span className="text-sm font-semibold text-gray-700">إظهار / إخفاء الحقل</span>
            <ToggleSwitch checked={v.visible !== false} onChange={(x) => set('visible', x)} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60">
            <span className="text-sm font-semibold text-gray-700">إجباري / اختياري</span>
            <ToggleSwitch checked={v.required === true} onChange={(x) => set('required', x)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {withDynamicFromServices ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60">
              <span className="text-sm font-semibold text-gray-700">ديناميكي من الخدمات</span>
              <ToggleSwitch checked={v.dynamicFromServices === true} onChange={(x) => set('dynamicFromServices', x)} />
            </div>
          ) : null}
          {withDescriptions ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60">
              <span className="text-sm font-semibold text-gray-700">إظهار وصف الخيارات</span>
              <ToggleSwitch checked={v.showDescriptions !== false} onChange={(x) => set('showDescriptions', x)} />
            </div>
          ) : null}
          {withIcon ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60">
              <span className="text-sm font-semibold text-gray-700">إظهار أيقونة {icon}</span>
              <ToggleSwitch checked={v.showIcon === true} onChange={(x) => set('showIcon', x)} />
            </div>
          ) : null}
          {withCurrencySymbol ? (
            <div>
              <span className="label">العملة الافتراضية للعرض</span>
              <input
                className="input"
                dir="ltr"
                value={v.currencySymbol || ''}
                placeholder="$"
                onChange={(e) => set('currencySymbol', e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div>
          <span className="label">{placeholderLabel}</span>
          <input className="input" value={v.placeholder || ''} placeholder="اختر..." onChange={(e) => set('placeholder', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
