"use client";
import { useEffect,useState } from "react";
import api from "../utils/api";
export default function useFetch(url){
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  useEffect(()=>{ api.get(url).then(r=>setData(r.data)).catch(e=>setError(e)).finally(()=>setLoading(false)); },[url]);
  return {data,loading,error};
}
