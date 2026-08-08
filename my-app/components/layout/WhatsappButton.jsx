"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api";
export default function WhatsappButton(){
  const [cfg,setCfg]=useState(null);
  useEffect(()=>{ api.get("/settings").then(r=>setCfg(r.data?.whatsappSettings || r.data)).catch(()=>{}); },[]);
  const number = cfg?.number || cfg?.whatsapp || "966500000000";
  const msg = cfg?.welcomeMessage || "مرحبا، أحتاج مساعدة";
  const tooltip = cfg?.tooltip || "تحتاج مساعدة؟";
  if(cfg && cfg.enabled===false) return null;
  return <a href={`https://wa.me/${number}?text=${encodeURIComponent(msg)}`} target="_blank" className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-lg hover:scale-110 transition z-50">
    <span className="text-2xl">💬</span>
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-xs px-2 py-1 rounded shadow whitespace-nowrap hidden md:block">{tooltip}</span>
  </a>
}
