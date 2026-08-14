'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Save, Trash2, ChevronUp, ChevronDown, Folder, HelpCircle,
} from 'lucide-react';
import api, { errMsg } from '../../../../utils/api';
import { useToast } from '../../../../components/shared/ToastProvider';
import Guard from '../../../../components/admin/ui/Guard';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import ToggleSwitch from '../../../../components/admin/ui/ToggleSwitch';
import ConfirmModal from '../../../../components/admin/ui/ConfirmModal';
import { ADMIN_BASE } from '../../../../utils/constants';

function FaqCategoriesScreen() {
  const { notify } = useToast();
  const [list, setList] = useState([]);
  const [faqCounts, setFaqCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        api.get('/faq-categories', { params: { limit: 0 } }),
        api.get('/faqs', { params: { limit: 0 } }),
      ]);
      setList(c.data?.data || []);
      const counts = {};
      (f.data?.data || []).forEach((faq) => {
        const id = faq.category && typeof faq.category === 'object' ? faq.category._id : faq.category;
        if (id) counts[id] = (counts[id] || 0) + 1;
      });
      setFaqCounts(counts);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => { setEditingId(null); setName(''); setIsActive(true); };
  const startEdit = (c) => { setEditingId(c._id); setName(c.name); setIsActive(c.isActive !== false); };

  const save = async () => {
    if (!name.trim()) { notify('اسم التصنيف مطلوب', 'warning'); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), isActive };
      if (editingId) await api.put(`/faq-categories/${editingId}`, payload);
      else await api.post('/faq-categories', payload);
      notify(editingId ? 'تم تعديل التصنيف' : 'تم إضافة التصنيف', 'success');
      startAdd();
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (c) => {
    try { await api.put(`/faq-categories/${c._id}`, { isActive: c.isActive === false }); await load(); }
    catch (e) { notify(errMsg(e), 'error'); }
  };

  const move = async (c, dir) => {
    const i = list.findIndex((x) => x._id === c._id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    try { await api.put('/faq-categories/reorder', { items: next.map((x, idx) => ({ _id: x._id, order: idx })) }); }
    catch (e) { notify(errMsg(e), 'error'); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/faq-categories/${toDelete._id}`);
      notify('تم حذف التصنيف', 'success');
      setToDelete(null);
      await load();
    } catch (e) { notify(errMsg(e), 'error'); setToDelete(null); }
  };

  return (
    <Guard module="faq" action="edit">
      <PageHeader
        title="تصنيفات الأسئلة الشائعة"
        subtitle="التبويبات التي تُقسَّم عليها الأسئلة في صفحة الأسئلة الشائعة. أضف تصنيفات جديدة بلا حدود."
        breadcrumb={[{ label: 'الأسئلة الشائعة', href: `${ADMIN_BASE}/faq` }, { label: 'التصنيفات' }]}
        icon={<Folder className="w-6 h-6 text-primary" />}
        actions={(
          <button type="button" onClick={startAdd} className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4" /> إضافة تصنيف
          </button>
        )}
      />

      <div className="admin-card p-5">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-5 items-end">
          <div>
            <span className="label">{editingId ? 'تعديل التصنيف' : 'اسم التصنيف الجديد'}</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: الأسعار والباقات" />
          </div>
          <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
            <Save className="w-4 h-4" /> {editingId ? 'حفظ التعديل' : 'إضافة'}
          </button>
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
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><Folder className="w-4.5 h-4.5" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400" dir="ltr">{c.slug}</p>
                </div>
                <span className="badge-gray flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {faqCounts[String(c._id)] || 0} سؤال</span>
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

      <ConfirmModal
        open={Boolean(toDelete)}
        title="حذف التصنيف"
        message={toDelete && (faqCounts[String(toDelete._id)] || 0) > 0
          ? `يوجد ${faqCounts[String(toDelete._id)]} سؤال في هذا التصنيف. سيتم حذف التصنيف وستبقى الأسئلة (بدون تصنيف). هل أنت متأكد؟`
          : `سيتم حذف تصنيف «${toDelete?.name}» نهائياً. هل أنت متأكد؟`}
        confirmText="نعم، احذف"
        danger
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </Guard>
  );
}

export default function FaqCategoriesPage() {
  return <FaqCategoriesScreen />;
}
