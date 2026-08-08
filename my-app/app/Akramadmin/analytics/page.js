'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3, Download, Eye, FileText, MessageSquare, RefreshCw, Loader2,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { formatDate, formatNumber } from '../../../utils/formatDate';
import { useToast } from '../../../components/shared/ToastProvider';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import StatsCard from '../../../components/admin/ui/StatsCard';
import LineChart from '../../../components/admin/charts/LineChart';
import BarChart from '../../../components/admin/charts/BarChart';
import PieChart from '../../../components/admin/charts/PieChart';

const PERIODS = [
  { value: '7d', label: 'آخر 7 أيام' },
  { value: '30d', label: 'آخر 30 يوم' },
  { value: '90d', label: 'آخر 3 أشهر' },
  { value: '365d', label: 'آخر سنة' },
];

const TABS = [
  { key: 'visits', label: 'الزيارات', icon: Eye },
  { key: 'requests', label: 'الطلبات والرسائل', icon: MessageSquare },
  { key: 'blog', label: 'المدونة', icon: FileText },
];

const EXPORTS = [
  { key: 'messages', label: 'الرسائل' },
  { key: 'quotes', label: 'عروض الأسعار' },
  { key: 'packagerequests', label: 'طلبات الباقات' },
  { key: 'applications', label: 'طلبات التوظيف' },
  { key: 'posts', label: 'المقالات' },
  { key: 'comments', label: 'التعليقات' },
  { key: 'visits', label: 'الزيارات' },
  { key: 'loginlogs', label: 'سجل الدخول' },
  { key: 'activitylogs', label: 'سجل النشاطات' },
];

