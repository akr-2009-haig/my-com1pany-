'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download, Pencil, Plus, Trash2, ArrowDownUp, Save, X, Check,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../ui/PageHeader';
import Guard from '../ui/Guard';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import ToggleSwitch from '../ui/ToggleSwitch';
import DragList from '../ui/DragList';
import FormBuilder from '../form/FormBuilder';

/**
 * Full-featured CRUD screen driven by declarative column + field specs.
 *
 * Props:
 *  endpoint    – API path, e.g. '/services'
 *  module      – permission module key
 *  title/subtitle/breadcrumb
 *  columns     – DataTable columns
 *  fields      – FormBuilder field specs (or `groups`)
 *  defaults    – blank record
 *  searchable  – enable server search
 *  filters     – [{ key, label, options }]
 *  toggleField – field name toggled from the list (default isActive)
 *  reorderable – show drag-to-order mode
 *  bulk        – enable bulk selection
 *  exportable  – show CSV export
 *  beforeSave  – (payload, isEdit) => payload
 *  toForm      – (row) => form values
 *  extraRowActions – (row, ctx) => ReactNode
 */
export default function CrudPage({
  endpoint,
  module: mod,
  title,
  subtitle,
  breadcrumb = [],
  columns = [],
  fields = [],
  groups = null,
  defaults = {},
  searchable = true,
  filters = [],
  toggleField = 'isActive',
  reorderable = false,
  bulk = true,
  exportable = false,
  perPageDefault = 20,
  modalSize = 'lg',
  addLabel = 'إضافة جديد',
  beforeSave,
  toForm,
  validate,
  extraRowActions,
  extraHeaderActions,
  addHref = null,
  editHref = null,
  emptyText,
  onLoaded,
  dragTitle = (r) => r.title || r.name || r.label,
}) {
  const { notify } = useToast();
  const { can } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(perPageDefault);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState('');
  const [filterState, setFilterState] = useState({});
  const [selected, setSelected] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [orderMode, setOrderMode] = useState(false);
  const [orderRows, setOrderRows] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: orderMode ? 0 : perPage };
      if (debounced) params.search = debounced;
      if (sort) params.sort = sort;
      Object.entries(filterState).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await api.get(endpoint, { params });
      const list = Array.isArray(data) ? data : (data.data || []);
      setRows(list);
      setOrderRows(list);
      setPages(data.pages || 1);
      setTotal(data.total ?? list.length);
      onLoaded?.(list, data);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, perPage, debounced, sort, filterState, orderMode, notify, onLoaded]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...defaults });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...defaults, ...(toForm ? toForm(row) : row) });
    setErrors({});
    setOpen(true);
  };

  const change = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const save = async () => {
    const errs = validate ? (validate(form) || {}) : {};
    (groups ? groups.flatMap((g) => g.fields) : fields).forEach((f) => {
      if (f.required && !String(form[f.name] ?? '').trim()) errs[f.name] = 'هذا الحقل مطلوب';
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      notify('يرجى تعبئة الحقول المطلوبة', 'warning');
      return;
    }
    setSaving(true);
    try {
      let payload = { ...form };
      delete payload._id; delete payload.createdAt; delete payload.updatedAt; delete payload.__v;
      if (beforeSave) payload = beforeSave(payload, Boolean(editing));
      if (editing) await api.put(`${endpoint}/${editing._id}`, payload);
      else await api.post(endpoint, payload);
      notify(editing ? 'تم حفظ التعديلات بنجاح' : 'تمت الإضافة بنجاح', 'success');
      setOpen(false);
      await load();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      notify('تم الحذف بنجاح', 'success');
      setConfirm(null);
      setSelected((s) => s.filter((x) => x !== id));
      await load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const toggle = async (row, value) => {
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, [toggleField]: value } : r)));
    try {
      await api.patch(`${endpoint}/${row._id}/toggle`, { field: toggleField, value });
    } catch (e) {
      notify(errMsg(e), 'error');
      await load();
    }
  };

  const runBulk = async (action, extra = {}) => {
    try {
      const { data } = await api.post(`${endpoint}/bulk`, { ids: selected, action, ...extra });
      notify(data.message || 'تم تنفيذ الإجراء', 'success');
      setSelected([]);
      setConfirm(null);
      await load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await api.put(`${endpoint}/reorder`, { items: orderRows.map((r, i) => ({ _id: r._id, order: i })) });
      notify('تم حفظ الترتيب بنجاح', 'success');
      setOrderMode(false);
      await load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSavingOrder(false); }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get(`${endpoint}/export`, { responseType: 'blob', params: filterState });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${endpoint.replace(/\//g, '')}-${Date.now()}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const tableColumns = useMemo(() => {
    const base = [...columns];
    if (toggleField && can(mod, 'toggle')) {
      base.push({
        key: toggleField,
        label: 'الحالة',
        width: '90px',
        render: (row) => <ToggleSwitch checked={Boolean(row[toggleField])} onChange={(v) => toggle(row, v)} size="sm" />,
      });
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, toggleField, mod]);

  return (
    <Guard module={mod}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
        actions={(
          <>
            {extraHeaderActions}
            {exportable ? (
              <button type="button" onClick={exportCsv} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
                <Download className="w-4 h-4" /> تصدير CSV
              </button>
            ) : null}
            {reorderable && can(mod, 'edit') ? (
              orderMode ? (
                <>
                  <button type="button" onClick={() => { setOrderMode(false); setOrderRows(rows); }} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">
                    <X className="w-4 h-4" /> إلغاء
                  </button>
                  <button type="button" onClick={saveOrder} disabled={savingOrder} className="btn btn-sm btn-primary">
                    <Save className="w-4 h-4" /> {savingOrder ? 'جارٍ الحفظ...' : 'حفظ الترتيب'}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setOrderMode(true)} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
                  <ArrowDownUp className="w-4 h-4" /> ترتيب
                </button>
              )
            ) : null}
            {can(mod, 'create') && !orderMode ? (
              addHref ? (
                <Link href={addHref} className="btn btn-sm btn-primary">
                  <Plus className="w-4 h-4" /> {addLabel}
                </Link>
              ) : (
                <button type="button" onClick={openAdd} className="btn btn-sm btn-primary">
                  <Plus className="w-4 h-4" /> {addLabel}
                </button>
              )
            ) : null}
          </>
        )}
      />

      {orderMode ? (
        <div className="admin-card p-4">
          <p className="text-sm text-gray-500 mb-3">اسحب العناصر لإعادة ترتيبها ثم اضغط «حفظ الترتيب».</p>
          <DragList
            items={orderRows}
            onReorder={setOrderRows}
            renderItem={(item, i) => (
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary grid place-items-center text-xs font-bold">{i + 1}</span>
                <span className="text-sm font-semibold text-dark truncate">{dragTitle(item)}</span>
              </div>
            )}
          />
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          rows={rows}
          loading={loading}
          emptyText={emptyText}
          selectable={bulk && can(mod, 'delete')}
          selected={selected}
          onSelect={setSelected}
          page={page}
          pages={pages}
          total={total}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          sort={sort}
          onSortChange={setSort}
          search={searchable ? search : undefined}
          onSearchChange={searchable ? setSearch : undefined}
          toolbar={filters.length ? filters.map((f) => (
            <select
              key={f.key}
              value={filterState[f.key] || ''}
              onChange={(e) => { setFilterState((s) => ({ ...s, [f.key]: e.target.value })); setPage(1); }}
              className="input py-2.5 text-sm w-auto min-w-[150px]"
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
            </select>
          )) : null}
          bulkBar={(
            <>
              {can(mod, 'edit') ? (
                <>
                  <button type="button" onClick={() => runBulk('activate')} className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
                    <Check className="w-4 h-4" /> تفعيل
                  </button>
                  <button type="button" onClick={() => runBulk('deactivate')} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">
                    <X className="w-4 h-4" /> تعطيل
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setConfirm({ bulk: true, count: selected.length })}
                className="btn btn-sm bg-danger text-white hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" /> حذف المحدد
              </button>
            </>
          )}
          actions={(row) => (
            <>
              {extraRowActions ? extraRowActions(row, { reload: load, notify }) : null}
              {can(mod, 'edit') ? (
                editHref ? (
                  <Link href={editHref(row)} title="تعديل" className="w-8 h-8 grid place-items-center rounded-lg text-primary hover:bg-primary hover:text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </Link>
                ) : (
                  <button type="button" onClick={() => openEdit(row)} title="تعديل" className="w-8 h-8 grid place-items-center rounded-lg text-primary hover:bg-primary hover:text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                )
              ) : null}
              {can(mod, 'delete') ? (
                <button type="button" onClick={() => setConfirm({ id: row._id, name: dragTitle(row) })} title="حذف" className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-danger hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : null}
            </>
          )}
        />
      )}

      <Modal
        open={open}
        size={modalSize}
        title={editing ? `تعديل: ${dragTitle(editing) || ''}` : addLabel}
        onClose={() => setOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
            <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        )}
      >
        <FormBuilder fields={fields} groups={groups} values={form} errors={errors} onChange={change} />
      </Modal>

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.bulk ? 'حذف العناصر المحددة' : 'تأكيد الحذف'}
        message={confirm?.bulk
          ? `سيتم حذف ${confirm.count} عنصر نهائياً. هل أنت متأكد؟`
          : `سيتم حذف «${confirm?.name || ''}» نهائياً ولا يمكن التراجع. هل أنت متأكد؟`}
        confirmText="نعم، احذف"
        onCancel={() => setConfirm(null)}
        onConfirm={() => (confirm?.bulk ? runBulk('delete') : remove(confirm.id))}
      />
    </Guard>
  );
}
