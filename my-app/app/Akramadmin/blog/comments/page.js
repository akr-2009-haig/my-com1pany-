'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Trash2, X, Eye } from 'lucide-react';
import api, { errMsg } from '../../../../utils/api';
import { useToast } from '../../../../components/shared/ToastProvider';
import useAuth from '../../../../hooks/useAuth';
import Guard from '../../../../components/admin/ui/Guard';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import DataTable from '../../../../components/admin/ui/DataTable';
import Modal from '../../../../components/admin/ui/Modal';
import ConfirmModal from '../../../../components/admin/ui/ConfirmModal';
import Badge from '../../../../components/admin/ui/Badge';
import { ADMIN_BASE } from '../../../../utils/constants';
import { formatDate } from '../../../../utils/formatDate';

export default function CommentsPage() {
  const { notify } = useToast();
  const { can } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/comments', { params });
      setRows(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) { notify(errMsg(e), 'error'); } finally { setLoading(false); }
  }, [page, perPage, search, status, notify]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const setStatusOf = async (id, value) => {
    try {
      await api.patch(`/comments/${id}/status`, { status: value });
      notify(value === 'approved' ? 'تمت الموافقة على التعليق' : 'تم رفض التعليق', 'success');
      setDetail(null);
      load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      notify('تم حذف التعليق', 'success');
      setConfirm(null); setDetail(null);
      load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  const bulk = async (action, extra = {}) => {
    try {
      const { data } = await api.post('/comments/bulk', { ids: selected, action, ...extra });
      notify(data.message || 'تم التنفيذ', 'success');
      setSelected([]); setConfirm(null);
      load();
    } catch (e) { notify(errMsg(e), 'error'); }
  };

  return (
    <Guard module="comments">
      <PageHeader
        title="تعليقات المدونة"
        subtitle="راجع التعليقات الواردة ووافق عليها قبل نشرها على الموقع"
        breadcrumb={[{ label: 'المدونة', href: `${ADMIN_BASE}/blog` }, { label: 'التعليقات' }]}
      />

      <DataTable
        loading={loading}
        rows={rows}
        page={page} pages={pages} total={total}
        onPageChange={setPage}
        perPage={perPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="بحث بالاسم أو النص..."
        selectable={can('comments', 'delete')}
        selected={selected} onSelect={setSelected}
        emptyText="لا توجد تعليقات"
        toolbar={(
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input py-2.5 text-sm w-auto min-w-[160px]">
            <option value="">كل الحالات</option>
            <option value="pending">بانتظار الموافقة</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
          </select>
        )}
        bulkBar={(
          <>
            <button type="button" onClick={() => bulk('status', { field: 'status', value: 'approved' })} className="btn btn-sm bg-green-600 text-white hover:bg-green-700"><Check className="w-4 h-4" /> موافقة</button>
            <button type="button" onClick={() => bulk('status', { field: 'status', value: 'rejected' })} className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600"><X className="w-4 h-4" /> رفض</button>
            <button type="button" onClick={() => setConfirm({ bulk: true, count: selected.length })} className="btn btn-sm bg-danger text-white hover:bg-red-600"><Trash2 className="w-4 h-4" /> حذف</button>
          </>
        )}
        columns={[
          {
            key: 'name',
            label: 'صاحب التعليق',
            render: (r) => (
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">{(r.name || '?').charAt(0)}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-dark truncate">{r.name}</p>
                  <p className="text-[11px] text-gray-400 truncate" dir="ltr">{r.email}</p>
                </div>
              </div>
            ),
          },
          { key: 'content', label: 'التعليق', render: (r) => <span className="text-gray-600 line-clamp-2 max-w-md block">{r.content}</span> },
          { key: 'postTitle', label: 'المقال', render: (r) => <span className="text-xs text-gray-500 line-clamp-1 max-w-[160px] block">{r.postTitle || '—'}</span> },
          { key: 'status', label: 'الحالة', width: '120px', render: (r) => <Badge status={r.status} /> },
          { key: 'createdAt', label: 'التاريخ', width: '150px', render: (r) => <span className="text-xs text-gray-500">{formatDate(r.createdAt, { withTime: true })}</span> },
        ]}
        actions={(row) => (
          <>
            <button type="button" onClick={() => setDetail(row)} title="عرض" className="w-8 h-8 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary"><Eye className="w-4 h-4" /></button>
            {can('comments', 'edit') && row.status !== 'approved' ? (
              <button type="button" onClick={() => setStatusOf(row._id, 'approved')} title="موافقة" className="w-8 h-8 grid place-items-center rounded-lg text-green-600 hover:bg-green-600 hover:text-white"><Check className="w-4 h-4" /></button>
            ) : null}
            {can('comments', 'edit') && row.status !== 'rejected' ? (
              <button type="button" onClick={() => setStatusOf(row._id, 'rejected')} title="رفض" className="w-8 h-8 grid place-items-center rounded-lg text-orange-500 hover:bg-orange-500 hover:text-white"><X className="w-4 h-4" /></button>
            ) : null}
            {can('comments', 'delete') ? (
              <button type="button" onClick={() => setConfirm({ id: row._id })} title="حذف" className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-danger hover:text-white"><Trash2 className="w-4 h-4" /></button>
            ) : null}
          </>
        )}
      />

      <Modal
        open={Boolean(detail)}
        title="تفاصيل التعليق"
        onClose={() => setDetail(null)}
        footer={can('comments', 'edit') ? (
          <>
            <button type="button" onClick={() => setStatusOf(detail._id, 'rejected')} className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600">رفض</button>
            <button type="button" onClick={() => setStatusOf(detail._id, 'approved')} className="btn btn-sm bg-green-600 text-white hover:bg-green-700">موافقة ونشر</button>
          </>
        ) : null}
      >
        {detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs mb-0.5">الاسم</p><p className="font-semibold">{detail.name}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">البريد</p><p dir="ltr">{detail.email}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">المقال</p><p>{detail.postTitle || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">IP</p><p dir="ltr">{detail.ip || '—'}</p></div>
              {detail.website ? <div className="col-span-2"><p className="text-gray-400 text-xs mb-0.5">الموقع</p><p dir="ltr">{detail.website}</p></div> : null}
              <div><p className="text-gray-400 text-xs mb-0.5">التاريخ</p><p>{formatDate(detail.createdAt, { withTime: true })}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">الحالة</p><Badge status={detail.status} /></div>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">نص التعليق</p>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm leading-relaxed whitespace-pre-wrap">{detail.content}</div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={Boolean(confirm)}
        title="حذف التعليق"
        message={confirm?.bulk ? `سيتم حذف ${confirm.count} تعليق نهائياً.` : 'سيتم حذف التعليق نهائياً. هل أنت متأكد؟'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => (confirm?.bulk ? bulk('delete') : remove(confirm.id))}
      />
    </Guard>
  );
}
