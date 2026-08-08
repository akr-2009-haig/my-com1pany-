"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api";
export default function Testimonials(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/testimonials").then(r=> setItems(r.data.filter(t=>t.isActive))).catch(()=>{}); },[]);
  const list=items.length?items:[1,2,3].map(i=>({ _id:i,name:"عميل "+i, role:"مدير", company:"شركة", content:"تجربة رائعة وفريق محترف أنجز المشروع بجودة عالية وفي الوقت المحدد.", rating:5, avatar:"https://i.pravatar.cc/100?img="+i }));
  return <section className="py-16 bg-white"><div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-bold text-center mb-8">آراء العملاء</h2><div className="grid md:grid-cols-3 gap-6">{list.map(t=> <div key={t._id} className="card p-6"><div className="text-[#00BCD4] text-4xl">❝</div><p className="text-gray-600 italic">"{t.content}"</p><div className="flex gap-3 mt-4 items-center"><img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full"/><div><b>{t.name}</b><p className="text-xs text-gray-500">{t.role} - {t.company}</p><div className="text-yellow-400">{"★".repeat(t.rating||5)}</div></div></div></div>)}</div></div></section>
}
