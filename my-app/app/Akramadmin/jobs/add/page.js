'use client';

import { useEffect, useState } from 'react';
import ResourceForm from '../../../../components/admin/crud/ResourceForm';
import { JOB_DEFAULTS, jobGroups } from '../../../../components/admin/specs/jobFields';
import api from '../../../../utils/api';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function AddJobPage() {
  const [deps, setDeps] = useState([]);
  useEffect(() => {
    api.get('/job-departments', { params: { limit: 0 } }).then((r) => setDeps(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <ResourceForm
      endpoint="/jobs"
      module="jobs"
      title="إضافة وظيفة جديدة"
      breadcrumb={[{ label: 'الوظائف', href: `${ADMIN_BASE}/jobs` }, { label: 'إضافة' }]}
      backHref={`${ADMIN_BASE}/jobs`}
      groups={jobGroups(deps)}
      defaults={JOB_DEFAULTS}
    />
  );
}
