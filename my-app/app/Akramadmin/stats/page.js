"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch"; import ConfirmModal from "../../../components/admin/ui/ConfirmModal";
export default function StatsAdmin(){
  const [list,setList]=useState([]); const [form,setForm]=useState({value:100,label:"",icon:"⭐",isActive:true}); const [editId,setEditId]=useState(null); const [show,setShow]=useState(false); const [del,setDel]=useState(null);
  const load=()=> api.get("/stats").then(r=>setList(r.data)).catch(()=>{});
  useEffect(()=>{load()},[]);
  const save=async()=>{ if(editId) await api.put("/stats/"+editId,form); else await api.post("/stats",form); setShow(false); setForm({value:100,label:"",icon:"⭐",isActive:true}); setEditId(null); load(); };
  return <div className="space-y-4"><div className="flex justify-between"><h1 className="text-2xl font-bold">إدارة الإحصائيات</h1><button onClick={()=>setShow(true)} className="btn-primary">+ إضافة إحصائية</button></div>
    <div className="grid gap-2">{list.map(s=> <div key={s._id} className="card p-4 flex justify-between items-center"><span>{s.icon} {s.value}+ {s.label}</span><span className="flex gap-2 items-center"><ToggleSwitch checked={!!s.isActive} onChange={async(v)=>{await api.put("/stats/"+s._id,{isActive:v}); load();}} /><button onClick={()=>{setForm(s); setEditId(s._id); setShow(true);}} className="text-blue-600">تعديل</button><button onClick={()=>setDel(s._id)} className="text-red-600">حذف</button></span></div>)}
    </div>
    {show && <div className="fixed inset-0 bg-black/30 grid place-items-center p-4"><div className="bg-white p-6 rounded-xl w-full max-w-md space-y-3"><h3 className="font-bold">إحصائية</h3><input type="number" value={form.value} onChange={e=>setForm({...form,value:parseInt(e.target.value||0)})} className="border w-full p-2 rounded" placeholder="الرقم" /><input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} className="border w-full p-2 rounded" placeholder="الوصف" /><input value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} className="border w-full p-2 rounded" placeholder="أيقونة" /><label className="flex gap-2"><ToggleSwitch checked={!!form.isActive} onChange={v=>setForm({...form,isActive:v})} /> مفعل</label><div className="flex gap-2 justify-end"><button onClick={()=>setShow(false)} className="border px-4 py-2 rounded">إلغاء</button><button onClick={save} className="btn-primary">حفظ</button></div></div></div>}
    <ConfirmModal open={!!del} onConfirm={async()=>{await api.delete("/stats/"+del); setDel(null); load();}} onCancel={()=>setDel(null)} title="حذف الإحصائية؟" />
  </div>
}
