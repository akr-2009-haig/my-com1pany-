'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Check, Download, Eye, Loader2, Mail, Save, Send, Trash2,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import Guard from '../ui/Guard';
import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import Badge from '../ui/Badge';
import { formatDate } from '../../../utils/formatDate';

/**
 * Shared inbox screen for leads (messages, quotes, package requests, job
 * applications): table + detail drawer + status workflow + notes + email reply.
 */
export default function LeadsPage({
  endpoint,
  module: mod,
  title,
  subtitle,
  breadcrumb = [],
  columns = [],
  statusOptions = [],
  detailSections,
  canReply = false,
  replyDefaults = () => ({ subject: '', body: '' }),
  searchPlaceholder = 'بحث...',
  extraFilters = [],
  emptyText = 'لا توجد سجلات',
}) {
  const { notify } = useToast();
  const { can } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [reply, setReply] = useState(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await api.get(endpoint, { params });
      setRows(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  }, [endpoint, page, perPage, search, filters, notify]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const open = async (row) => {
    setDetail(row);
    setNotes(row.notes || '');
    if (!row.isRead && can(mod, 'edit')) {
      try {
        await api.put(`${endpoint}/${row._id}`, { isRead: true });
        setRows((l) => l.map((r) => (r._id === row._id ? { ...r, isRead: true } : r)));
      } catch { /* ignore */ }
    }
  };

  const changeStatus = async (row, value) => {
    try {
      await api.put(`${endpoint}/${row._id}`, { status: value, isRead: true });
      notify('تم تحديث الحالة', 'success');
      setDetail((d) => (d ? { ...d, status: value } : d));
      load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`${endpoint}/${detail._id}`, { notes });
      notify('تم حفظ الملاحظات', 'success');
      load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSavingNotes(false); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      notify('تم الحذف بنجاح', 'success');
      setConfirm(null); setDetail(null);
      load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const bulk = async (action, extra = {}) => {
    try {
      const { data } = await api.post(`${endpoint}/bulk`, { ids: selected, action, ...extra });
      notify(data.message || 'تم التنفيذ', 'success');
      setSelected([]); setConfirm(null);
      load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const sendReply = async () => {
    setSending(true);
    try {
      const { data } = await api.post(`${endpoint}/${detail._id}/reply`, reply);
      notify(data.message || 'تم إرسال الرد', 'success');
      setReply(null); setDetail(null);
      load();
    } catch (e) { notify(errMsg(e), 'error'); } finally { setSending(false); }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get(`${endpoint}/export`, { responseType: 'blob', params: filters });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${endpoint.replace(/\//g, '')}-${Date.now()}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const unread = rows.filter((r) => !r.isRead).length;

  return (
    <Guard module={mod}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
        actions={(
          <button type="button" onClick={exportCsv} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
        )}
      />

      {unread ? (
        <div className="mb-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-sm text-primary-700 flex items-center gap-2">
          <Mail className="w-4 h-4" /> لديك <b>{unread}</b> سجل غير مقروء في هذه الصفحة.
        </div>
      ) : null}

      <DataTable
        loading={loading}
        rows={rows}
        page={page} pages={pages} total={total}
        onPageChange={setPage}
        perPage={perPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={searchPlaceholder}
        selectable={can(mod, 'delete')}
        selected={selected} onSelect={setSelected}
        emptyText={emptyText}
        toolbar={(
          <>
            {statusOptions.length ? (
              <select value={filters.status || ''} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }} className="input py-2.5 text-sm w-auto min-w-[150px]">
                <option value="">كل الحالات</option>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : null}
            <select value={filters.isRead || ''} onChange={(e) => { setFilters((f) => ({ ...f, isRead: e.target.value })); setPage(1); }} className="input py-2.5 text-sm w-auto min-w-[130px]">
              <option value="">الكل</option>
              <option value="false">غير مقروء</option>
              <option value="true">مقروء</option>
            </select>
            {extraFilters.map((f) => (
              <select key={f.key} value={filters[f.key] || ''} onChange={(e) => { setFilters((s) => ({ ...s, [f.key]: e.target.value })); setPage(1); }} className="input py-2.5 text-sm w-auto min-w-[150px]">
                <option value="">{f.label}</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
            <input type="date" value={filters.from || ''} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="input py-2.5 text-sm w-auto" title="من تاريخ" />
            <input type="date" value={filters.to || ''} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="input py-2.5 text-sm w-auto" title="إلى تاريخ" />
          </>
        )}
        bulkBar={(
          <>
            {can(mod, 'edit') ? (
              <>
                <button type="button" onClick={() => bulk('read')} className="btn btn-sm bg-primary text-white hover:bg-primary-dark"><Check className="w-4 h-4" /> تعليم كمقروء</button>
                <button type="button" onClick={() => bulk('unread')} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">غير مقروء</button>
              </>
            ) : null}
            <button type="button" onClick={() => setConfirm({ bulk: true, count: selected.length })} className="btn btn-sm bg-danger text-white hover:bg-red-600"><Trash2 className="w-4 h-4" /> حذف</button>
          </>
        )}
        columns={[
          {
            key: '_read',
            label: '',
            width: '24px',
            render: (r) => <span className={`block w-2 h-2 rounded-full ${r.isRead ? 'bg-gray-200' : 'bg-primary'}`} title={r.isRead ? 'مقروء' : 'غير مقروء'} />,
          },
          ...columns,
          { key: 'status', label: 'الحالة', width: '120px', render: (r) => <Badge status={r.status} /> },
          { key: 'createdAt', label: 'التاريخ', width: '150px', render: (r) => <span className="text-xs text-gray-500">{formatDate(r.createdAt, { withTime: true })}</span> },
        ]}
        actions={(row) => (
          <>
            <button type="button" onClick={() => open(row)} title="عرض التفاصيل" className="w-8 h-8 grid place-items-center rounded-lg text-primary hover:bg-primary hover:text-white"><Eye className="w-4 h-4" /></button>
            {can(mod, 'delete') ? (
              <button type="button" onClick={() => setConfirm({ id: row._id })} title="حذف" className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-danger hover:text-white"><Trash2 className="w-4 h-4" /></button>
            ) : null}
          </>
        )}
      />

      <Modal
        open={Boolean(detail)}
        size="lg"
        title="تفاصيل السجل"
        subtitle={detail ? formatDate(detail.createdAt, { withTime: true }) : ''}
        onClose={() => { setDetail(null); setReply(null); }}
        footer={(
          <>
            {can(mod, 'delete') ? (
              <button type="button" onClick={() => setConfirm({ id: detail._id })} className="btn btn-sm bg-danger text-white hover:bg-red-600 ml-auto"><Trash2 className="w-4 h-4" /> حذف</button>
            ) : null}
            {canReply && can(mod, 'edit') && !reply ? (
              <button type="button" onClick={() => setReply(replyDefaults(detail))} className="btn btn-sm btn-primary"><Send className="w-4 h-4" /> إرسال رد بالبريد</button>
            ) : null}
            <button type="button" onClick={() => { setDetail(null); setReply(null); }} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إغلاق</button>
          </>
        )}
      >
        {detail ? (
          <div className="space-y-5">
            {detailSections ? detailSections(detail) : null}

            {statusOptions.length && can(mod, 'edit') ? (
              <div>
                <span className="label">حالة السجل</span>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => changeStatus(detail, o.value)}
                      className={`btn btn-sm ${detail.status === o.value ? 'btn-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {can(mod, 'edit') ? (
              <div>
                <span className="label">ملاحظات داخلية</span>
                <textarea className="input h-24 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات لا تظهر للعميل..." />
                <button type="button" onClick={saveNotes} disabled={savingNotes} className="btn btn-sm btn-primary mt-2">
                  {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ الملاحظات
                </button>
              </div>
            ) : null}

            {reply ? (
              <div className="rounded-xl border border-primary/30 bg-primary/[.03] p-4 space-y-3">
                <h4 className="font-bold text-dark text-sm">الرد عبر البريد الإلكتروني</h4>
                <div>
                  <span className="label">الموضوع</span>
                  <input className="input" value={reply.subject} onChange={(e) => setReply((r) => ({ ...r, subject: e.target.value }))} />
                </div>
                <div>
                  <span className="label">نص الرسالة</span>
                  <textarea className="input h-40 resize-y" value={reply.body} onChange={(e) => setReply((r) => ({ ...r, body: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setReply(null)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
                  <button type="button" onClick={sendReply} disabled={sending || !reply.body} className="btn btn-sm btn-primary">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">يتطلب الإرسال ضبط إعدادات SMTP في الإعدادات ← إعدادات البريد.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={Boolean(confirm)}
        title="تأكيد الحذف"
        message={confirm?.bulk ? `سيتم حذف ${confirm.count} سجل نهائياً.` : 'سيتم حذف هذا السجل نهائياً. هل أنت متأكد؟'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => (confirm?.bulk ? bulk('delete') : remove(confirm.id))}
      />
    </Guard>
  );
}
