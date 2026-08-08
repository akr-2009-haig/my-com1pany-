'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../../components/shared/ToastProvider';
import Guard from '../../../components/admin/ui/Guard';
import PageHeader from '../../../components/admin/ui/PageHeader';
import DragList from '../../../components/admin/ui/DragList';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';
import useAuth from '../../../hooks/useAuth';

export default function SectionsOrderPage() {
  const { notify } = useToast();
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sections');
      const list = Array.isArray(data) ? data : (data.data || []);
      setItems([...list].sort((a, b) => (a.order || 0) - (b.order || 0)));
      setDirty(false);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (item, value) => {
    setItems((l) => l.map((s) => (s.key === item.key ? { ...s, isVisible: value } : s)));
    try {
      await api.patch(`/sections/${item.key}/toggle`, { value });
      notify(value ? `تم إظهار قسم «${item.label}»` : `تم إخفاء قسم «${item.label}»`, 'success');
    } catch (e) { notify(errMsg(e), 'error'); load(); }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await api.put('/sections/reorder', { items: items.map((s, i) => ({ _id: s._id, key: s.key, order: i })) });
      notify('تم حفظ ترتيب الأقسام بنجاح', 'success');
      setDirty(false);
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSaving(false); }
  };

  const visibleCount = items.filter((i) => i.isVisible).length;

  return (
    <Guard module="homepage">
      <PageHeader
        title="ترتيب أقسام الصفحة الرئيسية"
        subtitle="اسحب الأقسام لإعادة ترتيبها، وفعّل أو أخفِ أي قسم بضغطة واحدة"
        breadcrumb={[{ label: 'الصفحة الرئيسية' }, { label: 'ترتيب الأقسام' }]}
        actions={(
          <>
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
              <Eye className="w-4 h-4" /> معاينة
            </a>
            {can('homepage', 'edit') ? (
              <button type="button" onClick={saveOrder} disabled={saving || !dirty} className="btn btn-sm btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'جارٍ الحفظ...' : 'حفظ الترتيب'}
              </button>
            ) : null}
          </>
        )}
      />

      {loading ? (
        <div className="py-24 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
          <div className="admin-card p-5">
            <p className="text-sm text-gray-500 mb-4">
              الترتيب الحالي من الأعلى للأسفل هو نفس ترتيب ظهور الأقسام على الصفحة الرئيسية.
              {dirty ? <span className="text-orange-500 font-semibold"> — لديك تغييرات غير محفوظة</span> : null}
            </p>
            <DragList
              items={items}
              onReorder={(next) => { setItems(next); setDirty(true); }}
              renderItem={(item, i) => (
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-dark truncate">{item.label}</span>
                    <span className="block text-[11px] text-gray-400" dir="ltr">{item.key}</span>
                  </span>
                  <span className={`badge ${item.isVisible ? 'badge-green' : 'badge-gray'} hidden sm:inline-flex`}>
                    {item.isVisible ? <><Eye className="w-3 h-3" /> ظاهر</> : <><EyeOff className="w-3 h-3" /> مخفي</>}
                  </span>
                  {can('homepage', 'toggle') ? (
                    <span onClick={(e) => e.stopPropagation()} onDragStart={(e) => e.preventDefault()}>
                      <ToggleSwitch checked={Boolean(item.isVisible)} onChange={(v) => toggle(item, v)} size="sm" />
                    </span>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="admin-card p-5 space-y-4">
            <h3 className="font-bold text-dark">ملخّص</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">إجمالي الأقسام</span>
              <b className="text-dark">{items.length}</b>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">أقسام ظاهرة</span>
              <b className="text-green-600">{visibleCount}</b>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">أقسام مخفية</span>
              <b className="text-danger">{items.length - visibleCount}</b>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs text-gray-500 leading-relaxed">
              إخفاء قسم لا يحذف بياناته — يمكنك إعادة إظهاره في أي وقت. أما الترتيب فيجب حفظه بالضغط على «حفظ الترتيب».
            </p>
          </div>
        </div>
      )}
    </Guard>
  );
}
