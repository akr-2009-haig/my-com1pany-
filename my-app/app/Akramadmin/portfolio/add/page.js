'use client';

import { useEffect, useState } from 'react';
import ResourceForm from '../../../../components/admin/crud/ResourceForm';
import { PROJECT_DEFAULTS, projectGroups } from '../../../../components/admin/specs/projectFields';
import api from '../../../../utils/api';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function AddProjectPage() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get('/project-categories', { params: { limit: 0 } }).then((r) => setCats(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <ResourceForm
      endpoint="/projects"
      module="portfolio"
      title="إضافة مشروع جديد"
      subtitle="أضف مشروعاً إلى معرض الأعمال"
      breadcrumb={[{ label: 'معرض الأعمال', href: `${ADMIN_BASE}/portfolio` }, { label: 'إضافة' }]}
      backHref={`${ADMIN_BASE}/portfolio`}
      groups={projectGroups(cats)}
      defaults={PROJECT_DEFAULTS}
      beforeSave={(p) => ({ ...p, cover: p.cover || (p.images || [])[0] || '' })}
    />
  );
}
