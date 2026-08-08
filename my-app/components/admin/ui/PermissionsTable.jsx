export default function PermissionsTable(){
  const rows=["السلايدر","الخدمات","المشاريع","المدونة","الرسائل"];
  return <table className="w-full text-sm border"><thead><tr className="bg-gray-50"><th className="p-2">القسم</th><th>عرض</th><th>إضافة</th><th>تعديل</th><th>حذف</th></tr></thead><tbody>{rows.map(r=> <tr key={r} className="border-t text-center"><td className="p-2 text-right">{r}</td><td><input type="checkbox" defaultChecked/></td><td><input type="checkbox" defaultChecked/></td><td><input type="checkbox"/></td><td><input type="checkbox"/></td></tr>)}</tbody></table>
}
