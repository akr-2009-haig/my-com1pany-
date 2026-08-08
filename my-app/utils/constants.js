export const COLORS = {
  primary: '#00BCD4',
  primaryDark: '#00ACC1',
  dark: '#1a1a2e',
  danger: '#e74c3c',
  success: '#22c55e',
  warning: '#f97316',
  purple: '#8b5cf6',
  blue: '#3b82f6',
};

export const STATUS_LABELS = {
  new: 'جديد', read: 'مقروء', replied: 'تم الرد', archived: 'مؤرشف',
  reviewing: 'قيد المراجعة', sent: 'تم إرسال عرض', rejected: 'مرفوض', completed: 'مكتمل',
  shortlisted: 'مقبول مبدئياً', interview: 'مقابلة', accepted: 'مقبول',
  pending: 'بانتظار الموافقة', approved: 'موافق عليه',
  published: 'منشور', draft: 'مسودة', scheduled: 'مجدول',
};

export const STATUS_STYLES = {
  new: 'badge-blue', read: 'badge-gray', replied: 'badge-green', archived: 'badge-gray',
  reviewing: 'badge-orange', sent: 'badge-green', rejected: 'badge-red', completed: 'badge-gray',
  shortlisted: 'badge-purple', interview: 'badge-orange', accepted: 'badge-green',
  pending: 'badge-orange', approved: 'badge-green',
  published: 'badge-green', draft: 'badge-gray', scheduled: 'badge-orange',
};

export const JOB_TYPES = [
  { value: 'full-time', label: 'دوام كامل' },
  { value: 'part-time', label: 'دوام جزئي' },
  { value: 'remote', label: 'عن بُعد' },
  { value: 'contract', label: 'تعاقد' },
];

export const CURRENCIES = [
  { value: 'SAR', label: 'ريال سعودي (ر.س)' },
  { value: 'USD', label: 'دولار أمريكي ($)' },
  { value: 'AED', label: 'درهم إماراتي (د.إ)' },
  { value: 'EGP', label: 'جنيه مصري (ج.م)' },
  { value: 'KWD', label: 'دينار كويتي (د.ك)' },
  { value: 'QAR', label: 'ريال قطري (ر.ق)' },
  { value: 'EUR', label: 'يورو (€)' },
];

export const ADMIN_BASE = '/Akramadmin';
