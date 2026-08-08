"use client";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
export const AdminSocketContext=createContext(null);
export function AdminSocketProvider({children}){
  const [socket,setSocket]=useState(null);
  useEffect(()=>{
    const s=io(process.env.NEXT_PUBLIC_SOCKET_URL||window.location.origin,{ transports:["websocket","polling"] });
    setSocket(s);
    return ()=> s.disconnect();
  },[]);
  return <AdminSocketContext.Provider value={socket}>{children}</AdminSocketContext.Provider>
}
