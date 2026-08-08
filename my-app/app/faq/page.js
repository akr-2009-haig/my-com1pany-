"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import PageBanner from "../../components/shared/PageBanner";
export default function FaqPage(){
  const [faqs,setFaqs]=useState([]); const [open,setOpen]=useState(null);
  useEffect(()=>{ api.get('/faq').then(r=>setFaqs(r.data)).catch(()=>{}); },[]);
  const list= faqs.length? faqs : [{_id:1,question:"ما هي مدة تنفيذ المشروع؟",answer:"تختلف حسب حجم المشروع عادة 2-4 أسابيع."},{_id:2,question:"هل تقدمون دعم فني؟",answer:"نعم دعم فني 24/7."}];
  return <div><PageBanner title="الأسئلة الشائعة"/><div className="max-w-3xl mx-auto px-4 py-12 space-y-3">{list.map(item=> <div key={item._id} className="border rounded-xl overflow-hidden"><button onClick={()=> setOpen(open===item._id?null:item._id)} className={`w-full text-right p-4 flex justify-between items-center ${open===item._id?'bg-[#00BCD4]/10':''}`}><span>{item.question}</span><span>{open===item._id?'▲':'▼'}</span></button>{open===item._id && <div className="p-4 bg-gray-50 text-gray-600">{item.answer}</div>}</div>)}</div></div>
}
