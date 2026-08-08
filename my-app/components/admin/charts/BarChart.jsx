"use client";
export default function BarChart({data}){
  return <div className="h-48 flex items-end gap-2">{(data||[30,50,40,70]).map((v,i)=> <div key={i} className="flex-1 bg-[#00BCD4] rounded-t" style={{height:v+"%"}}></div>)}</div>
}
