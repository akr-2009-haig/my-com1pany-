"use client";
export default function DataTable({columns,rows}){
  return <div className="overflow-auto border rounded-xl bg-white">
    <table className="w-full text-sm">
      <thead className="bg-gray-50"><tr>{columns.map(c=> <th key={c.key} className="p-3 text-right font-medium">{c.label}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=> <tr key={i} className="border-t hover:bg-gray-50">{columns.map(c=> <td key={c.key} className="p-3">{c.render? c.render(r[c.key],r): r[c.key]}</td>)}</tr>)}{rows.length===0 && <tr><td colSpan={columns.length} className="p-6 text-center text-gray-400">لا توجد بيانات</td></tr>}</tbody>
    </table>
  </div>
}
