'use client';

'use client';

import { useEffect, useState } from 'react';
import ResourceForm from '../../../../../components/admin/crud/ResourceForm';
import { PACKAGE_DEFAULTS, packageGroups } from '../../../../../components/admin/specs/packageFields';
import api from '../../../../../utils/api';
import { ADMIN_BASE } from '../../../../../utils/constants';

export default function EditPackagePage({ params }) {
  const [currencies, setCurrencies] = useState(null);
  useEffect(() => {
    api.get('/settings').then((r) => setCurrencies(r.data?.dropdowns?.currencies || null)).catch(() => {});
  }, []);

  return (
    <ResourceForm
      endpoint="/packages"
      module="packages"
      id={params.id}
      title="تعديل الباقة"
      breadcrumb={[{ label: 'الباقات', href: `${ADMIN_BASE}/packages` }, { label: 'تعديل' }]}
      backHref={`${ADMIN_BASE}/packages`}
      groups={packageGroups(currencies)}
      defaults={PACKAGE_DEFAULTS}
      previewPath={() => '/pricing'}
    />
  );
}
