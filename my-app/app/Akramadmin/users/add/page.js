'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, UserPlus, ArrowRight } from 'lucide-react';
import api, { errMsg } from '../../../../utils/api';
import { ADMIN_BASE } from '../../../../utils/constants';
import { useToast } from '../../../../components/shared/ToastProvider';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import Guard from '../../../../components/admin/ui/Guard';
import UserFormFields, { USER_BLANK, validateUser } from '../../../../components/admin/users/UserFormFields';

function AddUserScreen() {
  const router = useRouter();
  const { notify } = useToast();

  const [values, setValues] = useState({ ...USER_BLANK });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/roles')
      .then(({ data }) => setRoles((data.data || []).map((r) => ({ value: r.slug, label: r.name }))))
      .catch(() => setRoles([
        { value: 'admin', label: 'مدير عام' },
        { value: 'editor', label: 'محرر' },
        { value: 'viewer', label: 'مشاهد' },
      ]));
  }, []);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    const e = validateUser(values, false);
    setErrors(e);
    if (Object.keys(e).length) { notify('يرجى تصحيح الحقول المطلوبة', 'warning'); return; }
    setSaving(true);
    try {
      await api.post('/users', values);
      notify('تم إضافة المستخدم بنجاح', 'success');
      router.push(`${ADMIN_BASE}/users`);
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="إضافة مستخدم جديد"
        subtitle="أنشئ حساباً جديداً للوصول إلى لوحة التحكم وحدد دوره"
        breadcrumb={[{ label: 'المستخدمون', href: `${ADMIN_BASE}/users` }, { label: 'إضافة مستخدم' }]}
        icon={<UserPlus className="w-6 h-6 text-primary" />}
        actions={(
          <Link href={`${ADMIN_BASE}/users`} className="btn btn-sm btn-muted">
            <ArrowRight className="w-4 h-4" /> رجوع للقائمة
          </Link>
        )}
      />

      <div className="admin-card p-5 sm:p-6">
        <UserFormFields
          values={values}
          errors={errors}
          onChange={set}
          roleOptions={roles}
          isEdit={false}
        />
      </div>

      <div className="sticky bottom-0 mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-end gap-2 z-30">
        <Link href={`${ADMIN_BASE}/users`} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</Link>
        <button type="button" onClick={submit} disabled={saving} className="btn btn-sm btn-primary">
          <Save className="w-4 h-4" /> {saving ? '...جارٍ الحفظ' : 'حفظ المستخدم'}
        </button>
      </div>
    </div>
  );
}

export default function AddUserPage() {
  return <Guard module="users" action="create"><AddUserScreen /></Guard>;
}
