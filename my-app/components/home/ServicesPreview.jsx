"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import ServiceCard from "../shared/ServiceCard";
export default function ServicesPreview(){
  const [services,setServices]=useState([]);
  useEffect(()=>{ api.get("/services").then(r=> setServices(r.data.filter(s=>s.isActive).slice(0,6))).catch(()=>{}); },[]);
  const list=services.length?services:[1,2,3,4,5,6].map(i=>({ _id:i,title:"خدمة "+i, shortDesc:"وصف مختصر للخدمة يوضح القيمة المقدمة للعميل", icon:"🚀" }));
  return <section className="py-16 bg-[#f5f7fa]">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-10"><p className="text-[#00BCD4]">ماذا نقدم</p><h2 className="text-3xl font-bold">خدماتنا</h2><div className="w-16 h-1 bg-[#00BCD4] mx-auto mt-3"></div></div>
      <div className="grid md:grid-cols-3 gap-6">{list.map(s=> <ServiceCard key={s._id} service={s}/>)}</div>
      <div className="text-center mt-8"><a href="/services" className="btn-primary">جميع الخدمات</a></div>
    </div>
  </section>
}
