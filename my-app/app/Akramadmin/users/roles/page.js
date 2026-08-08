'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, ShieldCheck, Lock, Users as UsersIcon, Save, X,
} from 'lucide-react';
import api, { errMsg } from '../../../../utils/api';
import { ADMIN_BASE } from '../../../../utils/constants';
import { useToast } from '../../../../components/shared/ToastProvider';
import useAuth from '../../../../hooks/useAuth';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import Guard from '../../../../components/admin/ui/Guard';
import ConfirmModal from '../../../../components/admin/ui/ConfirmModal';
import PermissionsTable from '../../../../components/admin/ui/PermissionsTable';

function RolesScreen() {
  const { notify } = useToast();
  const { can } = useAuth();

  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null); // { _id?, name, slug, description, permissions, isSystem }
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async (keepId) => {
    setLoading(true);
    try {
      const { data } = await api.get('/roles');
      const list = data.data || [];
      setRoles(list);
      setModules(data.modules || []);
      const next = list.find((r) => r._id === keepId) || list[0];
      if (next) { setActiveId(next._id); setDraft({ ...next }); }
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const selectRole = (r) => {
    setCreating(false);
    setActiveId(r._id);
    setDraft({ ...r });
  };

  const startCreate = () => {
    setCreating(true);
    setActiveId(null);
    setDraft({ name: '', description: '', permissions: {}, isSystem: false });
  };

  const dirty = useMemo(() => {
    if (creating) return true;
    const original = roles.find((r) => r._id === activeId);
    if (!original || !draft) return false;
    return JSON.stringify({ n: original.name, d: original.description || '', p: original.permissions || {} })
      !== JSON.stringify({ n: draft.name, d: draft.description || '', p: draft.permissions || {} });
  }, [creating, roles, activeId, draft]);

  const save = async () => {
    if (!draft?.name?.trim()) { notify('اسم الدور مطلوب', 'warning'); return; }
    setSaving(true);
    try {
      if (creating) {
        const { data } = await api.post('/roles', {
          name: draft.name, description: draft.description, permissions: draft.permissions,
        });
        notify('تم إنشاء الدور بنجاح', 'success');
        setCreating(false);
        await load(data?._id);
      } else {
        await api.put(`/roles/${draft._id}`, {
          name: draft.name, description: draft.description, permissions: draft.permissions,
        });
        notify('تم حفظ صلاحيات الدور بنجاح', 'success');
        await load(draft._id);
      }
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/roles/${toDelete._id}`);
      notify('تم حذف الدور', 'success');
      setToDelete(null);
      await load();
    } catch (e) {
      notify(errMsg(e), 'error');
      setToDelete(null);
    }
  };

  const isAdminRole = draft?.slug === 'admin';
  const readOnlyMatrix = !can('roles', 'edit') || isAdminRole;

  return (
    <div>
      <PageHeader
        title="الأدوار والصلاحيات"
        subtitle="حدد ما يستطيع كل دور رؤيته وتعديله داخل لوحة التحكم"
        breadcrumb={[{ label: 'المستخدمون والصلاحيات' }, { label: 'الأدوار والصلاحيات' }]}
        icon={<ShieldCheck className="w-6 h-6 text-primary" />}
        actions={(
          <>
            <Link href={`${ADMIN_BASE}/users`} className="btn btn-sm btn-muted">
              <UsersIcon className="w-4 h-4" /> المستخدمون
            </Link>
            {can('roles', 'create') ? (
              <button type="button" onClick={startCreate} className="btn btn-sm btn-primary">
                <Plus className="w-4 h-4" /> دور جديد
              </button>
            ) : null}
          </>
        )}
      />

      <div className="grid lg:grid-cols-[290px,1fr] gap-5 items-start">
        {/* Roles list */}
        <aside className="admin-card p-3 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-dark px-2 py-1.5">الأدوار ({roles.length})</h3>
          {loading ? (
            <div className="space-y-2 mt-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <ul className="space-y-1.5 mt-1">
              {roles.map((r) => (
                <li key={r._id}>
                  <button
                    type="button"
                    onClick={() => selectRole(r)}
                    className={`w-full text-right rounded-xl px-3 py-2.5 border transition-all
                      ${activeId === r._id && !creating
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-gray-100 hover:border-primary/40 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-dark text-sm flex-1 truncate">{r.name}</span>
                      {r.isSystem ? <Lock className="w-3.5 h-3.5 text-gray-400" title="دور أساسي" /> : null}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 font-mono dir-ltr">{r.slug}</span>
                      <span className="badge-gray text-[10px]">{r.usersCount || 0} مستخدم</span>
                    </div>
                  </button>
                </li>
              ))}
              {creating ? (
                <li className="rounded-xl px-3 py-2.5 border border-dashed border-primary bg-primary/5 text-sm font-semibold text-primary">
                  دور جديد (غير محفوظ)
                </li>
              ) : null}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <section className="space-y-5">
          {!draft ? (
            <div className="admin-card p-10 text-center text-gray-400 text-sm">اختر دوراً من القائمة لعرض صلاحياته</div>
          ) : (
            <>
              <div className="admin-card p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="label">اسم الدور *</span>
                    <input
                      value={draft.name || ''}
                      disabled={!can('roles', 'edit') && !creating}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="input"
                      placeholder="مثال: مسؤول المحتوى"
                    />
                  </div>
                  <div>
                    <span className="label">المعرّف (slug)</span>
                    <input
                      value={draft.slug || '— يُنشأ تلقائياً —'}
                      disabled
                      dir="ltr"
                      className="input text-left bg-gray-50 text-gray-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="label">وصف الدور</span>
                    <input
                      value={draft.description || ''}
                      disabled={!can('roles', 'edit') && !creating}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      className="input"
                      placeholder="وصف مختصر لمهام هذا الدور"
                    />
                  </div>
                </div>

                {draft.isSystem ? (
                  <p className="mt-4 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    هذا دور أساسي في النظام ولا يمكن حذفه.
                    {isAdminRole ? ' كما أن دور المدير العام يمتلك كل الصلاحيات دائماً.' : ''}
                  </p>
                ) : null}
              </div>

              <PermissionsTable
                modules={modules}
                value={isAdminRole ? Object.fromEntries(modules.map((m) => [m.key, Object.fromEntries(m.actions.map((a) => [a, true]))])) : (draft.permissions || {})}
                disabled={readOnlyMatrix}
                onChange={(v) => setDraft({ ...draft, permissions: v })}
              />
            </>
          )}
        </section>
      </div>

      {draft && (can('roles', 'edit') || creating) ? (
        <div className="sticky bottom-0 mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 flex items-center justify-between gap-2 z-30">
          <p className="text-xs text-gray-500 hidden sm:block">
            {dirty ? 'لديك تغييرات غير محفوظة' : 'كل التغييرات محفوظة'}
          </p>
          <div className="flex gap-2 mr-auto">
            {!creating && draft._id && !draft.isSystem && can('roles', 'delete') ? (
              <button type="button" onClick={() => setToDelete(draft)} className="btn btn-sm btn-danger">
                <Trash2 className="w-4 h-4" /> حذف الدور
              </button>
            ) : null}
            {creating ? (
              <button type="button" onClick={() => { setCreating(false); load(); }} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">
                <X className="w-4 h-4" /> إلغاء
              </button>
            ) : null}
            <button type="button" onClick={save} disabled={saving || (!dirty && !creating)} className="btn btn-sm btn-primary">
              <Save className="w-4 h-4" /> {saving ? '...جارٍ الحفظ' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={!!toDelete}
        title="حذف الدور"
        message={`سيتم حذف دور "${toDelete?.name}" نهائياً. لا يمكن الحذف إذا كان مستخدماً من قبل أي حساب.`}
        confirmText="نعم، احذف"
        danger
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

export default function RolesPage() {
  return <Guard module="roles"><RolesScreen /></Guard>;
}
