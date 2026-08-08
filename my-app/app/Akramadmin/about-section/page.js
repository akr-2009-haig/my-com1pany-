"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import RichTextEditor from "../../../components/admin/ui/RichTextEditor"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch";
export default function AboutSection(){
  const [form,setForm]=useState({siteName:"", description:"", address:"", phone:""}); const [secVisible,setSecVisible]=useState(true);
  useEffect(()=>{ api.get("/settings").then(r=>setForm(r.data)).catch(()=>{}); api.get("/sections").then(r=>{ const s=r.data.find(x=>x.key==="about"); if(s) setSecVisible(s.isVisible); }).catch(()=>{}); },[]);
  const save=async()=>{ await api.post("/settings", form); // also update section visibility
    const secs=await api.get("/sections").catch(()=>({data:[]})); const about=secs.data.find(x=>x.key==="about"); if(about) await api.put("/sections/"+about._id,{isVisible:secVisible});
    alert("تم الحفظ - ينعكس لحظيا"); };
  return <div className="space-y-4"><h1 className="text-2xl font-bold">قسم من نحن (مختصر)</h1>
    <div className="card p-6 space-y-3 max-w-2xl">
      <label className="flex gap-2"><ToggleSwitch checked={secVisible} onChange={setSecVisible} /> إظهار القسم في الرئيسية</label>
      <input value={form.siteName||""} onChange={e=>setForm({...form,siteName:e.target.value})} placeholder="العنوان الصغير (من نحن)" className="border w-full p-2 rounded" />
      <RichTextEditor value={form.description||""} onChange={v=>setForm({...form,description:v})} />
      <p className="text-xs text-gray-500">النقاط المميزة تدار كقائمة ديناميكية - أضفها هنا (مثال: فريق محترف, جودة عالية)</p>
      <button onClick={save} className="btn-primary">حفظ</button>
    </div>
  </div>
}
