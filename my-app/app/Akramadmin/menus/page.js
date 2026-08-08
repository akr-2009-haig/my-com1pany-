'use client';

import {
  Fragment, useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  List, Plus, Pencil, Trash2, ExternalLink, CornerDownLeft, Save, GripVertical, Loader2,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import Modal from '../../../components/admin/ui/Modal';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';

const LOCATIONS = [
  { key: 'header', label: 'القائمة العلوية (Header)' },
  { key: 'footer', label: 'قائمة الفوتر (Footer)' },
];

const BLANK = { title: '', titleEn: '', url: '/', location: 'header', parent: '', target: '_self', isActive: true, order: 0 };

function MenusScreen() {
  const { notify } = useToast();
  const { can } = useAuth();

  const [location, setLocation] = useState('header');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [drag, setDrag] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/menus', { params: { location, limit: 200, sort: 'order' } });
      const list = Array.isArray(data) ? data : (data.data || []);
      setItems(list);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [location, notify]);

  useEffect(() => { load(); }, [load]);

  const roots = useMemo(
    () => items.filter((i) => !i.parent).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [items],
  );
  const childrenOf = useCallback(
    (id) => items.filter((i) => String(i.parent) === String(id)).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [items],
  );

  const openAdd = (parent = '') => {
    setModal({ mode: 'add', values: { ...BLANK, location, parent, order: items.length } });
  };
  const openEdit = (row) => setModal({ mode: 'edit', values: { ...BLANK, ...row } });
  const setField = (k, v) => setModal((m) => ({ ...m, values: { ...m.values, [k]: v } }));

  const save = async () => {
    const v = modal.values;
    if (!v.title?.trim()) { notify('عنوان العنصر مطلوب', 'warning'); return; }
    if (!v.url?.trim()) { notify('الرابط مطلوب', 'warning'); return; }
    setSaving(true);
    try {
      if (modal.mode === 'edit') await api.put(`/menus/${v._id}`, v);
      else await api.post('/menus', v);
      notify(modal.mode === 'edit' ? 'تم تحديث عنصر القائمة' : 'تم إضافة عنصر جديد للقائمة', 'success');
      setModal(null);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      const kids = childrenOf(toDelete._id);
      await Promise.all(kids.map((k) => api.delete(`/menus/${k._id}`)));
      await api.delete(`/menus/${toDelete._id}`);
      notify('تم حذف العنصر' + (kids.length ? ` و${kids.length} عنصر فرعي` : ''), 'success');
      setToDelete(null);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
      setToDelete(null);
    }
  };

  const toggleActive = async (row, val) => {
    setItems((list) => list.map((i) => (i._id === row._id ? { ...i, isActive: val } : i)));
    try {
      await api.put(`/menus/${row._id}`, { isActive: val });
    } catch (e) {
      notify(errMsg(e), 'error');
      load();
    }
  };

  /** Persist new order for a set of sibling items. */
  const persistOrder = async (list) => {
    setReordering(true);
    try {
      await api.put('/menus/reorder', { items: list.map((it, i) => ({ _id: it._id, order: i })) });
      notify('تم حفظ الترتيب الجديد', 'success');
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
      load();
    } finally {
      setReordering(false);
    }
  };

  const onDrop = (targetIdx, parentId) => {
    if (!drag || drag.parent !== String(parentId || '')) { setDrag(null); return; }
    const siblings = parentId ? childrenOf(parentId) : roots;
    const fromIdx = siblings.findIndex((s) => s._id === drag.id);
    if (fromIdx < 0 || fromIdx === targetIdx) { setDrag(null); return; }
    const next = [...siblings];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(targetIdx, 0, moved);
    setDrag(null);
    // optimistic local reorder
    setItems((list) => list.map((i) => {
      const idx = next.findIndex((n) => n._id === i._id);
      return idx >= 0 ? { ...i, order: idx } : i;
    }));
    persistOrder(next);
  };

  const Row = ({ item, index, parentId = '', isChild = false }) => (
    <li
      draggable={can('menus', 'edit')}
      onDragStart={() => setDrag({ id: item._id, parent: String(parentId || '') })}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index, parentId)}
      className={`rounded-xl border bg-white transition-all ${isChild ? 'border-gray-100 mr-8' : 'border-gray-200'}
        ${drag?.id === item._id ? 'opacity-40' : 'hover:border-primary/40'}`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <GripVertical className={`w-4 h-4 shrink-0 ${can('menus', 'edit') ? 'text-gray-300 cursor-grab' : 'text-gray-200'}`} />
        {isChild ? <CornerDownLeft className="w-3.5 h-3.5 text-gray-300 shrink-0" /> : null}

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-dark text-sm truncate">
            {item.title}
            {item.titleEn ? <span className="text-xs text-gray-400 font-normal mr-2 dir-ltr">{item.titleEn}</span> : null}
          </p>
          <p className="text-xs text-gray-400 dir-ltr text-right truncate flex items-center gap-1 justify-end">
            {item.target === '_blank' ? <ExternalLink className="w-3 h-3" /> : null}
            <span>{item.url}</span>
          </p>
        </div>

        <ToggleSwitch
          size="sm"
          checked={item.isActive !== false}
          disabled={!can('menus', 'toggle')}
          onChange={(v) => toggleActive(item, v)}
        />

        {!isChild && can('menus', 'create') ? (
          <button type="button" onClick={() => openAdd(item._id)} title="إضافة عنصر فرعي" className="w-8 h-8 grid place-items-center rounded-lg text-primary hover:bg-primary/10">
            <Plus className="w-4 h-4" />
          </button>
        ) : null}
        {can('menus', 'edit') ? (
          <button type="button" onClick={() => openEdit(item)} title="تعديل" className="w-8 h-8 grid place-items-center rounded-lg text-blue-600 hover:bg-blue-50">
            <Pencil className="w-4 h-4" />
          </button>
        ) : null}
        {can('menus', 'delete') ? (
          <button type="button" onClick={() => setToDelete(item)} title="حذف" className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </li>
  );

  const parentOptions = roots.filter((r) => r._id !== modal?.values?._id);

  return (
    <div>
      <PageHeader
        title="إدارة القوائم"
        subtitle="رتّب روابط قائمة الموقع بالسحب والإفلات وأضف قوائم فرعية منسدلة"
        breadcrumb={[{ label: 'القوائم' }]}
        icon={<List className="w-6 h-6 text-primary" />}
        actions={can('menus', 'create') ? (
          <button type="button" onClick={() => openAdd('')} className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4" /> إضافة رابط
          </button>
        ) : null}
      />

      <div className="admin-card p-1.5 mb-5 flex gap-1 w-fit">
        {LOCATIONS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setLocation(l.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors
              ${location === l.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="admin-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            اسحب العناصر لإعادة ترتيبها — يتم الحفظ تلقائياً. العناصر الفرعية تظهر كقائمة منسدلة في الموقع.
          </p>
          {reordering ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : null}
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : !roots.length ? (
          <div className="py-14 text-center border border-dashed border-gray-200 rounded-xl">
            <List className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-sm text-gray-400 mt-2">لا توجد روابط في هذه القائمة بعد</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {roots.map((item, i) => (
              <Fragment key={item._id}>
                <Row item={item} index={i} parentId="" />
                {childrenOf(item._id).map((c, ci) => (
                  <Row key={c._id} item={c} index={ci} parentId={item._id} isChild />
                ))}
              </Fragment>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'تعديل رابط القائمة' : 'إضافة رابط جديد'}
        subtitle="سيظهر هذا الرابط في قائمة الموقع مباشرة بعد الحفظ"
        footer={(
          <>
            <button type="button" onClick={() => setModal(null)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
            <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
              <Save className="w-4 h-4" /> {saving ? '...جارٍ الحفظ' : 'حفظ'}
            </button>
          </>
        )}
      >
        {modal ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className="label">العنوان (عربي) *</span>
              <input value={modal.values.title} onChange={(e) => setField('title', e.target.value)} className="input" placeholder="من نحن" />
            </div>
            <div>
              <span className="label">العنوان (إنجليزي)</span>
              <input dir="ltr" value={modal.values.titleEn || ''} onChange={(e) => setField('titleEn', e.target.value)} className="input text-left" placeholder="About Us" />
            </div>
            <div className="sm:col-span-2">
              <span className="label">الرابط *</span>
              <input dir="ltr" value={modal.values.url} onChange={(e) => setField('url', e.target.value)} className="input text-left" placeholder="/about" />
              <p className="text-[11px] text-gray-400 mt-1">استخدم مساراً داخلياً مثل /services أو رابطاً كاملاً https://…</p>
            </div>
            <div>
              <span className="label">موقع القائمة</span>
              <select value={modal.values.location} onChange={(e) => setField('location', e.target.value)} className="input">
                {LOCATIONS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <span className="label">العنصر الأب (اختياري)</span>
              <select value={modal.values.parent || ''} onChange={(e) => setField('parent', e.target.value)} className="input">
                <option value="">— رابط رئيسي —</option>
                {parentOptions.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <span className="label">طريقة الفتح</span>
              <select value={modal.values.target} onChange={(e) => setField('target', e.target.value)} className="input">
                <option value="_self">نفس النافذة</option>
                <option value="_blank">نافذة جديدة</option>
              </select>
            </div>
            <div>
              <span className="label">الترتيب</span>
              <input type="number" value={modal.values.order ?? 0} onChange={(e) => setField('order', Number(e.target.value))} className="input" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-dark">إظهار الرابط</p>
                <p className="text-xs text-gray-500">عند الإيقاف لن يظهر الرابط للزوار</p>
              </div>
              <ToggleSwitch checked={modal.values.isActive !== false} onChange={(v) => setField('isActive', v)} />
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="حذف رابط القائمة"
        message={`سيتم حذف "${toDelete?.title}"${toDelete && childrenOf(toDelete._id).length ? ` مع ${childrenOf(toDelete._id).length} عنصر فرعي` : ''} نهائياً.`}
        confirmText="نعم، احذف"
        danger
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

export default function MenusPage() {
  return <Guard module="menus"><MenusScreen /></Guard>;
}
