'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Link2 } from 'lucide-react';
import api, { errMsg } from '../../../utils/api';

/** Single image field: upload to /api/upload/single or paste a URL. */
export default function ImageUploader({
  value = '', onChange, folder = 'general', label, hint, className = '', accept = 'image/*', ratio = 'aspect-video',
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const { data } = await api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange?.(data.url);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label ? <span className="label">{label}</span> : null}

      <div className={`relative ${ratio} w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 grid place-items-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <span className="flex flex-col items-center gap-2">
              <ImagePlus className="w-8 h-8" />
              <span className="text-xs font-semibold">اضغط لرفع صورة</span>
            </span>
          </button>
        )}

        {busy ? (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : null}

        {value && !busy ? (
          <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-8 h-8 grid place-items-center rounded-lg bg-white/95 text-primary shadow hover:bg-primary hover:text-white"
              title="استبدال"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange?.('')}
              className="w-8 h-8 grid place-items-center rounded-lg bg-white/95 text-danger shadow hover:bg-danger hover:text-white"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />

      <div className="flex items-center justify-between gap-2 mt-1.5">
        <p className="text-[11px] text-gray-400">{hint || 'PNG / JPG / WEBP / SVG — حتى 5 ميجابايت'}</p>
        <button type="button" onClick={() => setManual((m) => !m)} className="text-[11px] text-primary hover:underline flex items-center gap-1">
          <Link2 className="w-3 h-3" />
          {manual ? 'إخفاء الرابط' : 'إدخال رابط'}
        </button>
      </div>

      {manual ? (
        <input
          className="input mt-1.5 text-xs"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : null}

      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
