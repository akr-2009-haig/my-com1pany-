'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, RotateCcw, Save } from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../shared/ToastProvider';
import Guard from '../ui/Guard';
import PageHeader from '../ui/PageHeader';
import FormBuilder from '../form/FormBuilder';
import RichTextEditor from '../ui/RichTextEditor';
import { formatDate } from '../../../utils/formatDate';

/**
 * Editor for a singleton `pages` document (about / contact / privacy / ...).
 * `dataFields` (or `dataGroups`) edit the free-form `data` object;
 * `withContent` adds the rich HTML body.
 */
export default function PageEditor({
  pageKey,
  title,
  subtitle,
  breadcrumb = [],
  withTitle = true,
  withContent = false,
  contentLabel = 'محتوى الصفحة',
  dataFields = null,
  dataGroups = null,
  defaults = {},
  previewHref,
  children,
}) {
  const { notify } = useToast();
  const [doc, setDoc] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', data: { ...defaults } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/pages/${pageKey}`);
      setDoc(data);
      setForm({
        title: data.title || '',
        content: data.content || '',
        data: { ...defaults, ...(data.data || {}) },
      });
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  useEffect(() => { load(); }, [load]);

  const changeData = (name, value) => setForm((f) => ({ ...f, data: { ...f.data, [name]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/pages/${pageKey}`, form);
      setDoc(data);
      notify('تم حفظ الصفحة بنجاح', 'success');
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="py-24 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <Guard module="pages" action="edit">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
        actions={(
          <>
            {previewHref ? (
              <a href={previewHref} target="_blank" rel="noreferrer" className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
                <ExternalLink className="w-4 h-4" /> معاينة الصفحة
              </a>
            ) : null}
            <button type="button" onClick={load} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
              <RotateCcw className="w-4 h-4" /> استرجاع المحفوظ
            </button>
            <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </button>
          </>
        )}
      />

      <div className="space-y-5">
        {withTitle ? (
          <div className="admin-card p-5">
            <span className="label">عنوان الصفحة</span>
            <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
        ) : null}

        {(dataFields || dataGroups) ? (
          <div className="admin-card p-5 sm:p-6">
            <FormBuilder fields={dataFields || []} groups={dataGroups} values={form.data} onChange={changeData} />
          </div>
        ) : null}

        {withContent ? (
          <div className="admin-card p-5 sm:p-6">
            <RichTextEditor label={contentLabel} value={form.content} minHeight={380} folder="pages" onChange={(v) => setForm((f) => ({ ...f, content: v }))} />
          </div>
        ) : null}

        {typeof children === 'function' ? children({ form, setForm, changeData, reload: load }) : children}

        {doc?.updatedAt ? (
          <p className="text-xs text-gray-400 text-center">
            آخر تحديث: {formatDate(doc.updatedAt, { withTime: true })}
            {doc.updatedBy ? ` — بواسطة ${doc.updatedBy}` : ''}
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التغييرات
        </button>
      </div>
    </Guard>
  );
}
