"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import ServiceCard from "../../components/shared/ServiceCard";
import PageBanner from "../../components/shared/PageBanner";
export default function ServicesPage(){
  const [services,setServices]=useState([]);
  useEffect(()=>{ api.get("/services").then(r=>setServices(r.data)).catch(()=>{}); },[]);
  return <div><PageBanner title="خدماتنا" breadcrumb="الرئيسية > خدماتنا"/><div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">{services.map(s=> <ServiceCard key={s._id} service={s}/>)} {services.length===0 && [1,2,3,4,5,6].map(i=><div key={i} className="card p-6 h-56 flex flex-col justify-center items-center text-gray-400">خدمة تجريبية {i}</div>)}</div></div>;
}
