'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, Loader2, Save } from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../shared/ToastProvider';
import Guard from '../ui/Guard';
import PageHeader from '../ui/PageHeader';
import FormBuilder from '../form/FormBuilder';

/**
 * Standalone add/edit screen for a resource, with tabbed field groups,
 * a sticky action bar and an optional public preview link.
 */
export default function ResourceForm({
  endpoint,
  module: mod,
  id = null,
  title,
  subtitle,
  breadcrumb = [],
  backHref,
  groups,
  fields,
  defaults = {},
  beforeSave,
  toForm,
  validate,
  previewPath,
  aside,
  loadExtra,
}) {
  const router = useRouter();
  const { notify } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [extra, setExtra] = useState(null);

  const load = useCallback(async () => {
    if (loadExtra) {
      try { setExtra(await loadExtra()); } catch { /* ignore */ }
    }
    if (!isEdit) { setLoading(false); return; }
    try {
      const { data } = await api.get(`${endpoint}/${id}`);
      setForm({ ...defaults, ...(toForm ? toForm(data) : data) });
    } catch (e) {
      notify(errMsg(e), 'error');
      router.push(backHref);
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, id]);

  useEffect(() => { load(); }, [load]);

  const change = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const allFields = groups ? groups.flatMap((g) => g.fields) : (fields || []);

  const save = async (stay = false) => {
    const errs = validate ? (validate(form) || {}) : {};
    allFields.forEach((f) => {
      if (f.required && !String(form[f.name] ?? '').trim()) errs[f.name] = 'هذا الحقل مطلوب';
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      notify('يرجى تعبئة الحقول المطلوبة قبل الحفظ', 'warning');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      let payload = { ...form };
      delete payload._id; delete payload.createdAt; delete payload.updatedAt; delete payload.__v;
      if (beforeSave) payload = beforeSave(payload, isEdit);
      const res = isEdit ? await api.put(`${endpoint}/${id}`, payload) : await api.post(endpoint, payload);
      notify(isEdit ? 'تم حفظ التعديلات بنجاح' : 'تمت الإضافة بنجاح', 'success');
      if (!stay) router.push(backHref);
      else if (!isEdit && res.data?._id) router.replace(`${backHref}/edit/${res.data._id}`);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="py-24 grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Guard module={mod} action={isEdit ? 'edit' : 'create'}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
        actions={(
          <>
            <Link href={backHref} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
              <ArrowRight className="w-4 h-4" /> رجوع للقائمة
            </Link>
            {isEdit && previewPath && form.slug ? (
              <a href={previewPath(form)} target="_blank" rel="noreferrer" className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
                <Eye className="w-4 h-4" /> معاينة
              </a>
            ) : null}
            <button type="button" onClick={() => save(false)} disabled={saving} className="btn btn-sm btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        )}
      />

      <div className={aside ? 'grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start' : ''}>
        <div className="admin-card p-5 sm:p-6">
          <FormBuilder
            fields={fields}
            groups={groups}
            values={form}
            errors={errors}
            onChange={change}
          />
        </div>
        {aside ? <div className="space-y-4">{aside({ form, change, extra })}</div> : null}
      </div>

      <div className="sticky bottom-0 mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-end gap-2">
        <Link href={backHref} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</Link>
        <button type="button" onClick={() => save(true)} disabled={saving} className="btn btn-sm bg-white border border-primary text-primary hover:bg-primary hover:text-white">
          حفظ والبقاء
        </button>
        <button type="button" onClick={() => save(false)} disabled={saving} className="btn btn-sm btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
        </button>
      </div>
    </Guard>
  );
}
