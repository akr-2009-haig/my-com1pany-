'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../shared/ToastProvider';
import Guard from '../ui/Guard';
import PageHeader from '../ui/PageHeader';
import FormBuilder from '../form/FormBuilder';
import { ADMIN_BASE } from '../../../utils/constants';

/**
 * Editor for one settings group. When `group` is null the fields are read from
 * (and written to) the root settings document.
 */
export default function SettingsSection({
  group = null,
  title,
  subtitle,
  fields = [],
  groups = null,
  defaults = {},
  extra,
  breadcrumbLabel,
}) {
  const { notify } = useToast();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
      setForm({ ...defaults, ...(group ? (data[group] || {}) : data) });
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => { load(); }, [load]);

  const change = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const all = groups ? groups.flatMap((g) => g.fields) : fields;
      const payload = {};
      all.forEach((f) => { payload[f.name] = form[f.name]; });
      if (group) await api.put(`/settings/${group}`, payload);
      else await api.put('/settings', payload);
      notify('تم حفظ الإعدادات بنجاح', 'success');
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="py-24 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Guard module="settings" action="edit">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={[{ label: 'الإعدادات', href: `${ADMIN_BASE}/settings` }, { label: breadcrumbLabel || title }]}
        actions={(
          <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
          </button>
        )}
      />

      <div className="space-y-5">
        <div className="admin-card p-5 sm:p-6">
          <FormBuilder fields={fields} groups={groups} values={form} onChange={change} />
        </div>
        {typeof extra === 'function' ? extra({ form, change, settings, reload: load }) : extra}
      </div>

      <div className="sticky bottom-0 mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الإعدادات
        </button>
      </div>
    </Guard>
  );
}
