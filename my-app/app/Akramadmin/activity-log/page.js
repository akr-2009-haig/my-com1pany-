'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  History, Download, Trash2, RefreshCw, Filter, Globe, Monitor,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { formatDate, timeAgo } from '../../../utils/formatDate';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import DataTable from '../../../components/admin/ui/DataTable';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';

const MODULE_LABELS = {
  auth: 'الدخول والحساب', dashboard: 'لوحة المعلومات', homepage: 'الرئيسية', slides: 'السلايدر',
  stats: 'الإحصائيات', services: 'الخدمات', portfolio: 'معرض الأعمال', packages: 'الباقات',
  blog: 'المدونة', comments: 'التعليقات', messages: 'الرسائل', quotes: 'عروض الأسعار',
  packagerequests: 'طلبات الباقات', applications: 'طلبات التوظيف', jobs: 'الوظائف', team: 'الفريق',
  partners: 'الشركاء', testimonials: 'آراء العملاء', timeline: 'الجدول الزمني', faq: 'الأسئلة الشائعة',
  menus: 'القوائم', banners: 'البانرات', pages: 'الصفحات', settings: 'الإعدادات', users: 'المستخدمون',
  roles: 'الأدوار', analytics: 'التقارير', security: 'الأمان', backup: 'النسخ الاحتياطي',
};

const ACTION_STYLE = (action = '') => {
  if (/حذف|إزالة|رفع الحظر/.test(action)) return 'badge-red';
  if (/إضافة|إنشاء|رفع/.test(action)) return 'badge-green';
  if (/تعديل|تحديث|حفظ|تغيير/.test(action)) return 'badge-blue';
  if (/تفعيل|إيقاف|حظر/.test(action)) return 'badge-orange';
  return 'badge-gray';
};

function ActivityScreen() {
  const { notify } = useToast();
  const { can } = useAuth();

  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/security/activity-logs', {
        params: {
          page, limit: perPage, search: debounced || undefined,
          module: moduleFilter, user: userFilter,
          from: from || undefined, to: to || undefined,
        },
      });
      setRows(data.data || []);
      setUsers(data.users || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debounced, moduleFilter, userFilter, from, to, notify]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const res = await api.get('/analytics/export/activitylogs', {
        params: { from: from || undefined, to: to || undefined },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      notify('تم تصدير سجل النشاطات', 'success');
    } catch (e) {
      notify(errMsg(e), 'error');
    }
  };

  const clearLogs = async () => {
    try {
      const { data } = await api.delete('/security/logs/activity');
      notify(data?.message || 'تم مسح السجل', 'success');
      setClearOpen(false);
      setPage(1);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
      setClearOpen(false);
    }
  };

  const resetFilters = () => {
    setSearch(''); setModuleFilter('all'); setUserFilter('all'); setFrom(''); setTo(''); setPage(1);
  };

  const columns = [
    {
      key: 'userName',
      label: 'المستخدم',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-[140px]">
          <span className="w-8 h-8 rounded-full grid place-items-center bg-primary/10 text-primary text-xs font-bold shrink-0">
            {(r.userName || '؟').trim().charAt(0)}
          </span>
          <span className="font-semibold text-dark truncate">{r.userName || 'غير معروف'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'الإجراء',
      render: (r) => <span className={ACTION_STYLE(r.action)}>{r.action || '—'}</span>,
    },
    {
      key: 'module',
      label: 'القسم',
      render: (r) => <span className="text-gray-600">{MODULE_LABELS[r.module] || r.module || '—'}</span>,
    },
    {
      key: 'details',
      label: 'التفاصيل',
      render: (r) => (
        <span className="text-gray-500 text-xs line-clamp-2 max-w-[280px] block" title={r.details}>
          {r.details || '—'}
        </span>
      ),
    },
    {
      key: 'ip',
      label: 'IP / المتصفح',
      render: (r) => (
        <div className="text-xs text-gray-500 space-y-0.5 min-w-[130px]">
          <p className="flex items-center gap-1 dir-ltr justify-end"><span>{r.ip || '—'}</span><Globe className="w-3 h-3" /></p>
          {r.userAgent ? (
            <p className="flex items-center gap-1 truncate max-w-[160px]" title={r.userAgent}>
              <Monitor className="w-3 h-3 shrink-0" />
              <span className="truncate">{String(r.userAgent).split(')')[0].split('(').pop()}</span>
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (r) => (
        <div className="text-xs min-w-[120px]">
          <p className="text-gray-700">{formatDate(r.createdAt, { withTime: true })}</p>
          <p className="text-gray-400">{timeAgo(r.createdAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="سجل النشاطات"
        subtitle={`تتبّع كل عملية إضافة أو تعديل أو حذف داخل لوحة التحكم — ${total} سجل`}
        breadcrumb={[{ label: 'المستخدمون والصلاحيات' }, { label: 'سجل النشاطات' }]}
        icon={<History className="w-6 h-6 text-primary" />}
        actions={(
          <>
            <button type="button" onClick={load} className="btn btn-sm btn-muted">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
            </button>
            <button type="button" onClick={exportCsv} className="btn btn-sm btn-muted">
              <Download className="w-4 h-4" /> تصدير CSV
            </button>
            {can('security', 'delete') ? (
              <button type="button" onClick={() => setClearOpen(true)} className="btn btn-sm btn-danger">
                <Trash2 className="w-4 h-4" /> مسح السجل
              </button>
            ) : null}
          </>
        )}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث بالمستخدم أو الإجراء أو التفاصيل..."
        page={page}
        pages={pages}
        total={total}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        emptyText="لا توجد نشاطات مسجلة بعد — سيتم تسجيل كل عملية تعديل تلقائياً"
        compact
        toolbar={(
          <>
            <select
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white"
            >
              <option value="all">كل الأقسام</option>
              {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white"
            >
              <option value="all">كل المستخدمين</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" aria-label="من تاريخ" />
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" aria-label="إلى تاريخ" />
            <button type="button" onClick={resetFilters} className="btn btn-sm btn-muted">
              <Filter className="w-4 h-4" /> إعادة تعيين
            </button>
          </>
        )}
      />

      <ConfirmModal
        open={clearOpen}
        title="مسح سجل النشاطات"
        message="سيتم حذف جميع سجلات النشاط نهائياً. هذا الإجراء لا يمكن التراجع عنه — يُنصح بتصدير نسخة CSV أولاً."
        confirmText="نعم، امسح السجل"
        danger
        onConfirm={clearLogs}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  );
}

export default function ActivityLogPage() {
  return <Guard module="activity"><ActivityScreen /></Guard>;
}
