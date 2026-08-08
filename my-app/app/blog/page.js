"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import BlogCard from "../../components/shared/BlogCard"; import PageBanner from "../../components/shared/PageBanner";
export default function BlogPage(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{ api.get("/posts").then(r=>setPosts(r.data)).catch(()=>{}); },[]);
  return <div><PageBanner title="المدونة"/><div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">{posts.map(p=> <BlogCard key={p._id} post={p}/>)} {posts.length===0 && [1,2,3].map(i=><BlogCard key={i} post={{title:"مقال تجريبي "+i, excerpt:"مقتطف تجريبي للمقال...", category:{name:"تقنية"}, createdAt:new Date()}}/>)}</div></div>
}
