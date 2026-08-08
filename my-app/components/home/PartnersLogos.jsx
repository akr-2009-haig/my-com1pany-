"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api";
export default function PartnersLogos(){
  const [partners,setPartners]=useState([]);
  useEffect(()=>{ api.get("/partners").then(r=> setPartners(r.data.filter(p=>p.isActive))).catch(()=>{}); },[]);
  const list=partners.length?partners:[1,2,3,4,5,6].map(i=>({ _id:i,name:"Partner "+i, logo:"https://via.placeholder.com/120x60?text=Logo"+i }));
  return <section className="py-12 bg-white"><div className="max-w-7xl mx-auto px-4 text-center"><h3 className="font-bold mb-6">شركاؤنا</h3><div className="flex gap-8 overflow-x-auto justify-center grayscale hover:grayscale-0 transition">{list.map(p=> <img key={p._id} src={p.logo} alt={p.name} className="h-12 object-contain"/> )}</div></div></section>
}
