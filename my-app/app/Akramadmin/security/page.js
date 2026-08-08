'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Lock, ShieldBan, Plus, Trash2, RefreshCw, Globe, Monitor, CheckCircle2, XCircle,
  Download, Eraser, Loader2, Clock,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { formatDate, timeAgo } from '../../../utils/formatDate';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import DataTable from '../../../components/admin/ui/DataTable';
import Modal from '../../../components/admin/ui/Modal';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';
import StatsCard from '../../../components/admin/ui/StatsCard';

const BLOCK_BLANK = { ip: '', reason: '', minutes: 60, permanent: false };

function SecurityScreen() {
  const { notify } = useToast();
  const { can } = useAuth();

  const [tab, setTab] = useState('logs');
  const [myIp, setMyIp] = useState('');

  // login logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // blocked ips
  const [blocked, setBlocked] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [blockModal, setBlockModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toUnblock, setToUnblock] = useState(null);
  const [clearType, setClearType] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api.get('/security/my-ip').then(({ data }) => setMyIp(data.ip || '')).catch(() => {});
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const { data } = await api.get('/security/login-logs', {
        params: { page, limit: perPage, status, search: debounced || undefined },
      });
      setLogs(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLogsLoading(false);
    }
  }, [page, perPage, status, debounced, notify]);

  const loadBlocked = useCallback(async () => {
    setBlockedLoading(true);
    try {
      const { data } = await api.get('/security/blocked-ips');
      setBlocked(data.data || []);
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setBlockedLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => { loadBlocked(); }, [loadBlocked]);

  const failedCount = logs.filter((l) => l.status === 'failed').length;

  const saveBlock = async () => {
    const v = blockModal;
    if (!v.ip?.trim()) { notify('عنوان IP مطلوب', 'warning'); return; }
    setSaving(true);
    try {
      await api.post('/security/blocked-ips', {
        ip: v.ip.trim(),
        reason: v.reason || 'حظر يدوي من الإدارة',
        minutes: Number(v.minutes) || 60,
        permanent: !!v.permanent,
      });
      notify('تم حظر عنوان IP بنجاح', 'success');
      setBlockModal(null);
      loadBlocked();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const unblock = async () => {
    try {
      await api.delete(`/security/blocked-ips/${toUnblock._id}`);
      notify('تم رفع الحظر عن العنوان', 'success');
      setToUnblock(null);
      loadBlocked();
    } catch (e) {
      notify(errMsg(e), 'error');
      setToUnblock(null);
    }
  };

  const clearLogs = async () => {
    try {
      const { data } = await api.delete(`/security/logs/${clearType}`);
      notify(data?.message || 'تم المسح', 'success');
      setClearType(null);
      loadLogs();
    } catch (e) {
      notify(errMsg(e), 'error');
      setClearType(null);
    }
  };

  const exportLogs = async () => {
    try {
      const res = await api.get('/analytics/export/loginlogs', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `login-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      notify('تم تصدير سجل الدخول', 'success');
    } catch (e) {
      notify(errMsg(e), 'error');
    }
  };

  const logColumns = [
    {
      key: 'email',
      label: 'الحساب',
      render: (r) => <span className="font-semibold text-dark dir-ltr block text-right">{r.email || '—'}</span>,
    },
    {
      key: 'status',
      label: 'النتيجة',
      render: (r) => (r.status === 'success'
        ? <span className="badge-green inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ناجح</span>
        : <span className="badge-red inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> فاشل</span>),
    },
    {
      key: 'ip',
      label: 'عنوان IP',
      render: (r) => (
        <span className="dir-ltr inline-flex items-center gap-1 text-gray-600">
          {r.ip || '—'}
          {r.ip && r.ip === myIp ? <span className="badge-primary text-[10px]">جهازك</span> : null}
        </span>
      ),
    },
    {
      key: 'browser',
      label: 'المتصفح / النظام',
      render: (r) => (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Monitor className="w-3.5 h-3.5" />
          {[r.browser, r.os].filter(Boolean).join(' — ') || '—'}
        </span>
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

  const blockedColumns = [
    {
      key: 'ip',
      label: 'عنوان IP',
      render: (r) => <span className="font-mono font-semibold text-dark dir-ltr block text-right">{r.ip}</span>,
    },
    { key: 'reason', label: 'السبب', render: (r) => <span className="text-gray-600 text-sm">{r.reason || '—'}</span> },
    {
      key: 'expiresAt',
      label: 'ينتهي',
      render: (r) => (r.permanent
        ? <span className="badge-red">حظر دائم</span>
        : (
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {r.expiresAt ? formatDate(r.expiresAt, { withTime: true }) : '—'}
          </span>
        )),
    },
    { key: 'createdBy', label: 'بواسطة', render: (r) => <span className="text-xs text-gray-500">{r.createdBy || 'النظام'}</span> },
    { key: 'createdAt', label: 'تاريخ الحظر', render: (r) => <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span> },
  ];

  const TABS = [
    { key: 'logs', label: 'سجل محاولات الدخول', icon: Lock },
    { key: 'blocked', label: `العناوين المحظورة (${blocked.length})`, icon: ShieldBan },
  ];

  return (
    <div>
      <PageHeader
        title="الأمان والحماية"
        subtitle="راقب محاولات الدخول وأدر حظر عناوين IP المشبوهة"
        breadcrumb={[{ label: 'الأمان والنسخ' }, { label: 'سجل الدخول و IP' }]}
        icon={<Lock className="w-6 h-6 text-primary" />}
        actions={(
          <>
            <button type="button" onClick={() => { loadLogs(); loadBlocked(); }} className="btn btn-sm btn-muted">
              <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} /> تحديث
            </button>
            {can('security', 'create') ? (
              <button type="button" onClick={() => setBlockModal({ ...BLOCK_BLANK })} className="btn btn-sm btn-danger">
                <Plus className="w-4 h-4" /> حظر IP
              </button>
            ) : null}
          </>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatsCard title="إجمالي محاولات الدخول" value={total} icon="Lock" color="#00BCD4" />
        <StatsCard title="محاولات فاشلة (هذه الصفحة)" value={failedCount} icon="AlertTriangle" color="#e74c3c" />
        <StatsCard title="عناوين محظورة" value={blocked.length} icon="Shield" color="#f97316" />
        <StatsCard title="عنوان IP الخاص بك" value={myIp || '—'} icon="Globe" color="#8b5cf6" />
      </div>

      <div className="admin-card p-1.5 mb-5 flex gap-1 w-fit overflow-x-auto no-scrollbar">
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

      {tab === 'logs' ? (
        <DataTable
          columns={logColumns}
          rows={logs}
          loading={logsLoading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="ابحث بالبريد أو عنوان IP..."
          page={page}
          pages={pages}
          total={total}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          emptyText="لا توجد محاولات دخول مسجلة"
          compact
          toolbar={(
            <>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white"
              >
                <option value="all">كل المحاولات</option>
                <option value="success">ناجحة فقط</option>
                <option value="failed">فاشلة فقط</option>
              </select>
              <button type="button" onClick={exportLogs} className="btn btn-sm btn-muted">
                <Download className="w-4 h-4" /> تصدير CSV
              </button>
              {can('security', 'delete') ? (
                <button type="button" onClick={() => setClearType('login')} className="btn btn-sm btn-danger">
                  <Eraser className="w-4 h-4" /> مسح السجل
                </button>
              ) : null}
            </>
          )}
          actions={can('security', 'create') ? (row) => (
            row.ip && row.ip !== myIp ? (
              <button
                type="button"
                title="حظر هذا العنوان"
                onClick={() => setBlockModal({ ...BLOCK_BLANK, ip: row.ip, reason: `محاولات دخول مشبوهة (${row.email || 'غير معروف'})` })}
                className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-red-50"
              >
                <ShieldBan className="w-4 h-4" />
              </button>
            ) : null
          ) : undefined}
        />
      ) : (
        <>
          <DataTable
            columns={blockedColumns}
            rows={blocked}
            loading={blockedLoading}
            emptyText="لا توجد عناوين محظورة حالياً"
            compact
            actions={can('security', 'delete') ? (row) => (
              <button
                type="button"
                title="رفع الحظر"
                onClick={() => setToUnblock(row)}
                className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : undefined}
          />
          <div className="admin-card p-4 mt-4 bg-amber-50/60 border-amber-100">
            <p className="text-sm text-amber-800 leading-relaxed">
              يقوم النظام بحظر عنوان IP تلقائياً بعد <b>5 محاولات دخول فاشلة</b> متتالية لمدة 15 دقيقة.
              يمكنك إضافة حظر يدوي دائم أو مؤقت من زر «حظر IP» بالأعلى.
            </p>
          </div>
        </>
      )}

      {/* block modal */}
      <Modal
        open={!!blockModal}
        onClose={() => setBlockModal(null)}
        title="حظر عنوان IP"
        subtitle="سيتم منع هذا العنوان من الوصول للموقع ولوحة التحكم"
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => setBlockModal(null)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
            <button type="button" onClick={saveBlock} disabled={saving} className="btn btn-sm btn-danger">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldBan className="w-4 h-4" />}
              {saving ? '...جارٍ الحظر' : 'تأكيد الحظر'}
            </button>
          </>
        )}
      >
        {blockModal ? (
          <div className="space-y-4">
            <div>
              <span className="label">عنوان IP *</span>
              <div className="relative">
                <Globe className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
                <input
                  dir="ltr"
                  value={blockModal.ip}
                  onChange={(e) => setBlockModal({ ...blockModal, ip: e.target.value })}
                  className="input pr-9 text-left font-mono"
                  placeholder="192.168.1.100"
                />
              </div>
              {myIp ? <p className="text-[11px] text-gray-400 mt-1 dir-ltr text-right">عنوانك الحالي: {myIp}</p> : null}
            </div>

            <div>
              <span className="label">سبب الحظر</span>
              <input
                value={blockModal.reason}
                onChange={(e) => setBlockModal({ ...blockModal, reason: e.target.value })}
                className="input"
                placeholder="محاولات دخول مشبوهة"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-dark">حظر دائم</p>
                <p className="text-xs text-gray-500">لن ينتهي الحظر تلقائياً</p>
              </div>
              <ToggleSwitch checked={blockModal.permanent} onChange={(v) => setBlockModal({ ...blockModal, permanent: v })} />
            </div>

            {!blockModal.permanent ? (
              <div>
                <span className="label">مدة الحظر (بالدقائق)</span>
                <input
                  type="number"
                  min={1}
                  value={blockModal.minutes}
                  onChange={(e) => setBlockModal({ ...blockModal, minutes: e.target.value })}
                  className="input"
                />
                <div className="flex gap-2 mt-2">
                  {[15, 60, 720, 1440].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBlockModal({ ...blockModal, minutes: m })}
                      className="badge-gray hover:bg-primary hover:text-white transition-colors"
                    >
                      {m < 60 ? `${m} دقيقة` : m < 1440 ? `${m / 60} ساعة` : `${m / 1440} يوم`}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {blockModal.ip && blockModal.ip === myIp ? (
              <p className="text-xs text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                تحذير: هذا هو عنوانك الحالي — حظره سيمنعك أنت من الدخول!
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={!!toUnblock}
        title="رفع الحظر"
        message={`سيتم السماح للعنوان ${toUnblock?.ip} بالوصول للموقع مجدداً.`}
        confirmText="نعم، ارفع الحظر"
        danger={false}
        onConfirm={unblock}
        onCancel={() => setToUnblock(null)}
      />

      <ConfirmModal
        open={!!clearType}
        title="مسح سجل الدخول"
        message="سيتم حذف جميع سجلات محاولات الدخول نهائياً. يُنصح بتصدير نسخة CSV أولاً."
        confirmText="نعم، امسح"
        danger
        onConfirm={clearLogs}
        onCancel={() => setClearType(null)}
      />
    </div>
  );
}

export default function SecurityPage() {
  return <Guard module="security"><SecurityScreen /></Guard>;
}
