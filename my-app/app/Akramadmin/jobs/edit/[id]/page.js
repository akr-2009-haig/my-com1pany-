'use client';

import { useEffect, useState } from 'react';
import ResourceForm from '../../../../../components/admin/crud/ResourceForm';
import { JOB_DEFAULTS, jobGroups } from '../../../../../components/admin/specs/jobFields';
import api from '../../../../../utils/api';
import { ADMIN_BASE } from '../../../../../utils/constants';

export default function EditJobPage({ params }) {
  const [deps, setDeps] = useState([]);
  useEffect(() => {
    api.get('/job-departments', { params: { limit: 0 } }).then((r) => setDeps(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <ResourceForm
      endpoint="/jobs"
      module="jobs"
      id={params.id}
      title="تعديل الوظيفة"
      breadcrumb={[{ label: 'الوظائف', href: `${ADMIN_BASE}/jobs` }, { label: 'تعديل' }]}
      backHref={`${ADMIN_BASE}/jobs`}
      groups={jobGroups(deps)}
      defaults={JOB_DEFAULTS}
      toForm={(d) => ({ ...d, deadline: d.deadline ? String(d.deadline).slice(0, 10) : '' })}
      previewPath={(f) => `/careers/${f.slug}`}
    />
  );
}
