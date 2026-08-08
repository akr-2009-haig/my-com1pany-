"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch"; import ConfirmModal from "../../../components/admin/ui/ConfirmModal"; import Toast from "../../../components/admin/ui/Toast";
export default function HeroAdmin(){
  const [slides,setSlides]=useState([]); const [form,setForm]=useState({title:"",subtitle:"",image:"",btn1Text:"ابدأ مشروعك",btn1Link:"/quote",btn2Text:"شاهد أعمالنا",btn2Link:"/portfolio",isActive:true}); const [editId,setEditId]=useState(null); const [show,setShow]=useState(false); const [del,setDel]=useState(null); const [toast,setToast]=useState("");
  const load=()=> api.get("/slides").then(r=>setSlides(r.data)).catch(()=>{});
  useEffect(()=>{load()},[]);
  const save=async()=>{
    const payload={...form};
    if(editId) await api.put("/slides/"+editId, payload); else await api.post("/slides", payload);
    setShow(false); setForm({title:"",subtitle:"",image:"",btn1Text:"",btn1Link:"",btn2Text:"",btn2Link:"",isActive:true}); setEditId(null); load(); setToast("تم الحفظ"); setTimeout(()=>setToast(""),2000);
  };
  const remove=async()=>{ await api.delete("/slides/"+del); setDel(null); load(); };
  return <div className="space-y-4">
    <div className="flex justify-between"><h1 className="text-2xl font-bold">إدارة السلايدر</h1><button onClick={()=>setShow(true)} className="btn-primary">+ إضافة شريحة</button></div>
    <p className="text-sm text-gray-500">السحب والإفلات لتغيير الترتيب - كل تعديل ينعكس لحظيا عبر Socket.io</p>
    <div className="grid gap-3">
      {slides.map(s=> <div key={s._id} className="card p-4 flex gap-4 items-center">
        <img src={s.image} alt="" className="w-24 h-16 object-cover rounded" />
        <div className="flex-1"><b>{s.title}</b><p className="text-sm text-gray-500">{s.subtitle}</p></div>
        <ToggleSwitch checked={!!s.isActive} onChange={async(v)=>{await api.put("/slides/"+s._id,{isActive:v}); load();}} />
        <button onClick={()=>{setForm(s); setEditId(s._id); setShow(true);}} className="text-blue-600">تعديل</button>
        <button onClick={()=>setDel(s._id)} className="text-red-600">حذف</button>
      </div>)}
      {slides.length===0 && <div className="card p-8 text-center text-gray-400">لا توجد شرائح - أضف أول شريحة</div>}
    </div>
    {show && <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-xl space-y-3">
      <h3 className="font-bold">{editId?"تعديل":"إضافة"} شريحة</h3>
      <input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="رابط الصورة الخلفية (Cloudinary)" className="border w-full p-2 rounded" />
      <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="العنوان الرئيسي" className="border w-full p-2 rounded" />
      <input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} placeholder="العنوان الفرعي" className="border w-full p-2 rounded" />
      <div className="grid grid-cols-2 gap-2"><input value={form.btn1Text} onChange={e=>setForm({...form,btn1Text:e.target.value})} placeholder="نص الزر الأول" className="border p-2 rounded" /><input value={form.btn1Link} onChange={e=>setForm({...form,btn1Link:e.target.value})} placeholder="رابط الزر الأول" className="border p-2 rounded" /></div>
      <div className="grid grid-cols-2 gap-2"><input value={form.btn2Text} onChange={e=>setForm({...form,btn2Text:e.target.value})} placeholder="نص الزر الثاني" className="border p-2 rounded" /><input value={form.btn2Link} onChange={e=>setForm({...form,btn2Link:e.target.value})} placeholder="رابط الزر الثاني" className="border p-2 rounded" /></div>
      <label className="flex gap-2 items-center"><ToggleSwitch checked={!!form.isActive} onChange={v=>setForm({...form,isActive:v})} /> مفعل</label>
      <div className="flex gap-2 justify-end"><button onClick={()=>setShow(false)} className="px-4 py-2 border rounded">إلغاء</button><button onClick={save} className="btn-primary">حفظ</button></div>
    </div></div>}
    <ConfirmModal open={!!del} title="هل أنت متأكد من حذف هذه الشريحة؟" onConfirm={remove} onCancel={()=>setDel(null)} />
    <Toast message={toast} />
  </div>
}
