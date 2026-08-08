"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import DataTable from "../../../components/admin/ui/DataTable"; import ConfirmModal from "../../../components/admin/ui/ConfirmModal"; import Toast from "../../../components/admin/ui/Toast"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch";
export default function Page(){
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [showForm,setShowForm]=useState(false); const [form,setForm]=useState({}); const [editId,setEditId]=useState(null); const [delId,setDelId]=useState(null); const [toast,setToast]=useState("");
  const load=()=> api.get("/partners").then(r=>setRows(Array.isArray(r.data)?r.data:r.data?.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);
  const save=async()=>{
    try{
      if(editId) await api.put("/partners/"+editId, form);
      else await api.post("/partners", form);
      setToast("تم الحفظ"); setShowForm(false); setForm({}); setEditId(null); load();
      setTimeout(()=>setToast(""),2000);
    }catch(e){ alert(e.response?.data?.message||"خطأ"); }
  };
  const del=async()=>{ await api.delete("/partners/"+delId); setDelId(null); load(); setToast("تم الحذف"); setTimeout(()=>setToast(""),2000); };
  const baseCols=[{"key": "name", "label": "اسم الشركة"}, {"key": "isActive", "label": "الحالة"}];
  const cols=baseCols.map(c=> ({...c, render: c.key==="isActive" ? (v,row)=> <ToggleSwitch checked={!!v} onChange={async(val)=>{ await api.put("/partners/"+row._id,{isActive:val}); load();}} /> : undefined }));
  if(loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  return <div className="space-y-4">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">الشعارات والشركاء</h1><button onClick={()=>{setForm({});setEditId(null);setShowForm(true);}} className="btn-primary">+ إضافة</button></div>
    <DataTable columns={[...cols, {key:"actions", label:"إجراءات", render:(_,row)=> <div className="flex gap-2"><button onClick={()=>{setForm(row);setEditId(row._id);setShowForm(true);}} className="text-blue-600">تعديل</button><button onClick={()=>setDelId(row._id)} className="text-red-600">حذف</button></div>}]} rows={rows} />
    {showForm && <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3">
      <h3 className="font-bold">{editId?"تعديل":"إضافة"} الشعارات والشركاء</h3>
      <input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="اسم الشركة" className="border w-full p-3 rounded-lg" />
      <input value={form.logo||""} onChange={e=>setForm({...form,logo:e.target.value})} placeholder="رابط الشعار" className="border w-full p-3 rounded-lg" />
      <input value={form.url||""} onChange={e=>setForm({...form,url:e.target.value})} placeholder="رابط الموقع" className="border w-full p-3 rounded-lg" />
      <label className="flex items-center gap-2"><ToggleSwitch checked={!!form.isActive} onChange={v=>setForm({...form,isActive:v})} /> مفعل</label>
      <div className="flex gap-2 justify-end"><button onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded">إلغاء</button><button onClick={save} className="btn-primary">حفظ</button></div>
    </div></div>}
    <ConfirmModal open={!!delId} title="هل أنت متأكد من الحذف؟" onConfirm={del} onCancel={()=>setDelId(null)} />
    <Toast message={toast} />
  </div>
}
