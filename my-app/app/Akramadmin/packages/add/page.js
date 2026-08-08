'use client';

import ResourceForm from '../../../../components/admin/crud/ResourceForm';
import { PACKAGE_DEFAULTS, PACKAGE_GROUPS } from '../../../../components/admin/specs/packageFields';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function AddPackagePage() {
  return (
    <ResourceForm
      endpoint="/packages"
      module="packages"
      title="إضافة باقة جديدة"
      breadcrumb={[{ label: 'الباقات', href: `${ADMIN_BASE}/packages` }, { label: 'إضافة' }]}
      backHref={`${ADMIN_BASE}/packages`}
      groups={PACKAGE_GROUPS}
      defaults={PACKAGE_DEFAULTS}
    />
  );
}
