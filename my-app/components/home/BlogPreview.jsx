"use client";
import {useEffect,useState} from "react"; import api from "../../utils/api"; import BlogCard from "../shared/BlogCard";
export default function BlogPreview(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{ api.get("/posts").then(r=> setPosts(r.data.slice(0,3))).catch(()=>{}); },[]);
  const list=posts.length?posts:[1,2,3].map(i=>({ _id:i,title:"مقال تجريبي "+i, excerpt:"مقتطف تجريبي يوضح محتوى المقال بشكل مختصر وجذاب.", image:"https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600", category:{name:"تقنية"}, createdAt:new Date() }));
  return <section className="py-16 bg-[#f5f7fa]"><div className="max-w-7xl mx-auto px-4"><h2 className="text-3xl font-bold text-center mb-8">أحدث المقالات</h2><div className="grid md:grid-cols-3 gap-6">{list.map(p=> <BlogCard key={p._id} post={p}/>)}</div><div className="text-center mt-8"><a href="/blog" className="btn-primary">جميع المقالات</a></div></div></section>
}
