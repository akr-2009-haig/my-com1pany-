'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Save, Trash2, Users, ChevronUp, ChevronDown, Briefcase,
} from 'lucide-react';
import api, { errMsg } from '../../../../utils/api';
import { useToast } from '../../../../components/shared/ToastProvider';
import Guard from '../../../../components/admin/ui/Guard';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import ConfirmModal from '../../../../components/admin/ui/ConfirmModal';
import { ADMIN_BASE } from '../../../../utils/constants';

function DepartmentsScreen() {
  const { notify } = useToast();
  const [list, setList] = useState([]);
  const [jobCounts, setJobCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, j] = await Promise.all([
        api.get('/job-departments', { params: { limit: 0 } }),
        api.get('/jobs', { params: { limit: 0 } }),
      ]);
      setList(d.data?.data || []);
      const jobs = j.data?.data || [];
      const counts = {};
      jobs.forEach((jb) => { counts[jb.department] = (counts[jb.department] || 0) + 1; });
      setJobCounts(counts);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => { setEditingId(null); setName(''); };
  const startEdit = (dep) => { setEditingId(dep._id); setName(dep.name); };

  const save = async () => {
    if (!name.trim()) { notify('اسم القسم مطلوب', 'warning'); return; }
    setSaving(true);
    try {
      if (editingId) await api.put(`/job-departments/${editingId}`, { name: name.trim() });
      else await api.post('/job-departments', { name: name.trim() });
      notify(editingId ? 'تم تعديل القسم' : 'تم إضافة القسم', 'success');
      setName(''); setEditingId(null);
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSaving(false); }
  };

  const move = async (dep, dir) => {
    const i = list.findIndex((x) => x._id === dep._id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    const ordered = next.map((x, idx) => ({ _id: x._id, order: idx }));
    setList(next);
    try { await api.put('/job-departments/reorder', { items: ordered }); } catch (e) { notify(errMsg(e), 'error'); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/job-departments/${toDelete._id}`);
      notify('تم حذف القسم', 'success');
      setToDelete(null);
      await load();
    } catch (e) { notify(errMsg(e), 'error'); setToDelete(null); }
  };

  const jobsCount = (dep) => jobCounts[dep.name] || 0;

  return (
    <Guard module="settings" action="edit">
      <PageHeader
        title="أقسام الشركة"
        subtitle="الأقسام التي تظهر في نموذج الوظائف وفلترة الوظائف. أضف/عدّل/حذف/رتّب بحرية."
        breadcrumb={[{ label: 'الإعدادات', href: `${ADMIN_BASE}/settings` }, { label: 'أقسام الشركة' }]}
        icon={<Briefcase className="w-6 h-6 text-primary" />}
        actions={(
          <button type="button" onClick={startAdd} className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4" /> إضافة قسم
          </button>
        )}
      />

      <div className="admin-card p-5">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-5 items-end">
          <div>
            <span className="label">{editingId ? 'تعديل القسم' : 'اسم القسم الجديد'}</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: التطوير والبرمجة" />
          </div>
          <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
            {saving ? null : <Save className="w-4 h-4" />} {editingId ? 'حفظ التعديل' : 'إضافة'}
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>
        ) : !list.length ? (
          <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-xl">لا توجد أقسام بعد.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((dep, i) => (
              <li key={dep._id} className="flex items-center gap-3 py-3">
                <span className="text-gray-300 cursor-grab"><ChevronUp className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm truncate">{dep.name}</p>
                  <p className="text-xs text-gray-400" dir="ltr">{dep.slug}</p>
                </div>
                <span className="badge-gray flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {jobsCount(dep)} وظيفة
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(dep, -1)} disabled={i === 0} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="أعلى"><ChevronUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(dep, 1)} disabled={i === list.length - 1} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="أسفل"><ChevronDown className="w-4 h-4" /></button>
                  <button type="button" onClick={() => startEdit(dep)} className="w-7 h-7 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100" title="تعديل">
                    <Save className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setToDelete(dep)} className="w-7 h-7 grid place-items-center rounded-lg text-danger hover:bg-red-50" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        open={Boolean(toDelete)}
        title={toDelete && jobsCount(toDelete) > 0 ? 'تنبيه: يوجد وظائف مرتبطة' : 'حذف القسم'}
        message={toDelete && jobsCount(toDelete) > 0
          ? `يوجد ${jobsCount(toDelete)} وظيفة في قسم «${toDelete.name}». سيتم حذف القسم مع بقاء الوظائف مسجّلة باسم القسم الحالي. هل تريد المتابعة؟`
          : `سيتم حذف قسم «${toDelete?.name}» نهائياً. هل أنت متأكد؟`}
        confirmText="نعم، احذف"
        danger
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </Guard>
  );
}

export default function DepartmentsPage() {
  return <DepartmentsScreen />;
}
