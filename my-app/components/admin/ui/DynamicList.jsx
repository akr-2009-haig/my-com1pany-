"use client";
import {useState} from "react";
export default function DynamicList({items,setItems}){
  const [val,setVal]=useState("");
  return <div><div className="flex gap-2"><input value={val} onChange={e=>setVal(e.target.value)} placeholder="أضف عنصر" className="border flex-1 p-2 rounded-lg"/><button onClick={()=>{ if(val){ setItems([...(items||[]),val]); setVal(""); }}} className="btn-primary">+ إضافة</button></div><ul className="mt-3 space-y-2">{(items||[]).map((it,i)=> <li key={i} className="flex justify-between bg-gray-50 p-2 rounded"><span>{it}</span><button onClick={()=> setItems(items.filter((_,idx)=> idx!==i))} className="text-red-500">✗</button></li>)}</ul></div>
}
