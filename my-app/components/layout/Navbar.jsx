"use client";
import {useState,useEffect} from "react"; import Link from "next/link"; import api from "../../utils/api";
export default function Navbar(){
  const [open,setOpen]=useState(false); const [menus,setMenus]=useState([]);
  useEffect(()=>{ api.get("/menus").then(r=> setMenus(r.data)).catch(()=>{}); },[]);
  const links = menus.length? menus : [{title:"الرئيسية",url:"/"},{title:"من نحن",url:"/about"},{title:"الخدمات",url:"/services"},{title:"معرض الأعمال",url:"/portfolio"},{title:"الباقات",url:"/pricing"},{title:"المدونة",url:"/blog"},{title:"الوظائف",url:"/careers"},{title:"تواصل معنا",url:"/contact"}];
  return <nav className="bg-white shadow-sm sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <Link href="/" className="font-black text-xl text-[#00BCD4]">MyCompany</Link>
      <div className="hidden md:flex gap-6 items-center">
        {links.map(l=> <Link key={l.url} href={l.url} className="text-[#333] hover:text-[#00BCD4] font-medium relative group">{l.title}<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00BCD4] group-hover:w-full transition-all"></span></Link>)}
        <Link href="/quote" className="btn-primary text-sm">اطلب عرض سعر</Link>
        <button className="text-sm">🌐 عربي</button>
      </div>
      <button onClick={()=>setOpen(!open)} className="md:hidden text-[#00BCD4] text-2xl">☰</button>
    </div>
    {open && <div className="md:hidden bg-white border-t p-4 space-y-3">{links.map(l=> <Link key={l.url} href={l.url} className="block py-2">{l.title}</Link>)}<Link href="/quote" className="btn-primary block text-center">اطلب عرض سعر</Link></div>}
  </nav>
}
