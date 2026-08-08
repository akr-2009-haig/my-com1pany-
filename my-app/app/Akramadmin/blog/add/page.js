'use client';

import { useEffect, useState } from 'react';
import ResourceForm from '../../../../components/admin/crud/ResourceForm';
import { POST_DEFAULTS, postGroups } from '../../../../components/admin/specs/postFields';
import api from '../../../../utils/api';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function AddPostPage() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get('/post-categories', { params: { limit: 0 } }).then((r) => setCats(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <ResourceForm
      endpoint="/posts"
      module="blog"
      title="كتابة مقال جديد"
      breadcrumb={[{ label: 'المدونة', href: `${ADMIN_BASE}/blog` }, { label: 'مقال جديد' }]}
      backHref={`${ADMIN_BASE}/blog`}
      groups={postGroups(cats)}
      defaults={POST_DEFAULTS}
    />
  );
}
