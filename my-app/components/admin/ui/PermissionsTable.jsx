'use client';

const ACTION_LABELS = {
  view: 'عرض', create: 'إضافة', edit: 'تعديل', delete: 'حذف', toggle: 'تفعيل',
};
const ALL_ACTIONS = ['view', 'create', 'edit', 'delete', 'toggle'];

export default function PermissionsTable({
  modules = [], value = {}, onChange, disabled = false,
}) {
  const get = (m, a) => Boolean(value?.[m]?.[a]);

  const set = (m, a, v) => {
    const next = { ...value, [m]: { ...(value[m] || {}), [a]: v } };
    if (a !== 'view' && v) next[m].view = true;
    if (a === 'view' && !v) ALL_ACTIONS.forEach((x) => { next[m][x] = false; });
    onChange?.(next);
  };

  const setRow = (mod, v) => {
    const row = {};
    mod.actions.forEach((a) => { row[a] = v; });
    onChange?.({ ...value, [mod.key]: row });
  };

  const setAll = (v) => {
    const next = {};
    modules.forEach((m) => {
      next[m.key] = {};
      m.actions.forEach((a) => { next[m.key][a] = v; });
    });
    onChange?.(next);
  };

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h4 className="font-bold text-sm text-dark">مصفوفة الصلاحيات</h4>
        {!disabled ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setAll(true)} className="btn btn-sm bg-primary/10 text-primary hover:bg-primary hover:text-white">تحديد الكل</button>
            <button type="button" onClick={() => setAll(false)} className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300">إلغاء الكل</button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">القسم</th>
              {ALL_ACTIONS.map((a) => <th key={a} className="table-th text-center">{ACTION_LABELS[a]}</th>)}
              <th className="table-th text-center w-20">الكل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {modules.map((m) => {
              const rowAll = m.actions.every((a) => get(m.key, a));
              return (
                <tr key={m.key} className="hover:bg-gray-50/70">
                  <td className="table-td font-semibold whitespace-nowrap">{m.label}</td>
                  {ALL_ACTIONS.map((a) => (
                    <td key={a} className="table-td text-center">
                      {m.actions.includes(a) ? (
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={get(m.key, a)}
                          onChange={(e) => set(m.key, a, e.target.checked)}
                          className="w-4 h-4 accent-[#00BCD4] cursor-pointer disabled:cursor-not-allowed"
                        />
                      ) : <span className="text-gray-200">—</span>}
                    </td>
                  ))}
                  <td className="table-td text-center">
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={rowAll}
                      onChange={() => setRow(m, !rowAll)}
                      className="w-4 h-4 accent-[#1a1a2e] cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
