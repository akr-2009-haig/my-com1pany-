'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Image as ImageIcon, Save, RefreshCw, Loader2, ExternalLink, Check,
} from 'lucide-react';
import Link from 'next/link';
import api, { errMsg } from '../../../utils/api';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import Guard from '../../../components/admin/ui/Guard';
import ImageUploader from '../../../components/admin/ui/ImageUploader';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';

const PUBLIC_PATH = {
  about: '/about', services: '/services', portfolio: '/portfolio', pricing: '/pricing',
  blog: '/blog', careers: '/careers', contact: '/contact', quote: '/quote',
  faq: '/faq', privacy: '/privacy', terms: '/terms',
};

function BannersScreen() {
  const { notify } = useToast();
  const { can } = useAuth();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState('');

  const load = useCallback(async (keepPage) => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners');
      const list = data.data || [];
      setBanners(list);
      const target = list.find((b) => b.page === (keepPage || activePage)) || list[0];
      if (target) { setActivePage(target.page); setDraft({ ...target }); }
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const select = (b) => { setActivePage(b.page); setDraft({ ...b }); };
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await api.put(`/banners/${draft.page}`, {
        title: draft.title,
        titleEn: draft.titleEn || '',
        subtitle: draft.subtitle || '',
        image: draft.image || '',
        isActive: draft.isActive !== false,
      });
      notify('تم حفظ بانر الصفحة بنجاح', 'success');
      setSavedFlash(draft.page);
      setTimeout(() => setSavedFlash(''), 2200);
      setBanners((list) => list.map((b) => (b.page === draft.page ? { ...b, ...draft } : b)));
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="بانرات الصفحات"
        subtitle="تحكم في صورة وعنوان الترويسة العلوية لكل صفحة من صفحات الموقع"
        breadcrumb={[{ label: 'بانرات الصفحات' }]}
        icon={<ImageIcon className="w-6 h-6 text-primary" />}
        actions={(
          <button type="button" onClick={() => load(activePage)} className="btn btn-sm btn-muted">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
        )}
      />

      {loading && !draft ? (
        <div className="admin-card py-24 grid place-items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px,1fr] gap-5 items-start">
          {/* pages list */}
          <aside className="admin-card p-3 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-dark px-2 py-1.5">الصفحات ({banners.length})</h3>
            <ul className="space-y-1 mt-1 max-h-[60vh] overflow-y-auto">
              {banners.map((b) => (
                <li key={b.page}>
                  <button
                    type="button"
                    onClick={() => select(b)}
                    className={`w-full text-right rounded-xl px-3 py-2.5 border flex items-center gap-2 transition-all
                      ${activePage === b.page
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt="" className="w-10 h-8 rounded object-cover border border-gray-100 shrink-0" />
                    ) : (
                      <span className="w-10 h-8 rounded bg-gray-100 grid place-items-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-dark truncate">{b.label}</span>
                      <span className="block text-[11px] text-gray-400 dir-ltr text-right">{PUBLIC_PATH[b.page] || `/${b.page}`}</span>
                    </span>
                    {savedFlash === b.page ? <Check className="w-4 h-4 text-green-600" /> : null}
                    {b.isActive === false ? <span className="badge-gray text-[10px]">مخفي</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* editor */}
          {draft ? (
            <section className="space-y-5">
              {/* live preview */}
              <div className="admin-card overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-dark text-sm">معاينة مباشرة — {draft.label}</h3>
                  <Link
                    href={PUBLIC_PATH[draft.page] || `/${draft.page}`}
                    target="_blank"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> عرض الصفحة
                  </Link>
                </div>
                <div
                  className="relative h-48 sm:h-60 grid place-items-center text-center px-6 bg-dark"
                  style={draft.image ? {
                    backgroundImage: `linear-gradient(rgba(26,26,46,.72), rgba(26,26,46,.72)), url(${draft.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined}
                >
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{draft.title || draft.label}</h2>
                    {draft.subtitle ? <p className="text-white/80 text-sm mt-2 max-w-xl mx-auto">{draft.subtitle}</p> : null}
                    {draft.isActive === false ? (
                      <span className="inline-block mt-3 badge-red">البانر مخفي حالياً</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="admin-card p-5 sm:p-6">
                <div className="grid lg:grid-cols-2 gap-5">
                  <div>
                    <ImageUploader
                      label="صورة خلفية البانر"
                      value={draft.image}
                      onChange={(v) => set('image', v)}
                      folder="banners"
                      hint="المقاس المفضل 1920×500 بكسل"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="label">العنوان (عربي)</span>
                      <input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} className="input" placeholder={draft.label} />
                    </div>
                    <div>
                      <span className="label">العنوان (إنجليزي)</span>
                      <input dir="ltr" value={draft.titleEn || ''} onChange={(e) => set('titleEn', e.target.value)} className="input text-left" placeholder="About Us" />
                    </div>
                    <div>
                      <span className="label">النص الفرعي</span>
                      <textarea value={draft.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} rows={3} className="input resize-y" placeholder="وصف قصير يظهر أسفل العنوان" />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-dark">إظهار البانر</p>
                        <p className="text-xs text-gray-500">عند الإيقاف تبدأ الصفحة بالمحتوى مباشرة</p>
                      </div>
                      <ToggleSwitch checked={draft.isActive !== false} onChange={(v) => set('isActive', v)} />
                    </div>
                  </div>
                </div>

                {can('banners', 'edit') ? (
                  <div className="flex justify-end mt-6 pt-5 border-t border-gray-100">
                    <button type="button" onClick={save} disabled={saving} className="btn btn-sm btn-primary">
                      <Save className="w-4 h-4" /> {saving ? '...جارٍ الحفظ' : 'حفظ البانر'}
                    </button>
                  </div>
                ) : (
                  <p className="mt-6 text-xs text-gray-400 text-center">لا تملك صلاحية تعديل البانرات</p>
                )}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function BannersPage() {
  return <Guard module="banners"><BannersScreen /></Guard>;
}
