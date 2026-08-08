"use client";
import Link from "next/link"; import {usePathname} from "next/navigation"; import {useState} from "react";
const menu=[
  {label:"لوحة المعلومات",href:"/Akramadmin",icon:"📊"},
  {label:"السلايدر",href:"/Akramadmin/hero",icon:"🖼️"},
  {label:"الإحصائيات",href:"/Akramadmin/stats",icon:"📈"},
  {label:"الخدمات",href:"/Akramadmin/services",icon:"🛠️"},
  {label:"معرض الأعمال",href:"/Akramadmin/portfolio",icon:"💼"},
  {label:"الباقات",href:"/Akramadmin/packages",icon:"💰"},
  {label:"المدونة",href:"/Akramadmin/blog",icon:"📰"},
  {label:"الرسائل",href:"/Akramadmin/messages",icon:"✉️"},
  {label:"عروض الأسعار",href:"/Akramadmin/quotes",icon:"📩"},
  {label:"الوظائف",href:"/Akramadmin/jobs",icon:"👥"},
  {label:"الفريق",href:"/Akramadmin/team",icon:"👨‍💼"},
  {label:"الشركاء",href:"/Akramadmin/partners",icon:"🤝"},
  {label:"الأسئلة الشائعة",href:"/Akramadmin/faq",icon:"❓"},
  {label:"القوائم",href:"/Akramadmin/menus",icon:"☰"},
  {label:"الإعدادات",href:"/Akramadmin/settings",icon:"⚙️"},
  {label:"المستخدمين",href:"/Akramadmin/users",icon:"👤"},
  {label:"التقارير",href:"/Akramadmin/analytics",icon:"📊"},
];
export default function AdminSidebar(){
  const pathname=usePathname(); const [collapsed,setCollapsed]=useState(false);
  return <aside className={`${collapsed?"w-16":"w-64"} bg-[#1a1a2e] text-white flex flex-col transition-all duration-300 min-h-screen`}>
    <div className="p-4 flex justify-between items-center border-b border-white/10">
      {!collapsed && <span className="font-black">MyCompany Admin</span>}
      <button onClick={()=>setCollapsed(!collapsed)} className="text-white/70">≡</button>
    </div>
    <nav className="flex-1 overflow-auto py-2">
      {menu.map(m=>{
        const active=pathname===m.href;
        return <Link key={m.href} href={m.href} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${active?"bg-[#00BCD4]/20 text-white border-r-4 border-[#00BCD4]":"text-white/70 hover:bg-white/10"} `}>
          <span>{m.icon}</span>{!collapsed && <span>{m.label}</span>}
        </Link>
      })}
    </nav>
  </aside>
}
