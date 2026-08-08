'use client';

import { useRef, useState } from 'react';
import {
  ImagePlus, Loader2, Trash2, ChevronRight, ChevronLeft,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';

/** Gallery field – array of image URLs with upload, reorder and delete. */
export default function MultiImageUploader({
  value = [], onChange, folder = 'gallery', label, max = 12,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const list = Array.isArray(value) ? value : [];

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      Array.from(files).slice(0, max - list.length).forEach((f) => fd.append('files', f));
      fd.append('folder', folder);
      const { data } = await api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange?.([...list, ...(data.files || []).map((f) => f.url)]);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const move = (i, dir) => {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange?.(next);
  };

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 grid place-items-center rounded-lg bg-white text-gray-700 disabled:opacity-40" title="تقديم">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="w-7 h-7 grid place-items-center rounded-lg bg-white text-gray-700 disabled:opacity-40" title="تأخير">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onChange?.(list.filter((_, k) => k !== i))} className="w-7 h-7 grid place-items-center rounded-lg bg-danger text-white" title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {i === 0 ? <span className="absolute top-1.5 right-1.5 badge-primary text-[10px]">الغلاف</span> : null}
          </div>
        ))}

        {list.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 grid place-items-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {busy ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
              <span className="flex flex-col items-center gap-1.5">
                <ImagePlus className="w-6 h-6" />
                <span className="text-[11px] font-semibold">إضافة صور</span>
              </span>
            )}
          </button>
        ) : null}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      {error ? <p className="field-error">{error}</p> : null}
      <p className="text-[11px] text-gray-400 mt-1.5">{list.length} / {max} صورة — الصورة الأولى تُستخدم كغلاف افتراضي.</p>
    </div>
  );
}
