'use client';

import ResourceForm from '../../../../components/admin/crud/ResourceForm';
import { SERVICE_DEFAULTS, SERVICE_GROUPS } from '../../../../components/admin/specs/serviceFields';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function AddServicePage() {
  return (
    <ResourceForm
      endpoint="/services"
      module="services"
      title="إضافة خدمة جديدة"
      subtitle="أدخل تفاصيل الخدمة التي ستظهر على الموقع"
      breadcrumb={[{ label: 'الخدمات', href: `${ADMIN_BASE}/services` }, { label: 'إضافة' }]}
      backHref={`${ADMIN_BASE}/services`}
      groups={SERVICE_GROUPS}
      defaults={SERVICE_DEFAULTS}
    />
  );
}
