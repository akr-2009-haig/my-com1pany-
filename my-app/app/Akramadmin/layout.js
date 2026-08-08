"use client";
import {useEffect,useState} from "react";
import AdminSidebar from "../../components/admin/layout/AdminSidebar";
import AdminNavbar from "../../components/admin/layout/AdminNavbar";
import {useRouter,usePathname} from "next/navigation";
export default function AdminLayout({children}){
  const router=useRouter(); const pathname=usePathname();
  const [checked,setChecked]=useState(false);
  useEffect(()=>{
    if(pathname==="/Akramadmin/login"){ setChecked(true); return; }
    const t=localStorage.getItem("token");
    if(!t) router.replace("/Akramadmin/login");
    else setChecked(true);
  },[pathname]);
  if(!checked) return <div className="p-8 text-center">جاري التحقق...</div>;
  if(pathname==="/Akramadmin/login") return <>{children}</>;
  return <div className="min-h-screen bg-[#f0f2f5] flex"><AdminSidebar/><div className="flex-1 flex flex-col min-w-0"><AdminNavbar/><main className="p-6">{children}</main></div></div>;
}
