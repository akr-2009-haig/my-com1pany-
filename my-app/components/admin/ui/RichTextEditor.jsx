'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon, Quote,
  Heading2, Heading3, Code, Undo2, Redo2, AlignRight, AlignCenter, AlignLeft, Eraser, Code2,
} from 'lucide-react';
import api from '../../../utils/api';

/**
 * Lightweight contentEditable WYSIWYG producing plain HTML (sanitised server side
 * by `cleanHtml`). No external editor dependency.
 */
export default function RichTextEditor({ value = '', onChange, label, minHeight = 260, folder = 'content' }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [html, setHtml] = useState(false); // raw HTML mode
  const [source, setSource] = useState(value || '');

  useEffect(() => {
    if (!html && ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
    if (html) setSource(value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, html]);

  const emit = () => onChange?.(ref.current?.innerHTML || '');

  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const addLink = () => {
    // eslint-disable-next-line no-alert
    const url = window.prompt('أدخل الرابط:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    try {
      const { data } = await api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      exec('insertHTML', `<img src="${data.url}" alt="" />`);
    } catch { /* ignore */ }
    if (fileRef.current) fileRef.current.value = '';
  };

  const Btn = ({ onClick, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 grid place-items-center rounded-lg text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-primary transition-colors">
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
          <Btn title="عريض" onClick={() => exec('bold')}><Bold className="w-4 h-4" /></Btn>
          <Btn title="مائل" onClick={() => exec('italic')}><Italic className="w-4 h-4" /></Btn>
          <Btn title="تحته خط" onClick={() => exec('underline')}><Underline className="w-4 h-4" /></Btn>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <Btn title="عنوان 2" onClick={() => exec('formatBlock', '<h2>')}><Heading2 className="w-4 h-4" /></Btn>
          <Btn title="عنوان 3" onClick={() => exec('formatBlock', '<h3>')}><Heading3 className="w-4 h-4" /></Btn>
          <Btn title="اقتباس" onClick={() => exec('formatBlock', '<blockquote>')}><Quote className="w-4 h-4" /></Btn>
          <Btn title="كود" onClick={() => exec('formatBlock', '<pre>')}><Code className="w-4 h-4" /></Btn>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <Btn title="قائمة نقطية" onClick={() => exec('insertUnorderedList')}><List className="w-4 h-4" /></Btn>
          <Btn title="قائمة رقمية" onClick={() => exec('insertOrderedList')}><ListOrdered className="w-4 h-4" /></Btn>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <Btn title="محاذاة يمين" onClick={() => exec('justifyRight')}><AlignRight className="w-4 h-4" /></Btn>
          <Btn title="توسيط" onClick={() => exec('justifyCenter')}><AlignCenter className="w-4 h-4" /></Btn>
          <Btn title="محاذاة يسار" onClick={() => exec('justifyLeft')}><AlignLeft className="w-4 h-4" /></Btn>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <Btn title="رابط" onClick={addLink}><Link2 className="w-4 h-4" /></Btn>
          <Btn title="صورة" onClick={() => fileRef.current?.click()}><ImageIcon className="w-4 h-4" /></Btn>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <Btn title="تراجع" onClick={() => exec('undo')}><Undo2 className="w-4 h-4" /></Btn>
          <Btn title="إعادة" onClick={() => exec('redo')}><Redo2 className="w-4 h-4" /></Btn>
          <Btn title="إزالة التنسيق" onClick={() => exec('removeFormat')}><Eraser className="w-4 h-4" /></Btn>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => setHtml((h) => !h)}
            className={`h-8 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors
              ${html ? 'bg-primary text-white' : 'text-gray-600 hover:bg-primary/10 hover:text-primary'}`}
          >
            <Code2 className="w-4 h-4" /> HTML
          </button>
        </div>

        {html ? (
          <textarea
            value={source}
            onChange={(e) => { setSource(e.target.value); onChange?.(e.target.value); }}
            style={{ minHeight }}
            dir="ltr"
            className="w-full p-4 text-xs font-mono outline-none resize-y"
          />
        ) : (
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onBlur={emit}
            style={{ minHeight }}
            className="prose-rtl p-4 outline-none text-sm overflow-y-auto max-h-[520px]"
          />
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
    </div>
  );
}
