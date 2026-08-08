"use client";
export default function LineChart({data}){
  const max=Math.max(...(data||[100]),1);
  return <div className="h-48 flex items-end gap-1">{(data||[]).map((v,i)=> <div key={i} className="flex-1 bg-[#00BCD4]/20 rounded-t relative" style={{height:`${(v/max)*100}%`}}><div className="absolute bottom-0 left-0 right-0 bg-[#00BCD4] rounded-t" style={{height:"60%"}}></div></div>)}</div>
}
