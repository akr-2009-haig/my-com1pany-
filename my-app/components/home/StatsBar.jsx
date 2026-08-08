"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import useRealtime from "../../hooks/useRealtime";
export default function StatsBar(){
  const [stats,setStats]=useState([]);
  const fetch=()=> api.get("/stats").then(r=> setStats(r.data.filter(s=>s.isActive))).catch(()=>{});
  useEffect(()=>{fetch()},[]); useRealtime("stats:updated", fetch);
  const list= stats.length? stats : [{value:250,label:"مشروع منجز",icon:"📁"},{value:180,label:"عميل سعيد",icon:"😊"},{value:10,label:"سنة خبرة",icon:"⭐"},{value:25,label:"مطور محترف",icon:"👨‍💻"}];
  return <section className="bg-[#00BCD4] py-10">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center divide-x divide-white/20">
      {list.map((s,i)=> <div key={i} className="p-4"><div className="text-3xl mb-2">{s.icon||"📊"}</div><div className="text-4xl font-black">{s.value}{s.suffix||"+"}</div><div className="text-white/90 mt-1">{s.label}</div></div>)}
    </div>
  </section>
}
