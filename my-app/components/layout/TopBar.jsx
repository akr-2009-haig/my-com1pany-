"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api";
export default function TopBar(){
  const [settings,setSettings]=useState(null);
  useEffect(()=>{ api.get("/settings").then(r=>setSettings(r.data)).catch(()=>{}); },[]);
  return <div className="bg-[#f8f9fa] text-sm border-b">
    <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
      <div className="flex gap-4">
        <span>📞 {settings?.phone || "+966 500 000 000"}</span>
        <span>✉️ {settings?.email || "info@company.com"}</span>
      </div>
      <div className="flex gap-2">
        {["F","X","I","L"].map(c=> <a key={c} href="#" className="w-7 h-7 rounded-full bg-[#00BCD4] text-white grid place-items-center text-xs hover:bg-[#00ACC1]">{c}</a>)}
      </div>
    </div>
  </div>
}
