"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import ProjectCard from "../../components/shared/ProjectCard"; import PageBanner from "../../components/shared/PageBanner"; import FilterButtons from "../../components/shared/FilterButtons";
export default function PortfolioPage(){
  const [projects,setProjects]=useState([]); const [filter,setFilter]=useState("all");
  useEffect(()=>{ api.get("/projects").then(r=>setProjects(r.data)).catch(()=>{}); },[]);
  return <div><PageBanner title="أعمالنا"/><div className="max-w-7xl mx-auto px-4 py-8"><FilterButtons categories={["all","مواقع","تطبيقات"]} active={filter} onChange={setFilter}/><div className="grid md:grid-cols-3 gap-6 mt-8">{(projects.length?projects:[1,2,3,4,5,6].map(i=>({_id:i,title:"مشروع "+i})) ).map(p=> <ProjectCard key={p._id} project={p}/> )}</div></div></div>
}
