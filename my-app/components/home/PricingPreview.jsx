"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import PackageCard from "../shared/PackageCard";
export default function PricingPreview(){
  const [pkgs,setPkgs]=useState([]); const [yearly,setYearly]=useState(false);
  useEffect(()=>{ api.get("/packages").then(r=> setPkgs(r.data.filter(p=>p.isActive))).catch(()=>{}); },[]);
  const list=pkgs.length?pkgs:[{name:"الأساسية",priceMonthly:199,priceYearly:1990,features:[{text:"موقع متجاوب",included:true},{text:"دعم فني",included:false}]},{name:"الاحترافية",priceMonthly:399,priceYearly:3990,features:[{text:"كل المميزات",included:true}],isPopular:true},{name:"المميزة",priceMonthly:699,priceYearly:6990,features:[{text:"حلول مخصصة",included:true}]}];
  return <section className="py-16 bg-[#f5f7fa]"><div className="max-w-7xl mx-auto px-4 text-center"><h2 className="text-3xl font-bold">الباقات والأسعار</h2><label className="inline-flex items-center gap-2 mt-4 bg-white border rounded-full p-1"><span className={yearly?"text-gray-400":"text-[#00BCD4] font-bold"}>شهري</span><input type="checkbox" checked={yearly} onChange={e=>setYearly(e.target.checked)} className="accent-[#00BCD4]"/><span className={yearly?"text-[#00BCD4] font-bold":"text-gray-400"}>سنوي</span></label><div className="grid md:grid-cols-3 gap-6 mt-8 text-right">{list.map(p=> <PackageCard key={p.name} pkg={p} yearly={yearly}/>)}</div></div></section>
}
