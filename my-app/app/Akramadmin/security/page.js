"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api";
export default function SecurityPage(){
  const [blocked,setBlocked]=useState([]); const [logs,setLogs]=useState([]); const [ip,setIp]=useState("");
  const load=()=>{
    api.get("/security/blocked").then(r=>setBlocked(r.data)).catch(()=>{});
    api.get("/security/login-logs").then(r=>setLogs(r.data)).catch(()=>{});
  };
  useEffect(()=>{load()},[]);
  const block=async()=>{
    if(!ip) return;
    await api.post("/security/blocked",{ip, reason:"Manual block", minutes:60});
    setIp(""); load();
  };
  const unblock=async(id)=>{ await api.delete(`/security/blocked/${id}`); load(); };
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">الأمان - الحماية السيبرانية</h1>
    <div className="card p-6">
      <h3 className="font-bold mb-3">حظر IP (Brute-force protection)</h3>
      <div className="flex gap-2 max-w-md"><input value={ip} onChange={e=>setIp(e.target.value)} placeholder="192.168.1.100" className="border p-2 rounded flex-1"/><button onClick={block} className="btn-primary">حظر</button></div>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-right">IP</th><th>السبب</th><th>ينتهي</th><th>إجراء</th></tr></thead>
        <tbody>{blocked.map(b=> <tr key={b._id} className="border-t"><td className="p-2">{b.ip}</td><td>{b.reason}</td><td>{b.expiresAt? new Date(b.expiresAt).toLocaleString(): "دائم"}</td><td><button onClick={()=>unblock(b._id)} className="text-red-500">رفع الحظر</button></td></tr>)}
        {blocked.length===0 && <tr><td colSpan={4} className="text-center p-4 text-gray-400">لا يوجد حظر</td></tr>}
        </tbody></table>
      </div>
    </div>
    <div className="card p-6">
      <h3 className="font-bold mb-3">سجل محاولات الدخول (آخر 20)</h3>
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2">البريد</th><th>IP</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody>{logs.slice(0,20).map((l,i)=> <tr key={i} className="border-t"><td className="p-2">{l.email}</td><td>{l.ip}</td><td><span className={l.status==='success'?"text-green-600":"text-red-600"}>{l.status}</span></td><td>{new Date(l.createdAt).toLocaleString()}</td></tr>)}</tbody></table>
      </div>
    </div>
    <div className="card p-6 bg-blue-50 border-blue-200">
      <h4 className="font-bold text-blue-800">ميزات الحماية المفعلة</h4>
      <ul className="text-sm text-blue-700 list-disc mr-5 mt-2 space-y-1">
        <li>Helmet HSTS + CSP + XSS Filter + HPP + NoSQL Injection sanitization</li>
        <li>Rate limiting: API 300/15min, Login 5 fails → IP block 30min</li>
        <li>JWT httpOnly Secure SameSite=Lax + bcrypt 12 rounds + strong password policy</li>
        <li>File upload whitelist (jpg/png/webp/pdf) + 5MB limit + Cloudinary transformation</li>
        <li>Activity & Login logs + auto-blocked IP list + maintenance mode</li>
      </ul>
    </div>
  </div>
}
