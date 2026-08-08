'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DatabaseBackup, Download, Trash2, RotateCcw, Upload, Plus, RefreshCw,
  HardDrive, Loader2, AlertTriangle, FileArchive, Clock,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { formatBytes, formatDate, timeAgo } from '../../../utils/formatDate';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import DataTable from '../../../components/admin/ui/DataTable';
import Modal from '../../../components/admin/ui/Modal';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import StatsCard from '../../../components/admin/ui/StatsCard';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';

function BackupScreen() {
  const { notify } = useToast();
  const { can } = useAuth();
  const fileRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ driver: '', dir: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState('');

  const [createModal, setCreateModal] = useState(null);
  const [toRestore, setToRestore] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [keepUsers, setKeepUsers] = useState(true);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/backup');
      setRows(data.data || []);
      setMeta({ driver: data.driver || '', dir: data.dir || '' });
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      await api.post('/backup', { note: createModal?.note || '', type: 'manual' });
      notify('تم إنشاء نسخة احتياطية جديدة بنجاح', 'success');
      setCreateModal(null);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setCreating(false);
    }
  };

  const download = async (row) => {
    setBusyId(row._id);
    try {
      const res = await api.get(`/backup/${row._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = row.filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      notify('بدأ تنزيل النسخة الاحتياطية', 'success');
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setBusyId('');
    }
  };

  const restore = async () => {
    setRestoring(true);
    try {
      await api.post(`/backup/${toRestore._id}/restore`, { keepUsers });
      notify('تمت استعادة النسخة الاحتياطية بنجاح — قد تحتاج لتحديث الصفحة', 'success');
      setToRestore(null);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setRestoring(false);
    }
  };

  const restoreUpload = async () => {
    if (!uploadFile) return;
    setRestoring(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('keepUsers', String(keepUsers));
      await api.post('/backup/restore/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('تمت استعادة البيانات من الملف المرفوع بنجاح', 'success');
      setUploadFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setRestoring(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/backup/${toDelete._id}`);
      notify('تم حذف النسخة الاحتياطية', 'success');
      setToDelete(null);
      load();
    } catch (e) {
      notify(errMsg(e), 'error');
      setToDelete(null);
    }
  };

  const totalSize = rows.reduce((a, r) => a + (Number(r.size) || 0), 0);
  const lastBackup = rows[0];

  const columns = [
    {
      key: 'filename',
      label: 'الملف',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-[220px]">
          <FileArchive className={`w-4 h-4 shrink-0 ${r.exists === false ? 'text-danger' : 'text-primary'}`} />
          <div className="min-w-0">
            <p className="font-mono text-xs text-dark truncate dir-ltr text-right">{r.filename}</p>
            {r.note ? <p className="text-[11px] text-gray-400 truncate">{r.note}</p> : null}
            {r.exists === false ? <p className="text-[11px] text-danger">الملف مفقود على الخادم</p> : null}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'النوع',
      render: (r) => (r.type === 'auto'
        ? <span className="badge-blue">تلقائية</span>
        : <span className="badge-primary">يدوية</span>),
    },
    { key: 'size', label: 'الحجم', render: (r) => <span className="text-gray-600 text-sm">{formatBytes(r.size)}</span> },
    {
      key: 'documents',
      label: 'المحتوى',
      render: (r) => (
        <span className="text-xs text-gray-500">
          {r.collections || 0} مجموعة — {r.documents || 0} سجل
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
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
        title="النسخ الاحتياطي والاستعادة"
        subtitle="أنشئ نسخاً احتياطية كاملة لقاعدة البيانات واستعدها عند الحاجة"
        breadcrumb={[{ label: 'الأمان والنسخ' }, { label: 'النسخ الاحتياطي' }]}
        icon={<DatabaseBackup className="w-6 h-6 text-primary" />}
        actions={(
          <>
            <button type="button" onClick={load} className="btn btn-sm btn-muted">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
            </button>
            {can('backup', 'create') ? (
              <button type="button" onClick={() => setCreateModal({ note: '' })} className="btn btn-sm btn-primary">
                <Plus className="w-4 h-4" /> نسخة احتياطية جديدة
              </button>
            ) : null}
          </>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatsCard title="عدد النسخ المحفوظة" value={rows.length} icon="Database" color="#00BCD4" />
        <StatsCard title="المساحة المستخدمة" value={formatBytes(totalSize)} icon="HardDrive" color="#8b5cf6" />
        <StatsCard title="آخر نسخة" value={lastBackup ? timeAgo(lastBackup.createdAt) : '—'} icon="Clock" color="#22c55e" />
        <StatsCard title="محرك التخزين" value={meta.driver === 'file' ? 'ملفات JSON' : (meta.driver || '—')} icon="Server" color="#f97316" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText="لا توجد نسخ احتياطية بعد — أنشئ أول نسخة الآن"
        compact
        actions={(row) => (
          <>
            {can('backup', 'view') ? (
              <button
                type="button"
                title="تنزيل"
                disabled={row.exists === false || busyId === row._id}
                onClick={() => download(row)}
                className="w-8 h-8 grid place-items-center rounded-lg text-primary hover:bg-primary/10 disabled:opacity-30"
              >
                {busyId === row._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              </button>
            ) : null}
            {can('backup', 'edit') ? (
              <button
                type="button"
                title="استعادة"
                disabled={row.exists === false}
                onClick={() => setToRestore(row)}
                className="w-8 h-8 grid place-items-center rounded-lg text-orange-600 hover:bg-orange-50 disabled:opacity-30"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : null}
            {can('backup', 'delete') ? (
              <button
                type="button"
                title="حذف"
                onClick={() => setToDelete(row)}
                className="w-8 h-8 grid place-items-center rounded-lg text-danger hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </>
        )}
      />

      {/* upload restore */}
      {can('backup', 'edit') ? (
        <div className="admin-card p-5 mt-5">
          <h3 className="font-bold text-dark flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5 text-primary" /> استعادة من ملف خارجي
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            ارفع ملف نسخة احتياطية بصيغة <code className="font-mono">.json.gz</code> أو <code className="font-mono">.json</code> تم تنزيله مسبقاً من هذه اللوحة.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".gz,.json"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="text-sm file:ml-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:cursor-pointer flex-1 border border-gray-200 rounded-xl p-2"
            />
            <button
              type="button"
              onClick={restoreUpload}
              disabled={!uploadFile || restoring}
              className="btn btn-sm btn-primary shrink-0"
            >
              {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              استعادة من الملف
            </button>
          </div>

          <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
            <ToggleSwitch size="sm" checked={keepUsers} onChange={setKeepUsers} />
            الاحتفاظ بالمستخدمين الحاليين (عدم استبدال حسابات الدخول)
          </label>

          <div className="mt-4 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>الاستعادة تستبدل البيانات الحالية بالكامل. يُنصح بإنشاء نسخة احتياطية جديدة قبل تنفيذ أي استعادة.</p>
          </div>
        </div>
      ) : null}

      {meta.dir ? (
        <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5" />
          مسار التخزين على الخادم: <span className="font-mono dir-ltr">{meta.dir}</span>
        </p>
      ) : null}

      {/* create modal */}
      <Modal
        open={!!createModal}
        onClose={() => setCreateModal(null)}
        title="إنشاء نسخة احتياطية"
        subtitle="سيتم حفظ نسخة مضغوطة من كل بيانات الموقع"
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => setCreateModal(null)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
            <button type="button" onClick={create} disabled={creating} className="btn btn-sm btn-primary">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseBackup className="w-4 h-4" />}
              {creating ? '...جارٍ الإنشاء' : 'إنشاء النسخة'}
            </button>
          </>
        )}
      >
        {createModal ? (
          <div>
            <span className="label">ملاحظة (اختياري)</span>
            <input
              value={createModal.note}
              onChange={(e) => setCreateModal({ note: e.target.value })}
              className="input"
              placeholder="مثال: قبل تحديث الباقات"
            />
            <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              يحتفظ النظام بآخر 10 نسخ افتراضياً ويحذف الأقدم تلقائياً.
            </p>
          </div>
        ) : null}
      </Modal>

      {/* restore confirm */}
      <Modal
        open={!!toRestore}
        onClose={() => setToRestore(null)}
        title="استعادة نسخة احتياطية"
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => setToRestore(null)} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">إلغاء</button>
            <button type="button" onClick={restore} disabled={restoring} className="btn btn-sm btn-danger">
              {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              {restoring ? '...جارٍ الاستعادة' : 'نعم، استعد الآن'}
            </button>
          </>
        )}
      >
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-red-50 text-danger shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              سيتم استبدال جميع البيانات الحالية ببيانات النسخة
              <b className="font-mono text-xs mx-1 dir-ltr">{toRestore?.filename}</b>
              المؤرخة في {formatDate(toRestore?.createdAt, { withTime: true })}.
            </p>
            <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
              <ToggleSwitch size="sm" checked={keepUsers} onChange={setKeepUsers} />
              الاحتفاظ بالمستخدمين الحاليين
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="حذف النسخة الاحتياطية"
        message={`سيتم حذف الملف ${toDelete?.filename} نهائياً من الخادم.`}
        confirmText="نعم، احذف"
        danger
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

export default function BackupPage() {
  return <Guard module="backup"><BackupScreen /></Guard>;
}
