"use client";
import {useEffect,useState} from "react";
export default function AdminNavbar(){
  return <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-30">
    <h2 className="font-bold">لوحة التحكم</h2>
    <div className="flex items-center gap-4">
      <span className="relative">🔔<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full grid place-items-center">3</span></span>
      <span>✉️</span>
      <a href="/" target="_blank" className="text-sm text-[#00BCD4]">زيارة الموقع ↗</a>
      <img src="https://i.pravatar.cc/100" alt="admin" className="w-8 h-8 rounded-full"/>
      <button onClick={()=>{localStorage.removeItem("token"); location.href="/Akramadmin/login"}} className="text-sm text-red-500">خروج</button>
    </div>
  </header>
}
