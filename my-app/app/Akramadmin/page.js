"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api";
import StatsCard from "../../components/admin/ui/StatsCard";
import LineChart from "../../components/admin/charts/LineChart";
import PieChart from "../../components/admin/charts/PieChart";
export default function Dashboard(){
  const [stats,setStats]=useState({messages:12,quotes:7,posts:24,projects:18, visits:[120,190,150,210,180,230,200,250,220,280,260,300]});
  useEffect(()=>{ api.get("/analytics/overview").then(r=>setStats(s=>({...s,...r.data}))).catch(()=>{}); },[]);
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
    <div className="grid md:grid-cols-4 gap-4">
      <StatsCard title="إجمالي الزيارات" value="12,340" change="+12%" color="#00BCD4"/>
      <StatsCard title="الطلبات الجديدة" value={stats.quotes} change="+5%" color="#22c55e"/>
      <StatsCard title="الرسائل الجديدة" value={stats.messages} change="+8%" color="#f97316"/>
      <StatsCard title="المشاريع النشطة" value={stats.projects} change="+2%" color="#8b5cf6"/>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 card p-6"><h3 className="font-bold mb-4">الزيارات آخر 30 يوم</h3><LineChart data={stats.visits}/></div>
      <div className="card p-6"><h3 className="font-bold mb-4">توزيع الطلبات</h3><PieChart/></div>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card p-6"><h3 className="font-bold mb-3">آخر الطلبات</h3><div className="space-y-2 text-sm">{[1,2,3,4,5].map(i=><div key={i} className="flex justify-between border-b py-2"><span>عميل {i}</span><span className="text-gray-500">منذ {i} ساعة</span><span className="bg-blue-100 text-blue-600 px-2 rounded text-xs">جديد</span></div>)}</div></div>
      <div className="card p-6"><h3 className="font-bold mb-3">آخر الرسائل</h3><div className="space-y-2 text-sm">{[1,2,3,4,5].map(i=><div key={i} className="flex gap-2 border-b py-2"><span className="w-2 h-2 bg-[#00BCD4] rounded-full mt-2"></span><div><b>مرسل {i}</b><p className="text-gray-500 text-xs">مقتطف رسالة تجريبية...</p></div></div>)}</div></div>
    </div>
  </div>
}
