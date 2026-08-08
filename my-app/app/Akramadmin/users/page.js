"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import DataTable from "../../../components/admin/ui/DataTable"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch";
export default function Users(){
  const [rows,setRows]=useState([]); const [form,setForm]=useState({name:"",email:"",password:"",role:"editor"}); const [show,setShow]=useState(false);
  const load=()=> api.get("/users").then(r=>setRows(r.data)).catch(()=>{});
  useEffect(()=>{load()},[]);
  const save=async()=>{ await api.post("/users", form); setShow(false); setForm({name:"",email:"",password:"",role:"editor"}); load(); };
  return <div><div className="flex justify-between"><h1 className="text-2xl font-bold">المستخدمين والصلاحيات</h1><button onClick={()=>setShow(true)} className="btn-primary">+ إضافة مستخدم</button></div>
    <DataTable columns={[{key:"name",label:"الاسم"},{key:"email",label:"البريد"},{key:"role",label:"الدور"},{key:"isActive",label:"الحالة", render:(v,row)=> <ToggleSwitch checked={v!==false} onChange={async(val)=>{await api.put("/users/"+row._id,{isActive:val}); load();}} />}]} rows={rows} />
    {show && <div className="fixed inset-0 bg-black/30 grid place-items-center p-4"><div className="bg-white p-6 rounded-xl w-full max-w-md space-y-3"><h3 className="font-bold">إضافة مستخدم</h3><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="الاسم" className="border w-full p-2 rounded" /><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="البريد" className="border w-full p-2 rounded" /><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="كلمة المرور" className="border w-full p-2 rounded" /><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="border w-full p-2 rounded"><option value="admin">مدير عام</option><option value="editor">محرر</option><option value="viewer">مشاهد</option></select><div className="flex gap-2 justify-end"><button onClick={()=>setShow(false)} className="border px-4 py-2 rounded">إلغاء</button><button onClick={save} className="btn-primary">حفظ</button></div></div></div>}
  </div>
}
