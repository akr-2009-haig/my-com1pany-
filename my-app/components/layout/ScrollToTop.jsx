"use client";
import {useEffect,useState} from "react";
export default function ScrollToTop(){
  const [show,setShow]=useState(false);
  useEffect(()=>{ const onScroll=()=> setShow(window.scrollY>300); window.addEventListener("scroll",onScroll); return ()=>window.removeEventListener("scroll",onScroll); },[]);
  if(!show) return null;
  return <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-[#00BCD4] text-white grid place-items-center shadow hover:bg-[#00ACC1] z-50">↑</button>
}
