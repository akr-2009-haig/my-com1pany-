'use client';

import { STATUS_LABELS, STATUS_STYLES } from '../../../utils/constants';

export default function Badge({ status, label, className = '' }) {
  const cls = STATUS_STYLES[status] || className || 'badge-gray';
  return <span className={cls}>{label || STATUS_LABELS[status] || status || '—'}</span>;
}
