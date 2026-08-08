"use client";
import {useState} from "react"; import {useRouter} from "next/navigation"; import api from "../../../utils/api";
export default function Login(){
  const [email,setEmail]=useState("admin@company.com"); const [password,setPassword]=useState("admin123"); const [err,setErr]=useState(""); const router=useRouter();
  const submit=async(e)=>{
    e.preventDefault(); setErr("");
    try{ const {data}=await api.post("/auth/login",{email,password}); localStorage.setItem("token",data.token); router.push("/Akramadmin"); }catch(ex){ setErr(ex.response?.data?.message||"فشل تسجيل الدخول"); }
  };
  return <div className="min-h-screen grid place-items-center bg-[#f0f2f5] p-4"><form onSubmit={submit} className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4"><div className="text-center"><h1 className="text-2xl font-bold">لوحة التحكم</h1><p className="text-gray-500">تسجيل الدخول</p></div>{err && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{err}</div>}<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="البريد" className="w-full border p-3 rounded-lg"/><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="كلمة المرور" className="w-full border p-3 rounded-lg"/><button className="btn-primary w-full">تسجيل الدخول</button><p className="text-xs text-gray-400 text-center">افتراضي: admin@company.com / admin123 (أنشئ المستخدم أول مرة عبر /api/auth/register)</p></form></div>
}
