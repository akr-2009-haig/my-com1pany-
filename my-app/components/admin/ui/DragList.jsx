"use client";
export default function DragList({items,onReorder}){
  return <div className="space-y-2">{items.map((it,i)=> <div key={it._id||i} className="bg-white border p-3 rounded-lg flex justify-between items-center"><span>{it.title||it.name||it.label||"عنصر"}</span><span className="cursor-move">⠿</span></div>)}</div>
}
