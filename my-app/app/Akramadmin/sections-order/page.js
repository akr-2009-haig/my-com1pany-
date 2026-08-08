"use client";
import {useEffect,useState} from "react"; import api from "../../../utils/api"; import ToggleSwitch from "../../../components/admin/ui/ToggleSwitch";
export default function SectionsOrder(){
  const [secs,setSecs]=useState([]);
  const load=()=> api.get("/sections").then(r=>setSecs(r.data.sort((a,b)=>a.order-b.order))).catch(()=>{});
  useEffect(()=>{load()},[]);
  const move=(i,dir)=>{
    const arr=[...secs]; const j=i+dir; if(j<0||j>=arr.length) return; [arr[i],arr[j]]=[arr[j],arr[i]]; // local swap
    setSecs(arr); // optimistic
    const orderedIds=arr.map(s=>s._id);
    api.post("/sections/reorder",{orderedIds}).then(load);
  };
  const toggle=async(s)=>{ await api.put("/sections/"+s._id,{isVisible:!s.isVisible}); load(); };
  return <div><h1 className="text-2xl font-bold mb-4">ترتيب أقسام الرئيسية</h1><p className="text-sm text-gray-500 mb-3">اسحب أو استخدم الأسهم - أي تغيير يبث لحظيا عبر Socket.io</p><div className="space-y-2">{secs.map((s,i)=> <div key={s._id} className="card p-3 flex justify-between items-center"><span>{s.key} - {s.title||s.key}</span><span className="flex gap-2 items-center"><ToggleSwitch checked={!!s.isVisible} onChange={()=>toggle(s)} /><button onClick={()=>move(i,-1)} className="border px-2 rounded">↑</button><button onClick={()=>move(i,1)} className="border px-2 rounded">↓</button><span className="cursor-move">⠿</span></span></div>)}</div></div>
}
