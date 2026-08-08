"use client";
import { createContext, useEffect, useState } from "react";
import api from "../utils/api";
export const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    const token=typeof window!=='undefined' ? localStorage.getItem('token'):null;
    if(!token){ setLoading(false); return; }
    api.get('/auth/me').then(r=>setUser(r.data)).catch(()=>{ localStorage.removeItem('token'); }).finally(()=>setLoading(false));
  },[]);
  const login=async(email,password)=>{
    const {data}=await api.post('/auth/login',{email,password});
    localStorage.setItem('token',data.token); setUser(data.user); return data;
  };
  const logout=()=>{ localStorage.removeItem('token'); setUser(null); };
  return <AuthContext.Provider value={{user,loading,login,logout,setUser}}>{children}</AuthContext.Provider>
}
