"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api";
export default function Settings(){
  const [form,setForm]=useState({siteName:"My Company", email:"info@company.com"});
  useEffect(()=>{ api.get("/settings").then(r=>setForm(r.data)).catch(()=>{}); },[]);
  const save=async()=>{ await api.post("/settings", form); alert("تم الحفظ وسيتم بث التحديث لحظيا"); };
  return <div><h1 className="text-2xl font-bold mb-6">الإعدادات العامة - معلومات الشركة</h1><div className="card p-6 space-y-4 max-w-2xl"><input value={form.siteName||""} onChange={e=>setForm({...form,siteName:e.target.value})} placeholder="اسم الشركة" className="border w-full p-3 rounded-lg"/><input value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})} placeholder="البريد" className="border w-full p-3 rounded-lg"/><button onClick={save} className="btn-primary">حفظ</button></div></div>
}
