"use client";
import {useEffect,useState} from "react";
import HeroSlider from "../components/home/HeroSlider";
import StatsBar from "../components/home/StatsBar";
import AboutPreview from "../components/home/AboutPreview";
import ServicesPreview from "../components/home/ServicesPreview";
import WhyUs from "../components/home/WhyUs";
import PortfolioPreview from "../components/home/PortfolioPreview";
import Testimonials from "../components/home/Testimonials";
import PricingPreview from "../components/home/PricingPreview";
import PartnersLogos from "../components/home/PartnersLogos";
import BlogPreview from "../components/home/BlogPreview";
import CtaSection from "../components/home/CtaSection";
import api from "../utils/api";
import useRealtime from "../hooks/useRealtime";
const orderMap={ hero:HeroSlider, stats:StatsBar, about:AboutPreview, services:ServicesPreview, whyus:WhyUs, portfolio:PortfolioPreview, testimonials:Testimonials, pricing:PricingPreview, partners:PartnersLogos, blog:BlogPreview, cta:CtaSection };
export default function Home(){
  const [sections,setSections]=useState([]);
  const [loading,setLoading]=useState(true);
  const fetchSections=()=> api.get("/sections").then(r=>setSections(r.data.sort((a,b)=>a.order-b.order))).catch(()=>setSections([])).finally(()=>setLoading(false));
  useEffect(()=>{fetchSections()},[]);
  useRealtime("sections:updated", fetchSections);
  if(loading) return <div className="py-20 text-center">جاري التحميل...</div>;
  const visible=sections.filter(s=>s.isVisible);
  const fallback=["hero","stats","about","services","whyus","portfolio","testimonials","pricing","partners","blog","cta"];
  const list= visible.length? visible.map(s=>s.key) : fallback;
  return <div>
    {list.map(key=>{ const Comp=orderMap[key]; return Comp ? <Comp key={key}/> : null; })}
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">تواصل معنا بسرعة</h3>
          <form onSubmit={async(e)=>{e.preventDefault(); const fd=new FormData(e.target); const body=Object.fromEntries(fd); await api.post('/messages', body); alert('تم الإرسال بنجاح'); e.target.reset(); }} className="space-y-3">
            <input name="name" placeholder="الاسم" required className="w-full border rounded-lg p-3"/>
            <input name="email" placeholder="البريد" type="email" required className="w-full border rounded-lg p-3"/>
            <textarea name="message" placeholder="رسالتك" required className="w-full border rounded-lg p-3 h-24"></textarea>
            <button className="btn-primary w-full">إرسال</button>
          </form>
        </div>
        <div className="space-y-4">
          <div className="card p-6 flex gap-4 items-center"><span className="w-10 h-10 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] grid place-items-center">📍</span><div><b>العنوان</b><p className="text-gray-500">الرياض - المملكة العربية السعودية</p></div></div>
          <div className="card p-6 flex gap-4 items-center"><span className="w-10 h-10 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] grid place-items-center">📞</span><div><b>الهاتف</b><p className="text-gray-500">+966 500 000 000</p></div></div>
          <div className="card p-6 flex gap-4 items-center"><span className="w-10 h-10 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] grid place-items-center">✉️</span><div><b>البريد</b><p className="text-gray-500">info@company.com</p></div></div>
        </div>
      </div>
    </section>
  </div>;
}
