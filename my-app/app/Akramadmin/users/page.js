'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, Mail, Phone, ShieldCheck, Users as UsersIcon,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { ADMIN_BASE } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatDate';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import DataTable from '../../../components/admin/ui/DataTable';
import Modal from '../../../components/admin/ui/Modal';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';
import UserFormFields, { USER_BLANK as BLANK, validateUser } from '../../../components/admin/users/UserFormFields';

function Avatar({ src, name }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover border border-gray-100" />;
  }
  return (
    <span className="w-9 h-9 rounded-full grid place-items-center bg-primary/10 text-primary text-sm font-bold shrink-0">
      {(name || '؟').trim().charAt(0)}
    </span>
  );
}

function UsersScreen() {
  const { notify } = useToast();
  const { user: me, can, refresh } = useAuth();

  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modal, setModal] = useState(null); // { mode:'add'|'edit', values }
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        params: { page, limit: perPage, search: debounced || undefined, role: roleFilter },
      });
      setRows(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debounced, roleFilter, notify]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/roles')
      .then(({ data }) => setRoles(data.data || []))
      .catch(() => setRoles([]));
  }, []);

  const roleOptions = useMemo(
    () => (roles.length ? roles.map((r) => ({ value: r.slug, label: r.name })) : [
      { value: 'admin', label: 'مدير عام' },
      { value: 'editor', label: 'محرر' },
      { value: 'viewer', label: 'مشاهد' },
    ]),
    [roles],
  );

  const setField = (k, v) => setModal((m) => ({ ...m, values: { ...m.values, [k]: v } }));

  const save = async () => {
    const isEdit = modal.mode === 'edit';
    const v = modal.values;
    const e = validateUser(v, isEdit);
    setErrors(e);
    if (Object.keys(e).length) { notify('يرجى تصحيح الحقول المطلوبة', 'warning'); return; }

    setSaving(true);
    try {
      const payload = { ...v };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) await api.put(`/users/${v._id}`, payload);
      else await api.post('/users', payload);
      notify(isEdit ? 'تم تحديث بيانات المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح', 'success');
      setModal(null);
      setErrors({});
      load();
      if (isEdit && String(v._id) === String(me?._id || me?.id)) refresh?.();
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row, val) => {
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, isActive: val } : r)));
    try {
      await api.put(`/users/${row._id}`, { isActive: val });
      notify(val ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم', val ? 'success' : 'warning');
    } catch (e) {
      notify(errMsg(e), 'error');
      load();
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/users/${toDelete._id}`);
      notify('تم حذف المستخدم', 'success');
      setToDelete(null);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
      setToDelete(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'المستخدم',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[190px]">
          <Avatar src={r.avatar} name={r.name} />
          <div className="min-w-0">
            <p className="font-semibold text-dark truncate">
              {r.name}
              {String(r._id) === String(me?._id || me?.id) ? <span className="badge-primary mr-2">أنت</span> : null}
            </p>
            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />{r.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'الهاتف',
      render: (r) => (r.phone
        ? <span className="flex items-center gap-1 text-gray-600 dir-ltr"><Phone className="w-3.5 h-3.5" />{r.phone}</span>
        : <span className="text-gray-300">—</span>),
    },
    {
      key: 'role',
      label: 'الدور',
      render: (r) => (
        <span className={r.role === 'admin' ? 'badge-purple' : 'badge-gray'}>
          {r.roleName || r.role}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (r) => (
        <ToggleSwitch
          size="sm"
          checked={r.isActive !== false}
          disabled={!can('users', 'toggle') || String(r._id) === String(me?._id || me?.id)}
          onChange={(v) => toggleActive(r, v)}
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (r) => <span className="text-gray-500 text-xs">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="المستخدمون"
        subtitle={`إدارة حسابات لوحة التحكم وصلاحياتها — ${total} مستخدم`}
        breadcrumb={[{ label: 'المستخدمون والصلاحيات' }, { label: 'المستخدمون' }]}
        icon={<UsersIcon className="w-6 h-6 text-primary" />}
        actions={(
          <>
            <Link href={`${ADMIN_BASE}/users/roles`} className="btn btn-sm btn-muted">
              <ShieldCheck className="w-4 h-4" /> الأدوار والصلاحيات
            </Link>
            {can('users', 'create') ? (
              <button
                type="button"
                onClick={() => { setErrors({}); setModal({ mode: 'add', values: { ...BLANK } }); }}
                className="btn btn-sm btn-primary"
              >
                <Plus className="w-4 h-4" /> إضافة مستخدم
              </button>
            ) : null}
          </>
        )}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث بالاسم أو البريد أو اسم المستخدم..."
        page={page}
        pages={pages}
        total={total}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        emptyText="لا يوجد مستخدمون مطابقون"
        toolbar={(
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white"
          >
            <option value="all">كل الأدوار</option>
            {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        actions={(row) => (
          <>
            {can('users', 'edit') ? (
              <button
                type="button"
                title="تعديل"
                onClick={() => { setErrors({}); setModal({ mode: 'edit', values: { ...BLANK, ...row, password: '' } }); }}
                className="w-8 h-8 grid place-items-center rounded-lg text-blue-600 hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4" />
              </button>
            ) : null}
            {can('users', 'delete') && String(row._id) !== String(me?._id || me?.id) ? (
              <button
                type="button"
                title="حذف"
                onClick={() => setToDelete(row)}
                className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </>
        )}
      />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
        subtitle="بيانات الدخول والصلاحية الممنوحة لهذا الحساب"
        size="lg"
        footer={(
          <>
            <button type="button" onClick={() => setModal(null)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
            <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
              {saving ? '...جارٍ الحفظ' : 'حفظ'}
            </button>
          </>
        )}
      >
        {modal ? (
          <UserFormFields
            values={modal.values}
            errors={errors}
            onChange={setField}
            roleOptions={roleOptions}
            isEdit={modal.mode === 'edit'}
          />
        ) : null}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="حذف المستخدم"
        message={`سيتم حذف حساب "${toDelete?.name}" نهائياً ولن يتمكن من الدخول للوحة التحكم. هل أنت متأكد؟`}
        confirmText="نعم، احذف"
        danger
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

export default function UsersPage() {
  return <Guard module="users"><UsersScreen /></Guard>;
}
