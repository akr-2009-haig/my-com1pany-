'use client';

import { useEffect, useState } from 'react';
import ResourceForm from '../../../../../components/admin/crud/ResourceForm';
import { PROJECT_DEFAULTS, projectGroups } from '../../../../../components/admin/specs/projectFields';
import api from '../../../../../utils/api';
import { ADMIN_BASE } from '../../../../../utils/constants';

export default function EditProjectPage({ params }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get('/project-categories', { params: { limit: 0 } }).then((r) => setCats(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <ResourceForm
      endpoint="/projects"
      module="portfolio"
      id={params.id}
      title="تعديل المشروع"
      subtitle="حدّث بيانات المشروع ثم احفظ التغييرات"
      breadcrumb={[{ label: 'معرض الأعمال', href: `${ADMIN_BASE}/portfolio` }, { label: 'تعديل' }]}
      backHref={`${ADMIN_BASE}/portfolio`}
      groups={projectGroups(cats)}
      defaults={PROJECT_DEFAULTS}
      toForm={(d) => ({
        ...d,
        category: d.category && typeof d.category === 'object' ? d.category._id : (d.category || ''),
        projectDate: d.projectDate ? String(d.projectDate).slice(0, 10) : '',
      })}
      beforeSave={(p) => ({ ...p, cover: p.cover || (p.images || [])[0] || '' })}
      previewPath={(f) => `/portfolio/${f.slug}`}
    />
  );
}
