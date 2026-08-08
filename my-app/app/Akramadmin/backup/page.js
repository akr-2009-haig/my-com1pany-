"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api";
export default function BackupPage(){
  const [list,setList]=useState([]); const [loading,setLoading]=useState(false);
  const load=()=> api.get("/backup/list").then(r=>setList(r.data)).catch(()=>{});
  useEffect(()=>{load()},[]);
  const create=async()=>{ setLoading(true); try{ const r=await api.post("/backup/create"); alert("تم إنشاء نسخة: "+r.data.file); load(); }catch(e){ alert(e.response?.data?.message||"فشل"); } finally{ setLoading(false); } };
  const del=async(f)=>{ if(!confirm("حذف النسخة؟")) return; await api.delete(`/backup/${f}`); load(); };
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
    <div className="card p-6">
      <button onClick={create} disabled={loading} className="btn-primary">{loading?"جاري النسخ...":"إنشاء نسخة احتياطية الآن"}</button>
      <p className="text-xs text-gray-500 mt-2">يتم حفظ آخر 10 نسخ تلقائيا في /backups كـ JSON مشفر، في الإنتاج يفضل ربطها بـ S3 / mongodump مشفر.</p>
    </div>
    <div className="card p-0 overflow-auto">
      <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-right">الملف</th><th>الحجم</th><th>التاريخ</th><th>إجراء</th></tr></thead>
      <tbody>{list.map(f=> <tr key={f.name} className="border-t"><td className="p-2 font-mono text-xs">{f.name}</td><td>{(f.size/1024).toFixed(1)} KB</td><td>{new Date(f.date).toLocaleString()}</td><td className="flex gap-2 p-2"><button onClick={()=>del(f.name)} className="text-red-500">حذف</button><button onClick={()=>{ if(confirm('استعادة هذه النسخة ستحل محل البيانات الحالية! متأكد؟')) api.post('/backup/restore',{file:f.name}).then(()=>alert('تمت المحاكاة'))}} className="text-blue-600">استعادة</button></td></tr>)}
      {list.length===0 && <tr><td colSpan={4} className="text-center p-6 text-gray-400">لا توجد نسخ بعد</td></tr>}
      </tbody></table>
    </div>
    <div className="card p-4 bg-amber-50 border-amber-200 text-sm text-amber-800">⚠️ في الإنتاج: فعل النسخ التلقائي اليومي عبر cron + تشفير at-rest + تخزين خارجي (S3) + اختبار استعادة دوري.</div>
  </div>
}
