'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpDown, ChevronRight, ChevronLeft, Inbox, Loader2, Search,
} from 'lucide-react';

/**
 * Admin table with search, sorting, pagination, bulk selection and row actions.
 *
 * columns: [{ key, label, render?(row), sortable?, className?, width? }]
 * Server-driven mode: pass `page`, `pages`, `total`, `onPageChange`, `sort`, `onSortChange`.
 */
export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyText = 'لا توجد بيانات لعرضها',
  rowKey = (r, i) => r?._id || i,
  selectable = false,
  selected = [],
  onSelect,
  actions,
  bulkBar,
  page = 1,
  pages = 1,
  total = 0,
  onPageChange,
  perPage,
  onPerPageChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  toolbar,
  compact = false,
}) {
  const [localSort, setLocalSort] = useState(null);
  const serverSort = typeof onSortChange === 'function';
  const activeSort = serverSort ? sort : localSort;

  const sorted = useMemo(() => {
    if (serverSort || !localSort) return rows;
    const [field, dir] = localSort.startsWith('-') ? [localSort.slice(1), -1] : [localSort, 1];
    return [...rows].sort((a, b) => {
      const av = a?.[field]; const bv = b?.[field];
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'ar') * dir;
    });
  }, [rows, localSort, serverSort]);

  const toggleSort = (key) => {
    const next = activeSort === key ? `-${key}` : key;
    if (serverSort) onSortChange(next); else setLocalSort(next);
  };

  const allIds = sorted.map((r, i) => String(rowKey(r, i)));
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  const toggleAll = () => onSelect?.(allChecked ? [] : allIds);
  const toggleOne = (id) => onSelect?.(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const cellPad = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="admin-card overflow-hidden">
      {(onSearchChange || toolbar) ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border-b border-gray-100">
          {onSearchChange ? (
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
              <input
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="input pr-9 py-2.5 text-sm"
              />
            </div>
          ) : null}
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      ) : null}

      {selectable && selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/20">
          <span className="text-sm font-semibold text-primary-700">تم تحديد {selected.length} عنصر</span>
          <span className="flex-1" />
          {bulkBar}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {selectable ? (
                <th className={`${cellPad} w-10`}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 accent-[#00BCD4] cursor-pointer" aria-label="تحديد الكل" />
                </th>
              ) : null}
              {columns.map((c) => (
                <th key={c.key} className={`table-th ${c.className || ''}`} style={c.width ? { width: c.width } : undefined}>
                  {c.sortable ? (
                    <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                      {c.label}
                      <ArrowUpDown className={`w-3.5 h-3.5 ${activeSort === c.key || activeSort === `-${c.key}` ? 'text-primary' : 'text-gray-300'}`} />
                    </button>
                  ) : c.label}
                </th>
              ))}
              {actions ? <th className="table-th text-left w-28">إجراءات</th> : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="py-14 text-center">
                  <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">جارٍ التحميل...</p>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="py-14 text-center">
                  <Inbox className="w-10 h-10 text-gray-200 mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">{emptyText}</p>
                </td>
              </tr>
            ) : sorted.map((row, i) => {
              const id = String(rowKey(row, i));
              return (
                <tr key={id} className={`hover:bg-primary/[.03] transition-colors ${selected.includes(id) ? 'bg-primary/5' : ''}`}>
                  {selectable ? (
                    <td className={cellPad}>
                      <input type="checkbox" checked={selected.includes(id)} onChange={() => toggleOne(id)} className="w-4 h-4 accent-[#00BCD4] cursor-pointer" aria-label="تحديد" />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td key={c.key} className={`table-td ${c.tdClassName || ''}`}>
                      {c.render ? c.render(row, i) : (row?.[c.key] ?? '—')}
                    </td>
                  ))}
                  {actions ? <td className="table-td text-left"><div className="flex items-center justify-end gap-1">{actions(row, i)}</div></td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(pages > 1 || onPerPageChange) ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-500">
            {total ? `إجمالي ${total} عنصر — صفحة ${page} من ${pages}` : `صفحة ${page} من ${pages}`}
          </p>
          <div className="flex items-center gap-2">
            {onPerPageChange ? (
              <select value={perPage} onChange={(e) => onPerPageChange(Number(e.target.value))} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} / صفحة</option>)}
              </select>
            ) : null}
            <button type="button" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:border-primary hover:text-primary">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold px-2">{page}</span>
            <button type="button" disabled={page >= pages} onClick={() => onPageChange?.(page + 1)} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:border-primary hover:text-primary">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