function Section({ title, subtitle, children, className = '' }) {
  return (
    <div className={`admin-card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-bold text-dark">{title}</h3>
        {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function secondsToText(s) {
  const m = Math.floor((s || 0) / 60);
  const sec = (s || 0) % 60;
  return m ? `${m}د ${sec}ث` : `${sec} ثانية`;
}

function AnalyticsScreen() {
  const { notify } = useToast();
  const [tab, setTab] = useState('visits');
  const [period, setPeriod] = useState('30d');
  const [range, setRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [exporting, setExporting] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = range.from || range.to ? { from: range.from || undefined, to: range.to || undefined } : { period };
      const { data: res } = await api.get(`/analytics/${tab}`, { params });
      setData(res || {});
    } catch (e) {
      notify(errMsg(e), 'error');
      setData({});
    } finally {
      setLoading(false);
    }
  }, [tab, period, range, notify]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async (name) => {
    setExporting(name);
    try {
      const res = await api.get(`/analytics/export/${name}`, {
        params: { from: range.from || undefined, to: range.to || undefined },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify('تم تصدير الملف بنجاح', 'success');
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setExporting('');
    }
  };

  return (
    <div>
      <PageHeader
        title="التقارير والإحصائيات"
        subtitle="تحليل أداء الموقع والزيارات والطلبات مع إمكانية التصدير"
        breadcrumb={[{ label: 'التقارير والإحصائيات' }]}
        icon={<BarChart3 className="w-6 h-6 text-primary" />}
        actions={(
          <button type="button" onClick={load} className="btn btn-sm btn-muted">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
        )}
      />

      {/* Filters */}
      <div className="admin-card p-3 sm:p-4 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors
                ${tab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <span className="hidden lg:block flex-1" />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => { setPeriod(e.target.value); setRange({ from: '', to: '' }); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white"
          >
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            aria-label="من تاريخ"
          />
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            aria-label="إلى تاريخ"
          />
          {(range.from || range.to) ? (
            <button type="button" onClick={() => setRange({ from: '', to: '' })} className="btn btn-sm btn-muted">مسح</button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="admin-card py-24 grid place-items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-gray-400 mt-3">جارٍ تحميل التقرير...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ---------------------------- VISITS ---------------------------- */}
          {tab === 'visits' ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="إجمالي الزيارات" value={formatNumber(data.total || 0)} icon="Eye" color="#00BCD4" />
                <StatsCard title="زوار فريدون" value={formatNumber(data.unique || 0)} icon="Users" color="#8b5cf6" />
                <StatsCard title="معدل الارتداد" value={`${data.bounceRate || 0}%`} icon="MousePointerClick" color="#f97316" />
                <StatsCard title="متوسط مدة الجلسة" value={secondsToText(data.avgSession)} icon="Timer" color="#22c55e" />
              </div>

              <Section title="حركة الزيارات" subtitle="عدد الزيارات اليومية خلال الفترة المحددة">
                <LineChart data={data.chart || []} height={260} />
              </Section>

              <div className="grid lg:grid-cols-2 gap-5">
                <Section title="أكثر الصفحات زيارة">
                  <BarChart data={(data.topPages || []).slice(0, 8)} />
                </Section>
                <Section title="مصادر الزيارات">
                  <PieChart data={(data.sources || []).slice(0, 6)} />
                </Section>
                <Section title="الأجهزة المستخدمة">
                  <PieChart data={data.devices || []} />
                </Section>
                <Section title="المتصفحات">
                  <BarChart data={data.browsers || []} color="#8b5cf6" />
                </Section>
                {(data.countries || []).length ? (
                  <Section title="الدول" className="lg:col-span-2">
                    <BarChart data={data.countries} color="#22c55e" />
                  </Section>
                ) : null}
              </div>
            </>
          ) : null}

          {/* --------------------------- REQUESTS --------------------------- */}
          {tab === 'requests' ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="عروض الأسعار" value={formatNumber(data.totals?.quotes || 0)} icon="FileText" color="#00BCD4" />
                <StatsCard title="رسائل التواصل" value={formatNumber(data.totals?.messages || 0)} icon="Mail" color="#8b5cf6" />
                <StatsCard title="طلبات الباقات" value={formatNumber(data.totals?.packages || 0)} icon="Wallet" color="#f97316" />
                <StatsCard title="طلبات التوظيف" value={formatNumber(data.totals?.applications || 0)} icon="Briefcase" color="#22c55e" />
              </div>

              <Section title="الطلبات شهرياً" subtitle="توزيع الطلبات على الأشهر">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-th">الشهر</th>
                        <th className="table-th text-center">عروض الأسعار</th>
                        <th className="table-th text-center">الرسائل</th>
                        <th className="table-th text-center">الباقات</th>
                        <th className="table-th text-center">التوظيف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(data.monthly || []).map((m) => (
                        <tr key={m.month} className="hover:bg-gray-50/70">
                          <td className="table-td font-semibold dir-ltr text-right">{m.month}</td>
                          <td className="table-td text-center">{m.quotes}</td>
                          <td className="table-td text-center">{m.messages}</td>
                          <td className="table-td text-center">{m.packages}</td>
                          <td className="table-td text-center">{m.applications}</td>
                        </tr>
                      ))}
                      {!(data.monthly || []).length ? (
                        <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">لا توجد بيانات في هذه الفترة</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Section>

              <div className="grid lg:grid-cols-2 gap-5">
                <Section title="الطلبات حسب النوع">
                  <PieChart data={data.byType || []} />
                </Section>
                <Section title="الطلبات حسب الحالة">
                  <PieChart data={data.byStatus || []} />
                </Section>
                <Section title="الميزانيات المطلوبة">
                  <BarChart data={data.byBudget || []} color="#f97316" />
                </Section>
                <Section title="أكثر الخدمات طلباً">
                  <BarChart data={data.topServices || []} />
                </Section>
              </div>
            </>
          ) : null}

          {/* ----------------------------- BLOG ----------------------------- */}
          {tab === 'blog' ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatsCard title="إجمالي المقالات" value={formatNumber(data.totals?.posts || 0)} icon="Newspaper" color="#00BCD4" />
                <StatsCard title="المنشورة" value={formatNumber(data.totals?.published || 0)} icon="CheckCircle2" color="#22c55e" />
                <StatsCard title="المشاهدات" value={formatNumber(data.totals?.views || 0)} icon="Eye" color="#8b5cf6" />
                <StatsCard title="التعليقات" value={formatNumber(data.totals?.comments || 0)} icon="MessageSquare" color="#3b82f6" />
                <StatsCard title="بانتظار المراجعة" value={formatNumber(data.totals?.pending || 0)} icon="Clock" color="#f97316" />
              </div>

              <Section title="أكثر المقالات مشاهدة">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-th">#</th>
                        <th className="table-th">عنوان المقال</th>
                        <th className="table-th">التصنيفات</th>
                        <th className="table-th text-center">المشاهدات</th>
                        <th className="table-th">تاريخ النشر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(data.topPosts || []).map((p, i) => (
                        <tr key={p._id} className="hover:bg-gray-50/70">
                          <td className="table-td text-gray-400">{i + 1}</td>
                          <td className="table-td font-semibold text-dark">{p.title}</td>
                          <td className="table-td">
                            <div className="flex flex-wrap gap-1">
                              {(p.categories || []).map((c) => <span key={c} className="badge-gray">{c}</span>)}
                              {!(p.categories || []).length ? <span className="text-gray-300">—</span> : null}
                            </div>
                          </td>
                          <td className="table-td text-center font-bold text-primary">{formatNumber(p.views || 0)}</td>
                          <td className="table-td text-xs text-gray-500">{formatDate(p.createdAt)}</td>
                        </tr>
                      ))}
                      {!(data.topPosts || []).length ? (
                        <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">لا توجد مقالات بعد</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Section>

              <div className="grid lg:grid-cols-2 gap-5">
                <Section title="المقالات حسب التصنيف">
                  <PieChart data={data.byCategory || []} />
                </Section>
                <Section title="التعليقات شهرياً">
                  <LineChart data={(data.monthlyComments || []).map((m) => ({ label: m.month, value: m.value }))} height={220} color="#8b5cf6" />
                </Section>
              </div>
            </>
          ) : null}

          {/* --------------------------- EXPORTS ---------------------------- */}
          <Section title="تصدير البيانات (CSV)" subtitle="يتم تطبيق فلتر التاريخ أعلاه على الملف المُصدَّر">
            <div className="flex flex-wrap gap-2">
              {EXPORTS.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  onClick={() => exportCsv(x.key)}
                  disabled={exporting === x.key}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-colors"
                >
                  {exporting === x.key
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />}
                  {x.label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return <Guard module="analytics"><AnalyticsScreen /></Guard>;
}
