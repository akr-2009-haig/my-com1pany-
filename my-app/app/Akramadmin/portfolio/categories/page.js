'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Save, Trash2, ChevronUp, ChevronDown, X, Folder, AlertTriangle, Users,
} from 'lucide-react';
import api, { errMsg } from '../../../../utils/api';
import Icon from '../../../../components/shared/Icon';
import { useToast } from '../../../../components/shared/ToastProvider';
import Guard from '../../../../components/admin/ui/Guard';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import ToggleSwitch from '../../../../components/admin/ui/ToggleSwitch';
import { ADMIN_BASE } from '../../../../utils/constants';

function CategoriesScreen() {
  const { notify } = useToast();
  const [list, setList] = useState([]);
  const [projectCounts, setProjectCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [moveTarget, setMoveTarget] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/project-categories', { params: { limit: 0 } });
      setList(data.data || []);
      const counts = {};
      (data.data || []).forEach((c) => { counts[String(c._id)] = c.projectsCount || 0; });
      setProjectCounts(counts);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => { setEditingId(null); setName(''); setIcon('Folder'); setIsActive(true); };
  const startEdit = (c) => { setEditingId(c._id); setName(c.name); setIcon(c.icon || 'Folder'); setIsActive(c.isActive !== false); };

  const save = async () => {
    if (!name.trim()) { notify('اسم التصنيف مطلوب', 'warning'); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), icon, isActive };
      if (editingId) await api.put(`/project-categories/${editingId}`, payload);
      else await api.post('/project-categories', payload);
      notify(editingId ? 'تم تعديل التصنيف' : 'تم إضافة التصنيف', 'success');
      startAdd();
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (c) => {
    try { await api.put(`/project-categories/${c._id}`, { isActive: c.isActive === false }); await load(); }
    catch (e) { notify(errMsg(e), 'error'); }
  };

  const move = async (c, dir) => {
    const i = list.findIndex((x) => x._id === c._id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    try { await api.put('/project-categories/reorder', { items: next.map((x, idx) => ({ _id: x._id, order: idx })) }); }
    catch (e) { notify(errMsg(e), 'error'); }
  };

  const count = (c) => projectCounts[String(c._id)] || 0;

  const doDelete = async (mode) => {
    setBusy(true);
    try {
      const params = mode === 'move' && moveTarget ? { mode: 'move', moveTo: moveTarget } : { mode: 'delete' };
      await api.delete(`/project-categories/${toDelete._id}`, { params });
      notify('تم حذف التصنيف', 'success');
      setToDelete(null); setMoveTarget('');
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setBusy(false); }
  };

  const cancelDelete = () => { setToDelete(null); setMoveTarget(''); };

  return (
    <Guard module="portfolio" action="edit">
      <PageHeader
        title="تصنيفات المشاريع"
        subtitle="التصنيفات المستخدمة في معرض الأعمال ونموذج إضافة المشاريع. أضف/عدّل/حذف/رتّب بحرية."
        breadcrumb={[{ label: 'معرض الأعمال', href: `${ADMIN_BASE}/portfolio` }, { label: 'التصنيفات' }]}
        icon={<Folder className="w-6 h-6 text-primary" />}
        actions={(
          <button type="button" onClick={startAdd} className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4" /> إضافة تصنيف
          </button>
        )}
      />

      <div className="admin-card p-5">
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div>
            <span className="label">{editingId ? 'تعديل التصنيف' : 'اسم التصنيف الجديد'}</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: مواقع ويب" />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <span className="label">الأيقونة</span>
              <input className="input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Folder" />
            </div>
            <label className="flex items-center gap-2 pb-3">
              <ToggleSwitch checked={isActive} onChange={setIsActive} />
              <span className="text-sm text-gray-700">مفعّل</span>
            </label>
            <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary pb-3">
              <Save className="w-4 h-4" /> {editingId ? 'حفظ التعديل' : 'إضافة'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>
        ) : !list.length ? (
          <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-xl">لا توجد تصنيفات بعد.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((c, i) => (
              <li key={c._id} className="flex items-center gap-3 py-3">
                <span className="text-gray-300 cursor-grab"><ChevronUp className="w-4 h-4" /></span>
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><Icon name={c.icon} className="w-4.5 h-4.5" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400" dir="ltr">{c.slug}</p>
                </div>
                <span className="badge-gray flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {count(c)} مشروع</span>
                <label className="flex items-center"><ToggleSwitch checked={c.isActive !== false} onChange={() => toggleActive(c)} /></label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(c, -1)} disabled={i === 0} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="أعلى"><ChevronUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(c, 1)} disabled={i === list.length - 1} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="أسفل"><ChevronDown className="w-4 h-4" /></button>
                  <button type="button" onClick={() => startEdit(c)} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100" title="تعديل"><Save className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setToDelete(c)} className="w-7 h-7 grid place-items-center rounded-lg text-danger hover:bg-red-50" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-xl bg-red-100 text-danger grid place-items-center shrink-0"><AlertTriangle className="w-5 h-5" /></span>
              <div>
                <h3 className="font-bold text-dark">{count(toDelete) > 0 ? 'يوجد مشاريع مرتبطة' : 'حذف التصنيف'}</h3>
                <p className="text-xs text-gray-400">«{toDelete.name}»</p>
              </div>
            </div>

            {count(toDelete) > 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                يوجد <span className="font-bold text-danger">{count(toDelete)}</span> مشروع في هذا التصنيف.
                هل تريد نقلها إلى تصنيف آخر أم حذف التصنيف نهائياً (سيبقى حذف المشاريع قائماً)؟
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-4">سيتم حذف هذا التصنيف نهائياً. هل أنت متأكد؟</p>
            )}

            {count(toDelete) > 0 ? (
              <div className="mb-4">
                <span className="label">نقل المشاريع إلى تصنيف:</span>
                <select className="input" value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}>
                  <option value="">اختر تصنيفاً...</option>
                  {list.filter((x) => x._id !== toDelete._id).map((x) => (
                    <option key={x._id} value={x._id}>{x.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={cancelDelete} className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                <X className="w-4 h-4" /> إلغاء
              </button>
              {count(toDelete) > 0 ? (
                <button type="button" disabled={busy || !moveTarget} onClick={() => doDelete('move')} className="btn btn-sm btn-primary">
                  نقل وحذف التصنيف
                </button>
              ) : null}
              <button type="button" disabled={busy} onClick={() => doDelete('hard')} className="btn btn-sm btn-danger">
                <Trash2 className="w-4 h-4" /> حذف نهائي
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Guard>
  );
}

export default function ProjectCategoriesPage() {
  return <CategoriesScreen />;
}
