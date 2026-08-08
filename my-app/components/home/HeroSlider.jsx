"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import useRealtime from "../../hooks/useRealtime";
export default function HeroSlider(){
  const [slides,setSlides]=useState([]); const [idx,setIdx]=useState(0);
  const fetch=()=> api.get("/slides").then(r=> setSlides(r.data.filter(s=>s.isActive))).catch(()=>{});
  useEffect(()=>{fetch()},[]);
  useRealtime("slides:updated", fetch);
  useEffect(()=>{ if(slides.length===0) return; const t=setInterval(()=> setIdx(i=> (i+1)%slides.length),5000); return ()=>clearInterval(t); },[slides]);
  const list= slides.length? slides : [{_id:1,title:"نحول أفكارك إلى واقع رقمي",subtitle:"شريكك التقني الموثوق في رحلة التحول الرقمي",image:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600",btn1Text:"ابدأ مشروعك",btn1Link:"/quote",btn2Text:"شاهد أعمالنا",btn2Link:"/portfolio"}];
  const cur=list[idx]||list[0];
  return <section className="relative h-[90vh] overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{backgroundImage:`url(${cur.image})`}}/>
    <div className="absolute inset-0 bg-black/50"/>
    <div className="relative z-10 h-full grid place-items-center text-center text-white px-4">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-black mb-4">{cur.title}</h1>
        <p className="text-lg md:text-xl text-white/80 mb-8">{cur.subtitle}</p>
        <div className="flex gap-4 justify-center">
          <a href={cur.btn1Link||"/quote"} className="btn-primary">{cur.btn1Text||"ابدأ مشروعك"}</a>
          <a href={cur.btn2Link||"/portfolio"} className="border border-white text-white px-6 py-2.5 rounded-lg hover:bg-white hover:text-[#00BCD4] transition">{cur.btn2Text||"شاهد أعمالنا"}</a>
        </div>
      </div>
    </div>
    <button onClick={()=>setIdx((idx-1+list.length)%list.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white grid place-items-center">‹</button>
    <button onClick={()=>setIdx((idx+1)%list.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white grid place-items-center">›</button>
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">{list.map((_,i)=> <span key={i} className={`w-2.5 h-2.5 rounded-full ${i===idx?'bg-[#00BCD4]':'bg-white/50'}`}></span>)}</div>
  </section>
}
