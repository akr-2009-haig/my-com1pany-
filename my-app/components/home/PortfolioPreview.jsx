"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import ProjectCard from "../shared/ProjectCard";
export default function PortfolioPreview(){
  const [projects,setProjects]=useState([]);
  useEffect(()=>{ api.get("/projects").then(r=> setProjects(r.data.filter(p=>p.isFeatured||p.isActive).slice(0,6))).catch(()=>{}); },[]);
  const list=projects.length?projects:[1,2,3,4,5,6].map(i=>({ _id:i,title:"مشروع "+i, category:{name:"مواقع"}, image:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600" }));
  return <section className="py-16 bg-[#f5f7fa]">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8"><p className="text-[#00BCD4]">أعمالنا</p><h2 className="text-3xl font-bold">أحدث المشاريع</h2></div>
      <div className="grid md:grid-cols-3 gap-6">{list.map(p=> <ProjectCard key={p._id} project={p}/>)}</div>
      <div className="text-center mt-8"><a href="/portfolio" className="btn-primary">جميع المشاريع</a></div>
    </div>
  </section>
}
