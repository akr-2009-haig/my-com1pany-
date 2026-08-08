"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch";
export default function WhyUs(){
  const [visible,setVisible]=useState(true);
  useEffect(()=>{ api.get("/sections").then(r=>{ const s=r.data.find(x=>x.key==="whyus"); if(s) setVisible(s.isVisible); }).catch(()=>{}); },[]);
  const save=async()=>{ const secs=await api.get("/sections"); const s=secs.data.find(x=>x.key==="whyus"); if(s) await api.put("/sections/"+s._id,{isVisible:visible}); alert("تم الحفظ"); };
  return <div className="space-y-4"><h1 className="text-2xl font-bold">لماذا تختارنا</h1><div className="card p-6 max-w-xl space-y-3"><label className="flex gap-2"><ToggleSwitch checked={visible} onChange={setVisible} /> إظهار القسم</label><input placeholder="عنوان الميزة 1" className="border w-full p-2 rounded" /><input placeholder="وصف الميزة" className="border w-full p-2 rounded" /><button className="border px-3 py-1 rounded">+ إضافة ميزة</button><button onClick={save} className="btn-primary">حفظ</button></div></div>
}
