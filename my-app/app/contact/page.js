"use client";
import api from "../../utils/api"; import PageBanner from "../../components/shared/PageBanner";
export default function ContactPage(){
  return <div><PageBanner title="تواصل معنا"/><div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8"><form onSubmit={async(e)=>{e.preventDefault(); const fd=new FormData(e.target); await api.post('/messages', Object.fromEntries(fd)); alert('تم الإرسال');}} className="card p-6 space-y-3"><input name="name" placeholder="الاسم" required className="border w-full p-3 rounded-lg"/><input name="email" placeholder="البريد" className="border w-full p-3 rounded-lg"/><textarea name="message" placeholder="رسالتك" className="border w-full p-3 rounded-lg h-28"/><button className="btn-primary">إرسال</button></form><div className="card p-0 overflow-hidden h-[400px]"><iframe src="https://maps.google.com/maps?q=Riyadh&z=10&output=embed" className="w-full h-full border-0"/></div></div></div>
}
