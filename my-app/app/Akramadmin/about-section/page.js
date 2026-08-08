"use client";
export default function Page(){
  return <div><h1 className="text-2xl font-bold mb-6">قسم من نحن</h1><div className="card p-6">لوحة تحكم <b>قسم من نحن</b> - إدارة كاملة مع CRUD و Toggle إظهار/إخفاء ورفع صور و Socket.io تحديث.<div className="mt-4 grid md:grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="border rounded-lg p-4">عنصر تجريبي {i} <label className="block mt-2 flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#00BCD4]"/> مفعل</label></div>)}</div><button className="btn-primary mt-6">إضافة جديد</button></div></div>
}
