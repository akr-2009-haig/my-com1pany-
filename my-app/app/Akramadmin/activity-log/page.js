"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api";
export default function ActivityLogPage(){
  const [logs,setLogs]=useState([]);
  useEffect(()=>{ api.get("/security/activity-logs").then(r=>setLogs(r.data)).catch(()=>{}); },[]);
  const clear=async()=>{ if(!confirm("مسح السجل؟")) return; await api.delete("/security/activity-logs"); setLogs([]); };
  return <div>
    <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold">سجل النشاطات (Audit Trail)</h1><button onClick={clear} className="text-red-500 border px-3 py-1 rounded">مسح</button></div>
    <div className="card p-0 overflow-auto">
      <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-right">المستخدم</th><th>الإجراء</th><th>الوحدة</th><th>IP</th><th>التاريخ</th></tr></thead>
      <tbody>{logs.map(l=> <tr key={l._id} className="border-t"><td className="p-2">{l.userName}</td><td>{l.action}</td><td>{l.module}</td><td>{l.ip}</td><td>{new Date(l.createdAt).toLocaleString()}</td></tr>)}
      {logs.length===0 && <tr><td colSpan={5} className="text-center p-6 text-gray-400">لا يوجد نشاط بعد - سيتم تسجيل كل POST/PUT/DELETE تلقائيا</td></tr>}
      </tbody></table>
    </div>
    <p className="text-xs text-gray-500 mt-3">يتم تسجيل كل عملية تعديل في لوحة الأدمن مع IP و User-Agent للمراجعة الأمنية وإمكانية التصدير CSV.</p>
  </div>
}
