'use client';

import ResourceForm from '../../../../../components/admin/crud/ResourceForm';
import { SERVICE_DEFAULTS, SERVICE_GROUPS } from '../../../../../components/admin/specs/serviceFields';
import { ADMIN_BASE } from '../../../../../utils/constants';

export default function EditServicePage({ params }) {
  return (
    <ResourceForm
      endpoint="/services"
      module="services"
      id={params.id}
      title="تعديل الخدمة"
      subtitle="حدّث بيانات الخدمة ثم احفظ التغييرات"
      breadcrumb={[{ label: 'الخدمات', href: `${ADMIN_BASE}/services` }, { label: 'تعديل' }]}
      backHref={`${ADMIN_BASE}/services`}
      groups={SERVICE_GROUPS}
      defaults={SERVICE_DEFAULTS}
      previewPath={(f) => `/services/${f.slug}`}
    />
  );
}
