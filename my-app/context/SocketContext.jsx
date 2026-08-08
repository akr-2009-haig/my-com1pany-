"use client";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
export const SocketContext=createContext(null);
export function SocketProvider({children}){
  const [socket,setSocket]=useState(null);
  useEffect(()=>{
    const s=io(process.env.NEXT_PUBLIC_SOCKET_URL||window.location.origin,{ transports:["websocket","polling"] });
    setSocket(s);
    return ()=> s.disconnect();
  },[]);
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
