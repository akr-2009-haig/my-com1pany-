'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowLeft, Loader2, RefreshCw,
} from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../../components/shared/ToastProvider';
import useAuth from '../../hooks/useAuth';
import Guard from '../../components/admin/ui/Guard';
import PageHeader from '../../components/admin/ui/PageHeader';
import StatsCard from '../../components/admin/ui/StatsCard';
import Badge from '../../components/admin/ui/Badge';
import LineChart from '../../components/admin/charts/LineChart';
import PieChart from '../../components/admin/charts/PieChart';
import BarChart from '../../components/admin/charts/BarChart';
import Icon from '../../components/shared/Icon';
import { ADMIN_BASE } from '../../utils/constants';
import { formatDate, timeAgo } from '../../utils/formatDate';

const QUICK = [
  { label: 'إضافة خدمة', href: `${ADMIN_BASE}/services`, icon: 'Wrench', module: 'services' },
  { label: 'إضافة مشروع', href: `${ADMIN_BASE}/portfolio/add`, icon: 'Briefcase', module: 'portfolio' },
  { label: 'كتابة مقال', href: `${ADMIN_BASE}/blog/add`, icon: 'Newspaper', module: 'blog' },
  { label: 'إضافة وظيفة', href: `${ADMIN_BASE}/jobs/add`, icon: 'Users', module: 'jobs' },
  { label: 'الإعدادات', href: `${ADMIN_BASE}/settings`, icon: 'Settings', module: 'settings' },
  { label: 'التقارير', href: `${ADMIN_BASE}/analytics`, icon: 'BarChart3', module: 'analytics' },
];

export default function DashboardPage() {
  const { notify } = useToast();
  const { user, can } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/overview');
      setData(res.data);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const cards = data?.cards || {};

  return (
    <Guard module="dashboard">
      <PageHeader
        title={`أهلاً بك، ${user?.name || ''} 👋`}
        subtitle="نظرة سريعة على أداء الموقع وآخر الطلبات"
        actions={(
          <button type="button" onClick={load} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
        )}
      />

      {loading && !data ? (
        <div className="py-24 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard title="زيارات آخر 30 يوم" value={cards.visits?.value ?? 0} change={cards.visits?.change} icon="Gauge" color="#00BCD4" />
            <StatsCard title="طلبات عروض أسعار جديدة" value={cards.quotes?.value ?? 0} change={cards.quotes?.change} icon="Inbox" color="#8b5cf6" href={`${ADMIN_BASE}/quotes`} />
            <StatsCard title="رسائل غير مقروءة" value={cards.messages?.value ?? 0} change={cards.messages?.change} icon="Mail" color="#f97316" href={`${ADMIN_BASE}/messages`} />
            <StatsCard title="المشاريع النشطة" value={cards.projects?.value ?? 0} icon="Briefcase" color="#22c55e" hint="منشورة على الموقع" href={`${ADMIN_BASE}/portfolio`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="admin-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dark">حركة الزيارات — آخر 30 يوم</h3>
                <Link href={`${ADMIN_BASE}/analytics`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  التقرير الكامل <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
              <LineChart data={data?.traffic || []} height={250} formatLabel={(d) => String(d).slice(5)} />
            </div>

            <div className="admin-card p-5">
              <h3 className="font-bold text-dark mb-4">توزيع الطلبات حسب الحالة</h3>
              <PieChart data={(data?.quotesByStatus || []).map((s) => ({ label: labelStatus(s.label), value: s.value }))} size={170} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="admin-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-dark">آخر طلبات عروض الأسعار</h3>
                <Link href={`${ADMIN_BASE}/quotes`} className="text-xs text-primary hover:underline">عرض الكل</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.latestQuotes || []).length ? data.latestQuotes.map((q) => (
                  <div key={q._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70">
                    <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">{(q.name || '?').charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-dark truncate">{q.name} {q.company ? <span className="text-gray-400 font-normal">— {q.company}</span> : null}</p>
                      <p className="text-xs text-gray-500 truncate">{q.projectType || 'غير محدد'} · {q.budget || '—'}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <Badge status={q.status} />
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(q.createdAt)}</p>
                    </div>
                  </div>
                )) : <p className="py-10 text-center text-sm text-gray-400">لا توجد طلبات بعد</p>}
              </div>
            </div>

            <div className="admin-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-dark">آخر رسائل التواصل</h3>
                <Link href={`${ADMIN_BASE}/messages`} className="text-xs text-primary hover:underline">عرض الكل</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(data?.latestMessages || []).length ? data.latestMessages.map((m) => (
                  <div key={m._id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/70">
                    <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${m.isRead ? 'bg-gray-200' : 'bg-primary'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-dark truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{m.subject || m.message}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 shrink-0">{timeAgo(m.createdAt)}</p>
                  </div>
                )) : <p className="py-10 text-center text-sm text-gray-400">لا توجد رسائل بعد</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="admin-card p-5">
              <h3 className="font-bold text-dark mb-4">أكثر الخدمات طلباً</h3>
              <BarChart data={data?.quotesByService || []} />
            </div>

            <div className="admin-card overflow-hidden lg:col-span-2">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-dark flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> آخر النشاطات</h3>
                {can('activity') ? <Link href={`${ADMIN_BASE}/activity-log`} className="text-xs text-primary hover:underline">السجل الكامل</Link> : null}
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {(data?.activity || []).length ? data.activity.map((a) => (
                  <div key={a._id} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 grid place-items-center text-[10px] font-bold shrink-0">{(a.userName || '?').charAt(0)}</span>
                    <p className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                      <b className="text-dark">{a.userName}</b> — {a.action} {a.details ? <span className="text-gray-400">({a.details})</span> : null}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{formatDate(a.createdAt, { withTime: true })}</span>
                  </div>
                )) : <p className="py-10 text-center text-sm text-gray-400">لا توجد نشاطات مسجلة</p>}
              </div>
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="font-bold text-dark mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK.filter((q) => can(q.module)).map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 py-4 text-center hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <QuickIcon name={q.icon} />
                  <span className="text-xs font-semibold text-gray-700">{q.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </Guard>
  );
}

function QuickIcon({ name }) {
  return <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon name={name} className="w-5 h-5" /></span>;
}

function labelStatus(s) {
  const map = {
    new: 'جديد', reviewing: 'قيد المراجعة', sent: 'تم إرسال عرض', rejected: 'مرفوض', completed: 'مكتمل',
  };
  return map[s] || s;
}
